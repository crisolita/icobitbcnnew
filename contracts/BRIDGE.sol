//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

/// @title Sale
/// @author crisolita
/// @notice this contract allow create phases for mint token and transfer the funds
contract BRIDGE is
	Initializable,
	AccessControlUpgradeable,
	ReentrancyGuardUpgradeable
{
	using SafeMathUpgradeable for uint256;
	using SafeERC20 for ERC20;

	address public tokenAddress;
	uint256 public timeStartClaim;
	struct Reward {
		uint256 initAmount;
		uint256 remainAmount;
		uint256 alreadyPaidAmount;
		uint256 lastTimeClaimed;
		uint256 percent;
	}
	mapping(address => Reward) public rewards;

	function initialize(address _token, uint256 _timeToStartClaim)
		public
		initializer
	{
		__AccessControl_init();
		_setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
		tokenAddress = _token;
		timeStartClaim = _timeToStartClaim;
	}

	function setReward(address[] memory _oldOwners, uint256[] memory _amounts)
		public
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		require(_oldOwners.length == _amounts.length, "Equals length");
		uint256 totalAmount = 0;
		for (uint256 i = 0; i < _amounts.length; i++) {
			totalAmount += _amounts[i];
		}
		console.log(totalAmount, "total");
		ERC20(tokenAddress).transferFrom(
			msg.sender,
			address(this),
			totalAmount
		);
		for (uint256 i = 0; i < _oldOwners.length; i++) {
			Reward memory r =
				Reward(_amounts[i], _amounts[i], 0, timeStartClaim, 0);
			rewards[_oldOwners[i]] = r;
		}
		emit SetReward(_oldOwners, _amounts);
	}

	function seeReward(address _address) public view returns (Reward memory) {
		return rewards[_address];
	}

	function removeReward(address _oldOwner)
		public
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		delete rewards[_oldOwner];
		emit RemoveReward(_oldOwner);
	}

	function claim() public {
		console.log(
			block.timestamp,
			rewards[msg.sender].lastTimeClaimed + 86400
		);
		require(
			block.timestamp >= rewards[msg.sender].lastTimeClaimed + 86400,
			"Cannot claim yet cause time"
		);
		require(
			rewards[msg.sender].remainAmount > 0,
			"Cannot claim remainAmount is 0"
		);
		require(
			rewards[msg.sender].percent < 100000000000000000000,
			"Cannot claim percent is 100"
		);
		// sacar el porcentaje
		uint256 firstPercent;
		uint256 howManyDays =
			(block.timestamp - rewards[msg.sender].lastTimeClaimed).div(86400);
		console.log(howManyDays, "how many");
		firstPercent = howManyDays.mul(1380000000000000);
		console.log(uint256(firstPercent), "percent", uint256(10**18));
		uint256 percent;
		console.log(uint256(firstPercent) > uint256(10**18), "que eres");
		if (firstPercent > 10**18) {
			percent = 10**18 - rewards[msg.sender].percent;
			console.log(percent, "peeercent");
		} else {
			percent = firstPercent;
		}

		require(percent <= 10**18, "Percent have to be less tah 100");
		require(percent > 0, "Percent have to be more than 0");
		console.log(
			rewards[msg.sender].initAmount.mul(percent).div(10**18),
			"pag0"
		);
		require(
			rewards[msg.sender].initAmount.mul(percent).div(10**18) <=
				rewards[msg.sender].remainAmount,
			"Amount is wrong"
		);
		ERC20(tokenAddress).transfer(
			msg.sender,
			rewards[msg.sender].initAmount.mul(percent).div(10**18)
		);
		rewards[msg.sender].remainAmount -= rewards[msg.sender]
			.initAmount
			.mul(percent)
			.div(10**18);
		rewards[msg.sender].alreadyPaidAmount += rewards[msg.sender]
			.initAmount
			.mul(percent)
			.div(10**18);
		rewards[msg.sender].percent += percent;
		///Habra que restarle ?
		rewards[msg.sender].lastTimeClaimed = block.timestamp;
		emit Claim(msg.sender, rewards[msg.sender]);
	}

	//EVENTS
	event Claim(address, Reward);
	event RemoveReward(address);
	event SetReward(address[], uint256[]);
}
