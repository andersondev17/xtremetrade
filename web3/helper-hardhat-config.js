const networkConfig = {
    default: {
        name: "hardhat",
        erc20: "0x0000000000000000000000000000000000000000",
    },
    31337: {
        name: "localhost",
        erc20: "0x0000000000000000000000000000000000000000",
    },
    10143: {
        name: "monadTestnet",
        erc20: "0x9BCA65032487b065a5285d01a3562648B5C390e4",
        xtreme: {
            paymentToken: "0x9BCA65032487b065a5285d01a3562648B5C390e4",
            internalSystem: "0xB538Ffe77b1f836a604a8a40a4eDc98CFCD99690",
            uniswapManager: "0x67Aa88Bf7A60Db45f946fcde49fB414Abb63fc68",
            privateBroker: "0xACe4A7157C7AF24D7fbD83FcE03d5312EA5d1E72",
            cryptoAsset: "0x93EE26b87E5B362674Ad89aDF39b8aBC4EC49Ffb",
            stockAsset: "0x4c73836d41B24b6c500c0c808B94a09DC046bbfF",
        },
    },
    143: {
        name: "monadMainnet",
        erc20: "",
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 2
const frontEndContractsFile = "../hooks/contracts/contracts.json"
const frontEndAbiLocation = "../hooks/contracts"

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    frontEndContractsFile,
    frontEndAbiLocation,
}
