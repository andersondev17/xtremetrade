pragma solidity ^0.8.24;

interface IAssetManager {
    function paymentToken() external view returns (address);

    function buy(address assetToken, uint256 paymentAmountIn, uint256 minAssetOut) external returns (uint256 assetOut);

    function sell(address assetToken, uint256 assetAmountIn, uint256 minPaymentOut) external returns (uint256 paymentOut);
}

