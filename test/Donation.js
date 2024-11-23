const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Donation Contract", function () {
  let Donation, donation, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    Donation = await ethers.getContractFactory("Donation");
    donation = await Donation.deploy();
    await donation.deployed();
  });

  it("Should allow donations and track donors", async function () {
    await donation.connect(addr1).donate({ value: ethers.utils.parseEther("1") });
    await donation.connect(addr2).donate({ value: ethers.utils.parseEther("2") });

    expect(await donation.getDonations(addr1.address)).to.equal(ethers.utils.parseEther("1"));
    expect(await donation.getDonations(addr2.address)).to.equal(ethers.utils.parseEther("2"));
    expect(await donation.getDonors()).to.include(addr1.address);
    expect(await donation.getDonors()).to.include(addr2.address);
  });

  it("Should allow the owner to withdraw funds", async function () {
    await donation.connect(addr1).donate({ value: ethers.utils.parseEther("1") });
    await expect(() =>
      donation.withdraw(addr2.address, ethers.utils.parseEther("1"))
    ).to.changeEtherBalances([donation, addr2], [ethers.utils.parseEther("-1"), ethers.utils.parseEther("1")]);
  });

  it("Should restrict withdrawals to the owner", async function () {
    await expect(donation.connect(addr1).withdraw(addr1.address, 1)).to.be.revertedWith("Not the contract owner");
  });
});
