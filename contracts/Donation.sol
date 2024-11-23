// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Donation {
    address public owner;
    mapping(address => uint256) private donations;
    address[] private donors;

    event DonationReceived(address indexed donor, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function donate() external payable {
        require(msg.value > 0, "Donation must be greater than 0");
        if (donations[msg.sender] == 0) {
            donors.push(msg.sender);
        }
        donations[msg.sender] += msg.value;
        emit DonationReceived(msg.sender, msg.value);
    }

    function withdraw(address payable _to, uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        _to.transfer(_amount);
        emit FundsWithdrawn(_to, _amount);
    }

    function getDonors() external view returns (address[] memory) {
        return donors;
    }

    function getDonations(address _donor) external view returns (uint256) {
        return donations[_donor];
    }
}
