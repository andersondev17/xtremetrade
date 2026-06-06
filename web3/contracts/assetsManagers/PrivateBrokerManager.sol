pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IAssetManager} from "./IAssetManager.sol";

contract PrivateBrokerManager is IAssetManager, Ownable {
    using SafeERC20 for IERC20;

    address public immutable override paymentToken;
    mapping(address => bool) public supportedAsset;
    mapping(address => bool) public authorizedDesk;

    uint256 public feeBps;
    uint256 public stablePerAssetE18;

    error NotAuthorizedDesk();
    error AssetNotSupported();
    error Slippage();
    error BadPrice();

    constructor(address paymentToken_, uint256 stablePerAssetE18_, uint256 feeBps_, address initialOwner)
        Ownable(initialOwner)
    {
        if (stablePerAssetE18_ == 0) revert BadPrice();
        paymentToken = paymentToken_;
        stablePerAssetE18 = stablePerAssetE18_;
        feeBps = feeBps_;
    }

    function setAuthorizedDesk(address desk, bool authorized) external onlyOwner {
        authorizedDesk[desk] = authorized;
    }

    function setSupportedAsset(address assetToken, bool supported) external onlyOwner {
        supportedAsset[assetToken] = supported;
    }

    function setFeeBps(uint256 feeBps_) external onlyOwner {
        feeBps = feeBps_;
    }

    function setStablePerAssetE18(uint256 stablePerAssetE18_) external onlyOwner {
        if (stablePerAssetE18_ == 0) revert BadPrice();
        stablePerAssetE18 = stablePerAssetE18_;
    }

    function buy(address assetToken, uint256 paymentAmountIn, uint256 minAssetOut)
        external
        override
        returns (uint256 assetOut)
    {
        if (!authorizedDesk[msg.sender]) revert NotAuthorizedDesk();
        if (!supportedAsset[assetToken]) revert AssetNotSupported();

        uint256 grossAssetOut = (paymentAmountIn * 1e18) / stablePerAssetE18;
        uint256 fee = (grossAssetOut * feeBps) / 10_000;
        assetOut = grossAssetOut - fee;

        if (assetOut < minAssetOut) revert Slippage();

        IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), paymentAmountIn);
        IERC20(assetToken).safeTransfer(msg.sender, assetOut);
    }

    function sell(address assetToken, uint256 assetAmountIn, uint256 minPaymentOut)
        external
        override
        returns (uint256 paymentOut)
    {
        if (!authorizedDesk[msg.sender]) revert NotAuthorizedDesk();
        if (!supportedAsset[assetToken]) revert AssetNotSupported();

        uint256 grossPaymentOut = (assetAmountIn * stablePerAssetE18) / 1e18;
        uint256 fee = (grossPaymentOut * feeBps) / 10_000;
        paymentOut = grossPaymentOut - fee;

        if (paymentOut < minPaymentOut) revert Slippage();

        IERC20(assetToken).safeTransferFrom(msg.sender, address(this), assetAmountIn);
        IERC20(paymentToken).safeTransfer(msg.sender, paymentOut);
    }
}

