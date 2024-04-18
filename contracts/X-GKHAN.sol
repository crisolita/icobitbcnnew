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
}
