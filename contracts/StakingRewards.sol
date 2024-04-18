// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

interface IStakingRewards {
	// Views
	function lastTimeRewardApplicable() external view returns (uint256);

	function rewardPerToken() external view returns (uint256);

	function earned(address account) external view returns (uint256);

	function totalSupply() external view returns (uint256);

	function balanceOf(address account) external view returns (uint256);

	// Mutative

	function stake(uint256 amount) external;

	function withdraw(uint256 amount) external;

	function getReward() external;

	function exit() external;
}

/**
 * @dev Optional functions from the ERC20 standard.
 */
// abstract contract ERC20Detailed is IERC20 {
// 	string private _name;
// 	string private _symbol;
// 	uint8 private _decimals;

// 	/**
// 	 * @dev Sets the values for `name`, `symbol`, and `decimals`. All three of
// 	 * these values are immutable: they can only be set once during
// 	 * construction.
// 	 */
// 	constructor(
// 		string memory name,
// 		string memory symbol,
// 		uint8 decimals
// 	) {
// 		_name = name;
// 		_symbol = symbol;
// 		_decimals = decimals;
// 	}

// 	/**
// 	 * @dev Returns the name of the token.
// 	 */
// 	function name() public view returns (string memory) {
// 		return _name;
// 	}

// 	/**
// 	 * @dev Returns the symbol of the token, usually a shorter version of the
// 	 * name.
// 	 */
// 	function symbol() public view returns (string memory) {
// 		return _symbol;
// 	}

// 	/**
// 	 * @dev Returns the number of decimals used to get its user representation.
// 	 * For example, if `decimals` equals `2`, a balance of `505` tokens should
// 	 * be displayed to a user as `5,05` (`505 / 10 ** 2`).
// 	 *
// 	 * Tokens usually opt for a value of 18, imitating the relationship between
// 	 * Ether and Wei.
// 	 *
// 	 * > Note that this information is only used for _display_ purposes: it in
// 	 * no way affects any of the arithmetic of the contract, including
// 	 * `IERC20.balanceOf` and `IERC20.transfer`.
// 	 */
// 	function decimals() public view returns (uint8) {
// 		return _decimals;
// 	}
// }

abstract contract RewardsDistributionRecipient {
	address public rewardsDistribution;

	function notifyRewardAmount(uint256 reward, uint256 duration)
		external
		virtual;

	modifier onlyRewardsDistribution() {
		require(
			msg.sender == rewardsDistribution,
			"Caller is not RewardsDistribution contract"
		);
		_;
	}
}

contract StakingRewards is
	IStakingRewards,
	RewardsDistributionRecipient,
	ReentrancyGuard
{
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

	constructor(
		address _rewardsDistribution,
		address _rewardsToken,
		address _stakingToken,
		uint256[2] memory _timeInSeconds,
		uint256[2] memory _percents
	) public {
		require(noOver100(_percents), "Percents over 100");
		require(
			_timeInSeconds.length == _percents.length,
			"Arrays time and percents should match"
		);
		rewardsToken = ERC20Burnable(_rewardsToken);
		stakingToken = ERC20Burnable(_stakingToken);
		rewardsDistribution = _rewardsDistribution;
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

	/* ========== VIEWS ========== */

	function totalSupply() external view override returns (uint256) {
		return _totalSupply;
	}

	function balanceOf(address account)
		external
		view
		override
		returns (uint256)
	{
		return _balances[account];
	}

	function lastTimeRewardApplicable() public view override returns (uint256) {
		return Math.min(block.timestamp, periodFinish);
	}

	function rewardPerToken() public view override returns (uint256) {
		if (_totalSupply == 0) {
			return rewardPerTokenStored;
		}
		return
			rewardPerTokenStored.add(
				lastTimeRewardApplicable()
					.sub(lastUpdateTime)
					.mul(rewardRate)
					.mul(1e18)
					.div(_totalSupply)
			);
	}

	function earned(address account) public view override returns (uint256) {
		return
			_balances[account]
				.mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
				.div(1e18)
				.add(rewards[account]);
	}

	/* ========== MUTATIVE FUNCTIONS ========== */

	// function stakeWithPermit(
	// 	uint256 amount,
	// 	uint256 deadline,
	// 	uint8 v,
	// 	bytes32 r,
	// 	bytes32 s
	// ) external nonReentrant updateReward(msg.sender) {
	// 	require(amount > 0, "Cannot stake 0");
	// 	_totalSupply = _totalSupply.add(amount);
	// 	_balances[msg.sender] = _balances[msg.sender].add(amount);

	// 	// permit
	// 	// IUniswapV2ERC20(address(stakingToken)).permit(msg.sender, address(this), amount, deadline, v, r, s);

	// 	stakingToken.safeTransferFrom(msg.sender, address(this), amount);
	// 	emit Staked(msg.sender, amount);
	// }

	function stake(uint256 amount)
		external
		override
		nonReentrant
		updateReward(msg.sender)
	{
		require(amount > 0, "Cannot stake 0");
		_totalSupply = _totalSupply.add(amount);
		_balances[msg.sender] = _balances[msg.sender].add(amount);
		stakingToken.safeTransferFrom(msg.sender, address(this), amount);
		rewardsToken.safeTransfer(msg.sender, amount);
		emit Staked(msg.sender, amount);
	}

	function withdraw(uint256 _idPreWithdraw)
		public
		override
		nonReentrant
		updateReward(msg.sender)
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

	function getReward() public override nonReentrant updateReward(msg.sender) {
		uint256 reward = rewards[msg.sender];
		if (reward > 0) {
			rewards[msg.sender] = 0;
			rewardsToken.safeTransfer(msg.sender, reward);
			emit RewardPaid(msg.sender, reward);
		}
	}

	/* ========== RESTRICTED FUNCTIONS ========== */

	function notifyRewardAmount(uint256 reward, uint256 rewardsDuration)
		external
		override
		onlyRewardsDistribution
		updateReward(address(0))
	{
		require(
			block.timestamp.add(rewardsDuration) >= periodFinish,
			"Cannot reduce existing period"
		);

		if (block.timestamp >= periodFinish) {
			rewardRate = reward.div(rewardsDuration);
		} else {
			uint256 remaining = periodFinish.sub(block.timestamp);
			uint256 leftover = remaining.mul(rewardRate);
			rewardRate = reward.add(leftover).div(rewardsDuration);
		}

		// Ensure the provided reward amount is not more than the balance in the contract.
		// This keeps the reward rate in the right range, preventing overflows due to
		// very high values of rewardRate in the earned and rewardsPerToken functions;
		// Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
		uint256 balance = rewardsToken.balanceOf(address(this));
		require(
			rewardRate <= balance.div(rewardsDuration),
			"Provided reward too high"
		);

		lastUpdateTime = block.timestamp;
		periodFinish = block.timestamp.add(rewardsDuration);
		emit RewardAdded(reward, periodFinish);
	}

	/* ========== MODIFIERS ========== */

	modifier updateReward(address account) {
		rewardPerTokenStored = rewardPerToken();
		lastUpdateTime = lastTimeRewardApplicable();
		if (account != address(0)) {
			rewards[account] = earned(account);
			userRewardPerTokenPaid[account] = rewardPerTokenStored;
		}
		_;
	}
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

	event RewardAdded(uint256 reward, uint256 periodFinish);
	event Staked(address indexed user, uint256 amount);
	event Withdrawn(address indexed user, uint256 amount);
	event RewardPaid(address indexed user, uint256 reward);
	event PreWithdraw(uint256, address, uint256, uint256, uint256);

	function exit() external override {}
}
