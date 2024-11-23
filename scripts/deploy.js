require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const Donation = await ethers.getContractFactory("Donation");
  const donation = await Donation.deploy();
  await donation.deployed();

  console.log("Donation contract deployed to:", donation.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
