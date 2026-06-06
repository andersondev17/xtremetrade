const hre = require("hardhat")
const { ethers, getNamedAccounts, network } = hre
const { networkConfig } = require("../helper-hardhat-config")

const keyTypes = {
    MANAGEMENT_KEY: 1, // Permite añadir/eliminar otras claves y reclamos
    ACTION_KEY: 2,     // Permite ejecutar transacciones (Proxy)
    CLAIM_SIGNER_KEY: 3,   // Permite firmar reclamos
}

async function main() {
    const { deployer, investor, entity } = await getNamedAccounts()

    const chainId = network.config.chainId
}