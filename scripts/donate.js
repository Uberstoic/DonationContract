require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const donationAddress = "0xC0ff20Af36De6a1ACA098e6c7e8C9a17362b54cC";
  const donation = await ethers.getContractAt("Donation", donationAddress);

  const tx = await donation.donate({ value: ethers.utils.parseEther("1") });
  await tx.wait();

  console.log("Donation made successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
