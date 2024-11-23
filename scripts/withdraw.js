require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    const donationAddress = "0xC0ff20Af36De6a1ACA098e6c7e8C9a17362b54cC";
    const donation = await ethers.getContractAt("Donation", donationAddress);

    const recipientAddress = process.env.RECIPIENT_ADDRESS;
    if (!recipientAddress) {
      throw new Error("RECIPIENT_ADDRESS not set in environment variables");
    }

    // Validate recipient address
    if (!ethers.isAddress(recipientAddress)) {
      throw new Error("Invalid recipient address");
    }
    if (recipientAddress === ethers.ZeroAddress) {
      throw new Error("Cannot withdraw to zero address");
    }

    const amount = ethers.parseEther("1");
    
    // Check contract balance
    const balance = await ethers.provider.getBalance(donationAddress);
    if (balance < amount) {
      throw new Error(`Insufficient contract balance. Available: ${ethers.formatEther(balance)} ETH`);
    }

    console.log("Sending withdrawal transaction...");
    const tx = await donation.withdraw(recipientAddress, amount);
    
    console.log("Transaction sent! Waiting for confirmation...");
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("Funds withdrawn successfully!");
      console.log("Amount:", ethers.formatEther(amount), "ETH");
      console.log("Recipient:", recipientAddress);
      console.log("Gas used:", receipt.gasUsed.toString());
    } else {
      console.error("Transaction failed!");
    }
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error("Error: Insufficient funds for gas");
    } else if (error.code === 'NETWORK_ERROR') {
      console.error("Error: Network connection issue. Please check your connection");
    } else if (error.code === 'CALL_EXCEPTION') {
      console.error("Error: Contract call failed. Make sure you are the contract owner");
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
