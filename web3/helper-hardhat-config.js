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
        erc20: "",
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
