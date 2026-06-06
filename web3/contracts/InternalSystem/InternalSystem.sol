pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IAssetManager} from "../assetsManagers/IAssetManager.sol";

contract InternalSystem is Ownable {
    using SafeERC20 for IERC20;

    struct Balances {
        uint256 free;
        uint256 got;
        uint256 sold;
        uint256 out;
    }

    IERC20 public immutable paymentToken;

    mapping(address => Balances) private _balances;
    mapping(address => mapping(address => uint256)) private _positions;
    mapping(address => bool) public allowedTarget;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event SoldToFree(address indexed user, uint256 amount);
    event TargetAllowed(address indexed target, bool allowed);
    event Execute(
        address indexed user,
        address indexed target,
        bytes4 indexed selector,
        uint256 value
    );
    event Bought(
        address indexed user,
        address indexed manager,
        address indexed assetToken,
        uint256 paymentIn,
        uint256 assetOut
    );
    event Sold(
        address indexed user,
        address indexed manager,
        address indexed assetToken,
        uint256 assetIn,
        uint256 paymentOut
    );

    error TargetNotAllowed();
    error NotOwnerForGenericExecute();
    error InsufficientFree();
    error InsufficientPosition();
    error OnlyZeroValue();
    error BadCalldata();
    error CallFailed(bytes reason);

    constructor(address paymentToken_, address initialOwner) Ownable(initialOwner) {
        paymentToken = IERC20(paymentToken_);
    }

    function balancesOf(address user) external view returns (Balances memory) {
        return _balances[user];
    }

    function positionOf(address user, address assetToken) external view returns (uint256) {
        return _positions[user][assetToken];
    }

    function setAllowedTarget(address target, bool allowed) external onlyOwner {
        allowedTarget[target] = allowed;
        emit TargetAllowed(target, allowed);
    }

    function deposit(uint256 amount) external {
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        _balances[msg.sender].free += amount;
        emit Deposited(msg.sender, amount);
    }

    function moveSoldToFree(uint256 amount) external {
        Balances storage b = _balances[msg.sender];
        if (b.sold < amount) revert InsufficientFree();
        unchecked {
            b.sold -= amount;
            b.free += amount;
        }
        emit SoldToFree(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        Balances storage b = _balances[msg.sender];
        if (b.free < amount) revert InsufficientFree();
        unchecked {
            b.free -= amount;
            b.out += amount;
        }
        paymentToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external returns (bytes memory result) {
        if (!allowedTarget[target]) revert TargetNotAllowed();
        if (value != 0) revert OnlyZeroValue();
        if (data.length < 4) revert BadCalldata();

        bytes4 selector = bytes4(data[:4]);
        emit Execute(msg.sender, target, selector, value);

        if (selector == IAssetManager.buy.selector) {
            (address assetToken, uint256 paymentIn, uint256 minAssetOut) = abi.decode(
                data[4:],
                (address, uint256, uint256)
            );
            _buy(msg.sender, target, assetToken, paymentIn, minAssetOut);
            return abi.encode(_positions[msg.sender][assetToken]);
        }

        if (selector == IAssetManager.sell.selector) {
            (address assetToken, uint256 assetIn, uint256 minPaymentOut) = abi.decode(
                data[4:],
                (address, uint256, uint256)
            );
            _sell(msg.sender, target, assetToken, assetIn, minPaymentOut);
            return abi.encode(_balances[msg.sender].sold);
        }

        if (msg.sender != owner()) revert NotOwnerForGenericExecute();
        (bool ok, bytes memory ret) = target.call{value: value}(data);
        if (!ok) revert CallFailed(ret);
        return ret;
    }

    function _buy(
        address user,
        address manager,
        address assetToken,
        uint256 paymentIn,
        uint256 minAssetOut
    ) internal {
        Balances storage b = _balances[user];
        if (b.free < paymentIn) revert InsufficientFree();

        unchecked {
            b.free -= paymentIn;
            b.got += paymentIn;
        }

        _approveIfNeeded(paymentToken, manager, paymentIn);

        bytes memory callData = abi.encodeCall(
            IAssetManager.buy,
            (assetToken, paymentIn, minAssetOut)
        );
        (bool ok, bytes memory ret) = manager.call(callData);
        if (!ok) revert CallFailed(ret);

        uint256 assetOut = abi.decode(ret, (uint256));
        _positions[user][assetToken] += assetOut;

        emit Bought(user, manager, assetToken, paymentIn, assetOut);
    }

    function _sell(
        address user,
        address manager,
        address assetToken,
        uint256 assetIn,
        uint256 minPaymentOut
    ) internal {
        uint256 current = _positions[user][assetToken];
        if (current < assetIn) revert InsufficientPosition();

        unchecked {
            _positions[user][assetToken] = current - assetIn;
        }

        _approveIfNeeded(IERC20(assetToken), manager, assetIn);

        bytes memory callData = abi.encodeCall(
            IAssetManager.sell,
            (assetToken, assetIn, minPaymentOut)
        );
        (bool ok, bytes memory ret) = manager.call(callData);
        if (!ok) revert CallFailed(ret);

        uint256 paymentOut = abi.decode(ret, (uint256));

        Balances storage b = _balances[user];
        b.sold += paymentOut;
        if (b.got >= paymentOut) {
            unchecked {
                b.got -= paymentOut;
            }
        } else {
            b.got = 0;
        }

        emit Sold(user, manager, assetToken, assetIn, paymentOut);
    }

    function _approveIfNeeded(IERC20 token, address spender, uint256 amount) internal {
        uint256 allowance = token.allowance(address(this), spender);
        if (allowance >= amount) return;

        if (allowance != 0) {
            token.forceApprove(spender, 0);
        }
        token.forceApprove(spender, type(uint256).max);
    }
}
