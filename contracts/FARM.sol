// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract FARM is ReentrancyGuard, Initializable {
	using SafeMath for uint256;
	using SafeERC20 for ERC20Burnable;

	/* ========== STATE VARIABLES ========== */
	struct ClaimUser {
		mapping(uint256 => bool) alreadyClaim;
	}
	ERC20Burnable public rewardsToken;
	ERC20Burnable public stakingToken;
	uint256 public periodFinish = 0;
	uint256 public rewardRate = 100;
	uint256 public lastUpdateTime;
	uint256 public rewardPerTokenStored;
	uint256 public idForPreWithdra = 0;
	uint256[2] public timeInSeconds;
	uint256[2] public percents;

	//time percent
	mapping(uint256 => uint256) internal timePerPercent;

	mapping(address => uint256) public userRewardPerTokenPaid;
	mapping(address => uint256) public rewards;

	uint256 private _totalSupply;
	mapping(address => uint256) private _balances;
	mapping(address => ClaimUser) internal claimUser;
	mapping(address => PreWithdrawUser[]) public userPreWithdraws;
	mapping(uint256 => PreWithdrawUser) public preWithdrawData;
	struct PreWithdrawUser {
		uint256 id;
		address user;
		uint256 amount;
		uint256 timeStart;
		uint256 timeEnd;
		uint256 percent;
		StatusPreWithdraw status;
	}
	enum StatusPreWithdraw {ACTIVE, FINISHED}

	/* ========== CONSTRUCTOR ========== */

	function initialize(
		address _token2,
		address _token1,
		uint256[2] memory _timeInSeconds,
		uint256[2] memory _percents
	) public initializer {
		require(noOver100(_percents), "Percents over 100");
		require(
			_timeInSeconds.length == _percents.length,
			"Arrays time and percents should match"
		);
		rewardsToken = ERC20Burnable(_token2);
		stakingToken = ERC20Burnable(_token1);
		timeInSeconds = organize(_timeInSeconds);
		percents = organize(_percents);
		timePerPercent[timeInSeconds[0]] = percents[0];
		timePerPercent[timeInSeconds[1]] = percents[1];
	}

	function preWithdrawDataById(uint256 _id)
		public
		view
		returns (PreWithdrawUser memory)
	{
		return preWithdrawData[_id];
	}

	function preWithdrawAmounById(uint256 _id) public view returns (uint256) {
		return preWithdrawData[_id].amount;
	}

	function preWithdrawPercentById(uint256 _id) public view returns (uint256) {
		return preWithdrawData[_id].percent;
	}

	function preWithdrawDataByUser(address _user)
		public
		view
		returns (PreWithdrawUser[] memory)
	{
		return userPreWithdraws[_user];
	}

	function noOver100(uint256[2] memory _percents)
		internal
		pure
		returns (bool)
	{
		bool noOver = true;
		for (uint256 i = 0; i < _percents.length; i++) {
			if (_percents[i] > 100) {
				noOver = false;
				break;
			}
		}
		return noOver;
	}

	function stake(uint256 amount) external nonReentrant {
		require(amount > 0, "Cannot stake 0");
		_totalSupply = _totalSupply.add(amount);
		_balances[msg.sender] = _balances[msg.sender].add(amount);
		stakingToken.safeTransferFrom(msg.sender, address(this), amount);
		rewardsToken.safeTransfer(msg.sender, amount);
		emit Staked(msg.sender, amount);
	}

	function withdraw(uint256 _idPreWithdraw)
		public
		nonReentrant
		onlyWithdrawIf(_idPreWithdraw)
	{
		//hayar el porcentaje
		uint256 newAmount =
			(preWithdrawData[_idPreWithdraw].amount *
				preWithdrawData[_idPreWithdraw].percent) / 100;
		_totalSupply = _totalSupply.sub(preWithdrawData[_idPreWithdraw].amount);
		_balances[msg.sender] = _balances[msg.sender].sub(
			preWithdrawData[_idPreWithdraw].amount
		);
		console.log("NEWW AMOUNT", newAmount);
		stakingToken.safeTransfer(msg.sender, newAmount);
		stakingToken.burn(preWithdrawData[_idPreWithdraw].amount - newAmount);
		rewardsToken.burn(preWithdrawData[_idPreWithdraw].amount);
		emit Withdrawn(msg.sender, newAmount);
	}

	function organize(uint256[2] memory array)
		internal
		pure
		returns (uint256[2] memory)
	{
		uint256[2] memory arr = array;

		for (uint256 i = 0; i < arr.length - 1; i++) {
			for (uint256 j = 0; j < arr.length - i - 1; j++) {
				if (arr[j] > arr[j + 1]) {
					(arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
				}
			}
		}

		return arr;
	}

	function preWithdraw(uint256 amount, uint256 _timeInSecondsToUser) public {
		require(
			_balances[msg.sender] >= amount,
			"User doesnt have enougth amount"
		);
		require(
			_timeInSecondsToUser >= timeInSeconds[0],
			"Time should be greater than minimun"
		);

		uint256 newPercent;
		if (_timeInSecondsToUser > timeInSeconds[1]) {
			newPercent = percents[1];
		} else {
			newPercent =
				(percents[1] * _timeInSecondsToUser) /
				timeInSeconds[1];
		}
		console.log(newPercent, "newPercent");
		idForPreWithdra++;
		rewardsToken.transferFrom(msg.sender, address(this), amount);
		PreWithdrawUser memory p =
			PreWithdrawUser(
				idForPreWithdra,
				msg.sender,
				amount,
				block.timestamp,
				block.timestamp + _timeInSecondsToUser,
				newPercent,
				StatusPreWithdraw.ACTIVE
			);
		preWithdrawData[idForPreWithdra] = p;
		userPreWithdraws[msg.sender].push(p);
		emit PreWithdraw(
			idForPreWithdra,
			msg.sender,
			amount,
			block.timestamp,
			block.timestamp + _timeInSecondsToUser
		);
	}

	/* ========== MODIFIERS ========== */

	//solo falta aqui
	modifier onlyWithdrawIf(uint256 _idForPreWithdra) {
		require(
			block.timestamp >= preWithdrawData[_idForPreWithdra].timeEnd,
			"Cannot withdraw yet"
		);
		require(
			msg.sender == preWithdrawData[_idForPreWithdra].user,
			"You are not the owner"
		);
		require(
			preWithdrawData[_idForPreWithdra].status ==
				StatusPreWithdraw.ACTIVE,
			"This preWithdraw is already done"
		);
		require(
			preWithdrawData[_idForPreWithdra].amount > 0,
			"Cannot withdraw 0"
		);

		_;
	}

	/* ========== EVENTS ========== */

	event Staked(address indexed user, uint256 amount);
	event Withdrawn(address indexed user, uint256 amount);
	event PreWithdraw(uint256, address, uint256, uint256, uint256);
}
