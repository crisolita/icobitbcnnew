//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";
// import "@openzeppelin/contracts/token/ERC20/utils/TokenTimelock.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

/// @title Sale
/// @author crisolita
/// @notice this contract allow create phases for mint token and transfer the funds
contract Sale is
	Initializable,
	AccessControlUpgradeable,
	ReentrancyGuardUpgradeable
{
	using SafeMathUpgradeable for uint256;

	address public stableCoinAddress;
	address public receiverPayments;
	/// until amount N of token sold out or reaching a date or time is over
	struct Phase {
		// bool is the phase publici
		bool isPublic;
		//uint max entry
		uint256 maxEntry;
		// uint minimum amount of token
		uint256 minimunEntry;
		// uint price in usd
		uint256 price;
		// timestamp when this phase ends
		uint256 endAt;
		// uint that decreases when sold in phase
		// @note to know the original supply look up in logs
		uint256 supply;
		// mark as finished the phase
		bool over;
		//time in days for lock tokens
		uint256 timelock;
		// pieces of time to release token
		uint256[] timesToRelease;
		uint256[] percentsToRelease;
	}
	struct TokenTimelock {
		address owner;
		uint256 price;
		uint256 initAmount;
		uint256 remainAmount;
		uint256[] timesToRelease;
		uint256[] percentsToRelease;
		mapping(uint256 => bool) released;
	}

	/// all phases (next, current and previous)
	mapping(uint256 => Phase) public phases;
	/// record the ids for users
	mapping(address => uint256[]) public allIDSforUser;
	// only the private wallets
	mapping(address => bool) private whitelist;
	//address with amount and time for timelock
	mapping(uint256 => TokenTimelock) public tokenLocksForSale;
	/// reference for the mapping of phases, uint of the current phase
	uint256 public currentPhase;
	//  ID for every sale
	uint256 public id;
	/// reference for the mapping of phases, uint of the total phase
	/// @notice current amount of tokens
	uint256 public tokensRemainForSale;
	/// @notice wallet to transfer funds of the contract
	address public dispatcher;
	/// @notice address the token that user buys
	address public tokenAddress;
	/// records the changes of the wallet where the tokens are transferred
	address[] public whitelistArr;
	event DispatcherChange(address indexed _dispatcher);
	/// records the token transfers made by the contract
	event Purchase(address indexed _account, uint256 _amount, uint256 _id);
	//event to control withdraw
	event Withdraw(address _recipient, uint256 _amount);
	/// records creation  of phases
	event PhaseCreated(
		bool isPublic,
		uint256 maxEntry,
		uint256 _minimunEntry,
		uint256 _price,
		uint256 _endAt,
		uint256 _supply
	);
	event PhaseOver(bool _over);
	event Claims(address _buyer, uint256 _id);
	event AddUsersToVesting(uint256, uint256[], address[]);

	function initialize(
		uint256 _maxSupply,
		address _dispatcher,
		address _tokenAddress,
		address _stableCoinAddress,
		address _receiverPayments
	) public initializer {
		__AccessControl_init();
		_setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
		_setupRole(DEFAULT_ADMIN_ROLE, _dispatcher);
		currentPhase = 0;
		stableCoinAddress = _stableCoinAddress;
		tokensRemainForSale = _maxSupply;
		dispatcher = _dispatcher;
		tokenAddress = _tokenAddress;
		phases[currentPhase].over = true;
		receiverPayments = _receiverPayments;
	}

	//receive a bool and make the access possible
	modifier isPublicSale() {
		if (!phases[currentPhase].isPublic) {
			require(whitelist[msg.sender], "This phase is private");
		}
		_;
	}

	function setAddressStableCoin(address _stable)
		public
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		stableCoinAddress = _stable;
	}

	/// @notice mint tokens, require send ETH/BNB

	function buyTokenWithStableCoin(uint256 _tokenAmountDesired)
		public
		isPublicSale
		nonReentrant
		returns (bool)
	{
		uint256 finalPrice =
			_tokenAmountDesired.mul(phases[currentPhase].price).div(10**30);
		console.log(finalPrice, "final");
		require(finalPrice > 0, "Final price cannot be zero");
		require(
			block.timestamp < phases[currentPhase].endAt,
			"This phase is over, wait for the next"
		);

		require(
			phases[currentPhase].supply >= _tokenAmountDesired,
			"Not enough supply"
		);

		require(
			_tokenAmountDesired >= phases[currentPhase].minimunEntry,
			"There are too few tokens"
		);
		SafeERC20.safeTransferFrom(
			ERC20(stableCoinAddress),
			msg.sender,
			receiverPayments,
			finalPrice
		);
		id++;
		if (phases[currentPhase].timelock > 0) {
			tokenLocksForSale[id].owner = msg.sender;
			tokenLocksForSale[id].initAmount = _tokenAmountDesired;
			tokenLocksForSale[id].remainAmount = _tokenAmountDesired;
			getTimeToPresent(phases[currentPhase].timesToRelease);
			tokenLocksForSale[id].percentsToRelease = phases[currentPhase]
				.percentsToRelease;
		} else {
			ERC20(tokenAddress).transfer(msg.sender, _tokenAmountDesired);
		}

		allIDSforUser[msg.sender].push(id);

		/// change current phase total supply
		phases[currentPhase].supply -= _tokenAmountDesired;

		if (phases[currentPhase].supply == 0) {
			phases[currentPhase].over = true;
			emit PhaseOver(true);
		}

		tokensRemainForSale -= _tokenAmountDesired;
		emit Purchase(msg.sender, _tokenAmountDesired, id);
		return true;
	}

	//release the tokens at time

	function release(uint256 _id) public returns (bool) {
		bool successClaim;
		require(
			msg.sender == tokenLocksForSale[_id].owner,
			"This is not your id"
		);
		require(
			tokenLocksForSale[_id].remainAmount > 0,
			"Already claim tokens"
		);
		for (
			uint256 i = 0;
			i < tokenLocksForSale[_id].timesToRelease.length;
			i++
		) {
			if (
				block.timestamp >= tokenLocksForSale[_id].timesToRelease[i] &&
				!tokenLocksForSale[_id].released[
					tokenLocksForSale[_id].timesToRelease[i]
				]
			) {
				ERC20(tokenAddress).transfer(
					tokenLocksForSale[_id].owner,
					(tokenLocksForSale[_id].initAmount *
						tokenLocksForSale[_id].percentsToRelease[i]) / 100
				);
				tokenLocksForSale[_id].released[
					tokenLocksForSale[_id].timesToRelease[i]
				] = true;
				tokenLocksForSale[_id].remainAmount -=
					(tokenLocksForSale[_id].initAmount *
						tokenLocksForSale[_id].percentsToRelease[i]) /
					100;

				successClaim = true;
			}
		}

		require(successClaim, "Current time is before release time");
		emit Claims(tokenLocksForSale[_id].owner, id);
		return successClaim;
	}

	///@notice VIEW FUNCTIONS

	///@dev see the tokens lock and id for every user
	function getIDs(address _address) public view returns (uint256[] memory) {
		return allIDSforUser[_address];
	}

	///@dev time in lock
	function showMyinitAmount(uint256 _id) public view returns (uint256) {
		return (tokenLocksForSale[_id].initAmount);
	}

	function showMyRemainAmount(uint256 _id) public view returns (uint256) {
		return (tokenLocksForSale[_id].remainAmount);
	}

	function showMyPrice(uint256 _id) public view returns (uint256) {
		return (tokenLocksForSale[_id].price);
	}

	///@dev see the amount of token lock

	///@dev get the EUR/BNB price

	/// @notice get ongoing phase or the last phase over
	function getcurrentPhase() external view returns (Phase memory) {
		return phases[currentPhase];
	}

	function getCurrentSupplyRemain() external view returns (uint256) {
		return phases[currentPhase].supply;
	}

	function getVestingTimePhase() external view returns (uint256[] memory) {
		return phases[currentPhase].timesToRelease;
	}

	function getVestingPercentPhase() external view returns (uint256[] memory) {
		return phases[currentPhase].percentsToRelease;
	}

	function getWhenIsTheNextClaim(uint256 _id) public view returns (uint256) {
		for (
			uint256 i = 0;
			i < tokenLocksForSale[_id].timesToRelease.length;
			i++
		) {
			if (
				!tokenLocksForSale[_id].released[
					tokenLocksForSale[_id].timesToRelease[i]
				]
			) {
				return tokenLocksForSale[_id].timesToRelease[i];
			}
		}
		return 0;
	}

	function getPercentsToReleaseForID(uint256 _id)
		public
		view
		returns (uint256[] memory)
	{
		return tokenLocksForSale[_id].percentsToRelease;
	}

	function getTimesToReleaseForID(uint256 _id)
		public
		view
		returns (uint256[] memory)
	{
		return tokenLocksForSale[_id].timesToRelease;
	}

	function getWhitelist() public view returns (address[] memory) {
		return whitelistArr;
	}

	function setTimeAndPercent(
		uint256[] memory _times,
		uint256[] memory _percents
	) internal pure returns (bool success) {
		require(_times.length == _percents.length, "No match entry");
		uint256 count1 = 0;
		for (uint256 i = 0; i < _times.length; i++) {
			require(_times[i] > 0, "No time");
			require(_percents[i] > 0, "No percent");
			count1 += _percents[i];
		}
		require(count1 == 100, "Percentages do not add to 100");
		return success = true;
	}

	function getTimeToPresent(uint256[] memory _timesToRelease) internal {
		for (uint256 i = 0; i < _timesToRelease.length; i++) {
			tokenLocksForSale[id].timesToRelease.push(
				block.timestamp + _timesToRelease[i]
			);
		}
	}

	///@notice ONLYOWNER FUNCTIONS

	/// @notice add a phase to mapping
	function createPhase(
		bool _isPublic,
		uint256 _maxEntry,
		uint256 _minimunEntry,
		uint256 _price,
		uint256 _endAt,
		uint256 _supply,
		uint256 _timeLock,
		uint256[] memory _timesToRelease,
		uint256[] memory _percentsToRelease
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		if (block.timestamp > phases[currentPhase].endAt) {
			phases[currentPhase].over = true;
		}
		require(
			setTimeAndPercent(_timesToRelease, _percentsToRelease),
			"Wrong timetoRelease or percents parameters"
		);
		require(_maxEntry >= _minimunEntry);
		require(phases[currentPhase].over, "This phase isn't over");
		if (phases[currentPhase].supply > 0) {
			ERC20(tokenAddress).transfer(
				dispatcher,
				phases[currentPhase].supply
			);
		}
		require(
			block.timestamp < _endAt,
			"The end of the phase should be greater than now"
		);
		require(
			_supply > _minimunEntry,
			"Supply should be greater than minimum entry"
		);
		require(tokensRemainForSale >= _supply, "Not enough supply to mint");
		require(
			ERC20(tokenAddress).transferFrom(
				dispatcher,
				address(this),
				_supply
			),
			"The token could not be transferred to the phase"
		);
		currentPhase++;
		Phase memory p =
			Phase(
				_isPublic,
				_maxEntry,
				_minimunEntry,
				_price,
				_endAt,
				_supply,
				false,
				_timeLock,
				_timesToRelease,
				_percentsToRelease
			);
		phases[currentPhase] = p;

		emit PhaseCreated(
			_isPublic,
			_maxEntry,
			_minimunEntry,
			_price,
			_endAt,
			_supply
		);
	}

	/// @notice change account to transfer the contract balance
	function changeDispatcher(address _dispatcher)
		external
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		emit DispatcherChange(_dispatcher);
		dispatcher = _dispatcher;
	}

	function cancelPhase() external onlyRole(DEFAULT_ADMIN_ROLE) {
		require(
			phases[currentPhase].over == false,
			"This phase is over, wait for the next"
		);
		if (phases[currentPhase].supply > 0) {
			ERC20(tokenAddress).transfer(
				dispatcher,
				phases[currentPhase].supply
			);
			phases[currentPhase].supply = 0;
		}
		phases[currentPhase].over = true;
		emit PhaseOver(true);
	}

	function addToWhitelist(address[] memory _accounts)
		public
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		for (uint256 i = 0; i < _accounts.length; i++) {
			whitelist[_accounts[i]] = true;
		}
		whitelistArr = _accounts;
	}

	function removeWhitelistedAddress() public onlyRole(DEFAULT_ADMIN_ROLE) {
		delete whitelistArr;
	}

	///@notice  set chainlink address

	///@dev change the end date's phase
	function changeEndDate(uint256 _newEndDate)
		public
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		require(block.timestamp < _newEndDate);
		phases[currentPhase].endAt = _newEndDate;
	}

	///@dev change the token address
	function changeTokenAddress(address _newAddress)
		external
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		tokenAddress = _newAddress;
	}

	/// @notice withdraw eth
	function withdraw(address _account, uint256 _amount)
		external
		onlyRole(DEFAULT_ADMIN_ROLE)
		nonReentrant
	{
		payable(_account).transfer(_amount);
		emit Withdraw(_account, _amount);
	}

	receive() external payable {}

	function addUsersToVesting(
		uint256[] memory _tokenAmount,
		address[] memory _address
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		require(
			_tokenAmount.length == _address.length,
			"should be equal users and quantity"
		);
		uint256 totalQuantity = 0;
		for (uint256 i = 0; i < _tokenAmount.length; i++) {
			totalQuantity += _tokenAmount[i];
		}
		require(
			block.timestamp < phases[currentPhase].endAt,
			"This phase is over, wait for the next"
		);

		require(
			phases[currentPhase].supply >= totalQuantity,
			"Not enough supply"
		);

		for (uint256 i = 0; i < _tokenAmount.length; i++) {
			if (phases[currentPhase].timelock > 0) {
				id++;
				allIDSforUser[_address[i]].push(id);
				tokenLocksForSale[id].owner = _address[i];
				tokenLocksForSale[id].initAmount = _tokenAmount[i];
				tokenLocksForSale[id].remainAmount = _tokenAmount[i];
				getTimeToPresent(phases[currentPhase].timesToRelease);
				tokenLocksForSale[id].percentsToRelease = phases[currentPhase]
					.percentsToRelease;
			} else {
				ERC20(tokenAddress).transfer(_address[i], _tokenAmount[i]);
			}
			phases[currentPhase].supply -= _tokenAmount[i];
		}

		if (phases[currentPhase].supply == 0) {
			phases[currentPhase].over = true;
			emit PhaseOver(true);
		}
		tokensRemainForSale -= totalQuantity;
		emit AddUsersToVesting(currentPhase, _tokenAmount, _address);
	}
}
