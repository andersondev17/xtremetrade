const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer, investor } = await getNamedAccounts()

    log("----------------------------------------------------")

    const mockUsdc = await deploy("MockUSDC", {
        from: deployer,
        contract: "MockERC20Mintable",
        args: ["Mock USDC", "mUSDC", 6, deployer],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    const mockCrypto = await deploy("MockCryptoAsset", {
        from: deployer,
        contract: "MockERC20Mintable",
        args: ["Mock Crypto Asset", "mCRYPTO", 18, deployer],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    const mockStock = await deploy("MockStockAsset", {
        from: deployer,
        contract: "MockERC20Mintable",
        args: ["Mock Stock Asset", "mSTOCK", 18, deployer],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    const uniswapManager = await deploy("MockUniswapLikeManager", {
        from: deployer,
        args: [mockUsdc.address, ethers.parseUnits("2", 6), 30, deployer],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    const privateBroker = await deploy("PrivateBrokerManager", {
        from: deployer,
        args: [mockUsdc.address, ethers.parseUnits("5", 6), 50, deployer],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    const internalSystem = await deploy("InternalSystem", {
        from: deployer,
        args: [mockUsdc.address, deployer],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    const usdc = await ethers.getContractAt("MockERC20Mintable", mockUsdc.address)
    const crypto = await ethers.getContractAt("MockERC20Mintable", mockCrypto.address)
    const stock = await ethers.getContractAt("MockERC20Mintable", mockStock.address)

    const uni = await ethers.getContractAt("MockUniswapLikeManager", uniswapManager.address)
    const broker = await ethers.getContractAt("PrivateBrokerManager", privateBroker.address)
    const system = await ethers.getContractAt("InternalSystem", internalSystem.address)

    await (await uni.setSupportedAsset(crypto.target, true)).wait()
    await (await broker.setSupportedAsset(stock.target, true)).wait()
    await (await broker.setAuthorizedDesk(system.target, true)).wait()

    await (await system.setAllowedTarget(uni.target, true)).wait()
    await (await system.setAllowedTarget(broker.target, true)).wait()

    await (await usdc.mint(investor, ethers.parseUnits("10000", 6))).wait()

    await (await usdc.mint(uni.target, ethers.parseUnits("2000000", 6))).wait()
    await (await usdc.mint(broker.target, ethers.parseUnits("2000000", 6))).wait()

    await (await crypto.mint(uni.target, ethers.parseUnits("500000", 18))).wait()
    await (await stock.mint(broker.target, ethers.parseUnits("500000", 18))).wait()

    if (!developmentChains.includes(network.name)) {
        log("Skipping verification in this template")
    }
}

module.exports.tags = ["all", "xtreme"]
