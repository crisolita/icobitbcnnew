// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "hardhat/console.sol";

/**
 * @title token
 */

contract GKHAN is ERC20PresetMinterPauser {
	uint256[] public amountsToFee;
	uint256[] public percents;
	address feeReceiver;
	mapping(address => bool) public poolFeeWallets;
	mapping(address => bool) public excludeFeeWallets;

	constructor(
		uint256[] memory _amountsToFee,
		uint256[] memory _percents,
		address _feeReceiver,
		address _pool,
		uint256 supply
	) ERC20PresetMinterPauser("GKHANTOKEN", "GKHAN") {
		amountsToFee = organize(_amountsToFee);
		percents = organize(_percents);
		feeReceiver = _feeReceiver;
		poolFeeWallets[_pool] = true;
		excludeFeeWallets[msg.sender] = true;
		_mint(msg.sender, supply);
	}

	function howMuch(uint256 _amount) public view returns (uint256 _newAmount) {
		uint256 newpercent = 0;

		for (uint256 i = 0; i < amountsToFee.length; i++) {
			if (_amount > amountsToFee[i]) {
				newpercent = percents[i];
			}
		}
		return ((_amount * newpercent) / 100);
	}

	function getAmountsToFee() public view returns (uint256[] memory) {
		return amountsToFee;
	}

	function getPercents() public view returns (uint256[] memory) {
		return percents;
	}

	function setTaxFee(
		uint256[] memory _amountsToFee,
		uint256[] memory _percents
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		amountsToFee = organize(_amountsToFee);
		percents = organize(_percents);
	}

	function seeIfWalletPoolIsFee(address _pool) public view returns (bool) {
		return poolFeeWallets[_pool];
	}

	function setFeeReceiver(address _feeReceiver)
		public
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		feeReceiver = _feeReceiver;
	}

	function setPoolFeeWallets(address[] memory _poolFeeWallets, bool access)
		public
		onlyRole(DEFAULT_ADMIN_ROLE)
	{
		for (uint256 i = 0; i < _poolFeeWallets.length; i++) {
			poolFeeWallets[_poolFeeWallets[i]] = access;
		}
	}

	function setExcludeFeeWallets(
		address[] memory _excludeFeeWallets,
		bool access
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		for (uint256 i = 0; i < _excludeFeeWallets.length; i++) {
			excludeFeeWallets[_excludeFeeWallets[i]] = access;
		}
	}

	function organize(uint256[] memory array)
		internal
		pure
		returns (uint256[] memory)
	{
		uint256[] memory arr = array;

		for (uint256 i = 0; i < arr.length; i++) {
			for (uint256 j = 0; j < arr.length - 1; j++) {
				if (arr[j] > arr[j + 1]) {
					(arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
				}
			}
		}

		return arr;
	}

	function seeData() public view returns (uint256[] memory data) {
		return amountsToFee;
	}

	function _transfer(
		address _from,
		address _to,
		uint256 _amount
	) internal override {
		// console.log(poolFeeWallets[_to]);
		if (excludeFeeWallets[msg.sender]) {
			super._transfer(_from, _to, _amount);
			// console.log("EStoy exclude?");
		} else if (poolFeeWallets[_to]) {
			// console.log("no EStoy exclude?");
			uint256 fee = howMuch(_amount);
			// console.log(feeReceiver, "fee");
			super._transfer(_from, feeReceiver, fee);
			super._transfer(_from, _to, _amount - fee);
		} else {
			// console.log("ni una ni la otra");

			super._transfer(_from, _to, _amount);
		}
	}
}
