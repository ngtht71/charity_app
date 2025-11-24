import { ethers } from "hardhat";

async function main() {

  const CharityRegistry = await ethers.getContractFactory("CharityRegistry");
  const charityRegistry = await CharityRegistry.deploy();

  await charityRegistry.deployed();

  console.log(`CharityRegistry has been deployed to ${charityRegistry.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
