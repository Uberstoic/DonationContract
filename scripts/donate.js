require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    const donationAddress = "0xC0ff20Af36De6a1ACA098e6c7e8C9a17362b54cC";
    const donation = await ethers.getContractAt("Donation", donationAddress);

    console.log("Sending donation transaction...");
    const tx = await donation.donate({ value: ethers.parseEther("1") });
    
    console.log("Transaction sent! Waiting for confirmation...");
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("Donation made successfully!");
      console.log("Gas used:", receipt.gasUsed.toString());
    } else {
      console.error("Transaction failed!");
    }
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error("Error: Insufficient funds to make the donation");
    } else if (error.code === 'NETWORK_ERROR') {
      console.error("Error: Network connection issue. Please check your connection");
    } else {
      console.error("Error:", error.message || "Unknown error occurred");
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exitCode = 1;
});
