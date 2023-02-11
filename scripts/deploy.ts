import { ethers } from "hardhat";

async function main() {
  const Library = await ethers.getContractFactory('Library');
  const library = await Library.deploy();
  await library.deployed();
  console.log("You deploy library contract to this address", library.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
