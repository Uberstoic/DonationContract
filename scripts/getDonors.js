require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    const donationAddress = "0x3671771eF1E53d6367F36521B0297ec2E4CA296E";
    const donation = await ethers.getContractAt("Donation", donationAddress);

    console.log("Fetching donors list...");
    const donors = await donation.getDonors();
    
    console.log("\nList of all donors:");
    console.log("-------------------");
    for (let i = 0; i < donors.length; i++) {
      console.log(`${i + 1}. ${donors[i]}`);
    }
    console.log(`\nTotal number of unique donors: ${donors.length}`);

  } catch (error) {
    console.error("Error:", error.message || "Unknown error occurred");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exitCode = 1;
});
