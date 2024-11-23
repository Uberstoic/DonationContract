require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const donationAddress = "<CONTRACT_ADDRESS>";
  const donation = await ethers.getContractAt("Donation", donationAddress);

  const tx = await donation.withdraw("<RECIPIENT_ADDRESS>", ethers.utils.parseEther("1"));
  await tx.wait();

  console.log("Funds withdrawn successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
