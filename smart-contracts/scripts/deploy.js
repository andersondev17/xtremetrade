const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SignalVerifier...");

  const SignalVerifier = await ethers.getContractFactory("SignalVerifier");
  const contract = await SignalVerifier.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SignalVerifier deployed to:", address);
  console.log("Agregar al .env del backend: CONTRACT_ADDRESS=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});