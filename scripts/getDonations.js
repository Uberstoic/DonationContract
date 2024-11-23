require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    const donationAddress = "0x3671771eF1E53d6367F36521B0297ec2E4CA296E";
    const donation = await ethers.getContractAt("Donation", donationAddress);

    // Get donor address from command line arguments or environment variable
    const donorAddress = process.argv[2] || process.env.DONOR_ADDRESS;
    if (!donorAddress) {
      throw new Error("Please provide a donor address as argument or set DONOR_ADDRESS in .env file");
    }

    // Validate address
    if (!ethers.isAddress(donorAddress)) {
      throw new Error("Invalid donor address provided");
    }

    console.log(`Fetching donations for address: ${donorAddress}`);
    const donationAmount = await donation.getDonations(donorAddress);
    
    console.log("\nDonation Information:");
    console.log("--------------------");
    console.log(`Address: ${donorAddress}`);
    console.log(`Total donations: ${ethers.formatEther(donationAmount)} ETH`);

  } catch (error) {
    console.error("Error:", error.message || "Unknown error occurred");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exitCode = 1;
});
