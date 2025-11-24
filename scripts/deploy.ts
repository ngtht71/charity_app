import { ethers, run } from "hardhat";

async function main() {

  const CharityRegistry = await ethers.getContractFactory("CharityRegistry");
  const charityRegistry = await CharityRegistry.deploy();

  await charityRegistry.deployed();

  console.log(`CharityRegistry has been deployed to ${charityRegistry.address}`);

  // Copy ABI file to the frontend
  console.log("Copying ABI to frontend...");
  await run("copy-abis");
  console.log("ABI copied successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
