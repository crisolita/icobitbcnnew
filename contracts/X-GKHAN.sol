// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

/**
 * @title token
 */

contract XGKHAN is ERC20PresetMinterPauser {
	constructor(uint256 supply)
		ERC20PresetMinterPauser("X-GKHANTOKEN", "X-GKHAN")
	{
		_mint(msg.sender, supply);
	}

	function organize(uint256[4] memory array)
		public
		pure
		returns (uint256[4] memory)
	{
		uint256[4] memory arr = array;

		for (uint256 i = 0; i < 4 - 1; i++) {
			for (uint256 j = 0; j < 4 - i - 1; j++) {
				if (arr[j] > arr[j + 1]) {
					(arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
				}
			}
		}

		return arr;
	}

	function _transfer(
		address _from,
		address _to,
		uint256 _amount
	) internal override onlyRole(DEFAULT_ADMIN_ROLE) {
		_transfer(_from, _to, _amount);
	}
}
