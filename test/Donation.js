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

  it("Should allow donations and track donors", async function () {
    await donation.connect(addr1).donate({ value: parseEther("1") });
    await donation.connect(addr2).donate({ value: parseEther("2") });

    expect(await donation.getDonations(addr1.address)).to.equal(parseEther("1"));
    expect(await donation.getDonations(addr2.address)).to.equal(parseEther("2"));
    expect(await donation.getDonors()).to.include(addr1.address);
    expect(await donation.getDonors()).to.include(addr2.address);
    expect(await ethers.provider.getBalance(await donation.getAddress())).to.equal(parseEther("3"));
  });

  it("Should allow the owner to withdraw funds", async function () {
    await donation.connect(addr1).donate({ value: parseEther("1") });
    await expect(() =>
      donation.withdraw(addr2.address, parseEther("1"))
    ).to.changeEtherBalances([donation, addr2], [parseEther("-1"), parseEther("1")]);
  });

  it("Should restrict withdrawals to the owner", async function () {
    await expect(donation.connect(addr1).withdraw(addr1.address, 1)).to.be.revertedWith("Not the contract owner");
  });

  it("Should not add duplicate donors", async function () {
    await donation.connect(addr1).donate({ value: parseEther("1") });
    await donation.connect(addr1).donate({ value: parseEther("1") });
  
    const donors = await donation.getDonors();
    expect(donors.length).to.equal(1);
  });

  it("Should not allow zero donations", async function () {
    await expect(donation.connect(addr1).donate({ value: parseEther("0") })).to.be.revertedWith(
      "Donation must be greater than 0"
    );
  });

  it("Should allow owner to withdraw all funds", async function () {
    await donation.connect(addr1).donate({ value: parseEther("3") });
  
    const initialBalance = await ethers.provider.getBalance(addr2.address);
    await donation.withdraw(addr2.address, parseEther("3"));
  
    const finalBalance = await ethers.provider.getBalance(addr2.address);
    expect(finalBalance - initialBalance).to.equal(parseEther("3"));
  });  
});
