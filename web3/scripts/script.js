const hre = require("hardhat")
const { deployments, ethers, getNamedAccounts } = hre

async function main() {
    const { deployer, investor } = await getNamedAccounts()

    await deployments.fixture(["xtreme"])

    const investorSigner = await ethers.getSigner(investor)

    const usdcDeployment = await deployments.get("MockUSDC")
    const cryptoDeployment = await deployments.get("MockCryptoAsset")
    const stockDeployment = await deployments.get("MockStockAsset")
    const uniDeployment = await deployments.get("MockUniswapLikeManager")
    const brokerDeployment = await deployments.get("PrivateBrokerManager")
    const systemDeployment = await deployments.get("InternalSystem")

    const usdc = await ethers.getContractAt("MockERC20Mintable", usdcDeployment.address)
    const system = await ethers.getContractAt("InternalSystem", systemDeployment.address)
    const uni = await ethers.getContractAt("MockUniswapLikeManager", uniDeployment.address)
    const broker = await ethers.getContractAt("PrivateBrokerManager", brokerDeployment.address)

    const depositAmount = ethers.parseUnits("1000", 6)
    await (await usdc.connect(investorSigner).approve(system.target, depositAmount)).wait()
    await (await system.connect(investorSigner).deposit(depositAmount)).wait()

    console.log("Balances after deposit:", await system.balancesOf(investor))

    const buyCryptoData = uni.interface.encodeFunctionData("buy", [
        cryptoDeployment.address,
        ethers.parseUnits("600", 6),
        ethers.parseUnits("280", 18),
    ])

    await (await system.connect(investorSigner).execute(uni.target, 0, buyCryptoData)).wait()

    console.log("Balances after buy crypto:", await system.balancesOf(investor))
    console.log("Crypto position:", (await system.positionOf(investor, cryptoDeployment.address)).toString())

    const buyStockData = broker.interface.encodeFunctionData("buy", [
        stockDeployment.address,
        ethers.parseUnits("200", 6),
        ethers.parseUnits("35", 18),
    ])

    await (await system.connect(investorSigner).execute(broker.target, 0, buyStockData)).wait()

    console.log("Balances after buy stock:", await system.balancesOf(investor))
    console.log("Stock position:", (await system.positionOf(investor, stockDeployment.address)).toString())

    const cryptoSellAmount = ethers.parseUnits("100", 18)
    const sellCryptoData = uni.interface.encodeFunctionData("sell", [
        cryptoDeployment.address,
        cryptoSellAmount,
        ethers.parseUnits("180", 6),
    ])

    await (await system.connect(investorSigner).execute(uni.target, 0, sellCryptoData)).wait()

    console.log("Balances after sell crypto:", await system.balancesOf(investor))
    console.log("Crypto position:", (await system.positionOf(investor, cryptoDeployment.address)).toString())

    const toFree = ethers.parseUnits("100", 6)
    await (await system.connect(investorSigner).moveSoldToFree(toFree)).wait()

    console.log("Balances after moveSoldToFree:", await system.balancesOf(investor))

    const withdrawAmount = ethers.parseUnits("50", 6)
    await (await system.connect(investorSigner).withdraw(withdrawAmount)).wait()

    console.log("Balances after withdraw:", await system.balancesOf(investor))
    console.log("Investor USDC wallet:", (await usdc.balanceOf(investor)).toString())
    console.log("System USDC:", (await usdc.balanceOf(system.target)).toString())
    console.log("Uniswap manager USDC:", (await usdc.balanceOf(uni.target)).toString())
    console.log("Broker manager USDC:", (await usdc.balanceOf(broker.target)).toString())
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
