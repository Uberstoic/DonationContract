require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const Donation = await ethers.getContractFactory("Donation");
  const donation = await Donation.deploy();

  console.log("Donation contract deployed to:", await donation.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
