const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = ethers;

describe("Donation Contract", function () {
  let Donation, donation, owner, addr1, addr2;

  beforeEach(async function () {
    Donation = await ethers.getContractFactory("Donation");
    [owner, addr1, addr2] = await ethers.getSigners();
    donation = await Donation.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await donation.owner()).to.equal(owner.address);
    });

    it("Should initialize with empty donors list", async function () {
      expect((await donation.getDonors()).length).to.equal(0);
    });
  });

  describe("Donations", function () {
    it("Should allow donations and track donors", async function () {
      await donation.connect(addr1).donate({ value: parseEther("1") });
      await donation.connect(addr2).donate({ value: parseEther("2") });

      expect(await donation.getDonations(addr1.address)).to.equal(parseEther("1"));
      expect(await donation.getDonations(addr2.address)).to.equal(parseEther("2"));
      expect(await donation.getDonors()).to.include(addr1.address);
      expect(await donation.getDonors()).to.include(addr2.address);
      expect(await ethers.provider.getBalance(await donation.getAddress())).to.equal(parseEther("3"));
    });

    it("Should accumulate donations from the same donor", async function () {
      await donation.connect(addr1).donate({ value: parseEther("1") });
      await donation.connect(addr1).donate({ value: parseEther("1") });
      expect(await donation.getDonations(addr1.address)).to.equal(parseEther("2"));
    });

    it("Should not add duplicate donors", async function () {
      await donation.connect(addr1).donate({ value: parseEther("1") });
      await donation.connect(addr1).donate({ value: parseEther("1") });
      const donors = await donation.getDonors();
      expect(donors.length).to.equal(1);
      expect(donors[0]).to.equal(addr1.address);
    });

    it("Should not allow zero donations", async function () {
      await expect(
        donation.connect(addr1).donate({ value: parseEther("0") })
      ).to.be.revertedWith("Donation must be greater than 0");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await donation.connect(addr1).donate({ value: parseEther("3") });
    });

    it("Should allow owner to withdraw funds", async function () {
      await expect(() =>
        donation.withdraw(addr2.address, parseEther("1"))
      ).to.changeEtherBalances([donation, addr2], [parseEther("-1"), parseEther("1")]);
    });

    it("Should allow owner to withdraw all funds", async function () {
      await donation.withdraw(addr2.address, parseEther("3"));
      expect(await ethers.provider.getBalance(await donation.getAddress())).to.equal(0);
    });

    it("Should not allow withdrawal exceeding balance", async function () {
      const excessAmount = parseEther("4");
      await expect(
        donation.withdraw(addr2.address, excessAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should not allow withdrawal to zero address", async function () {
      await expect(
        donation.withdraw("0x0000000000000000000000000000000000000000", parseEther("1"))
      ).to.be.revertedWith("Cannot withdraw to zero address");
    });

    it("Should not allow zero amount withdrawal", async function () {
      await expect(
        donation.withdraw(addr2.address, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should restrict withdrawals to the owner", async function () {
      await expect(
        donation.connect(addr1).withdraw(addr1.address, parseEther("1"))
      ).to.be.revertedWith("Not the contract owner");
    });

    it("Should emit FundsWithdrawn event", async function () {
      const amount = parseEther("1");
      await expect(donation.withdraw(addr2.address, amount))
        .to.emit(donation, "FundsWithdrawn")
        .withArgs(addr2.address, amount);
    });
  });

  describe("Events", function () {
    it("Should emit DonationReceived event", async function () {
      const amount = parseEther("1");
      await expect(donation.connect(addr1).donate({ value: amount }))
        .to.emit(donation, "DonationReceived")
        .withArgs(addr1.address, amount);
    });
  });

  describe("View Functions", function () {
    it("Should return zero for addresses that never donated", async function () {
      expect(await donation.getDonations(addr1.address)).to.equal(0);
    });

    it("Should return empty array when no donations made", async function () {
      const donors = await donation.getDonors();
      expect(donors.length).to.equal(0);
    });
  });
});
