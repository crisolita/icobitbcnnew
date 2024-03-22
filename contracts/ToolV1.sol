//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "hardhat/console.sol";

contract ToolV1 is Initializable {
	using SafeMathUpgradeable for uint256;
	address private owner;
	IUniswapV2Router02 private uniRouter =
		IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

	function initialize(address _owner) public initializer {
		owner = _owner;
	}

	function getPathOfEthToToken(address tokenAddress)
		public
		view
		returns (address[] memory)
	{
		address[] memory path = new address[](2);
		path[0] = uniRouter.WETH();
		path[1] = tokenAddress;
		return path;
	}

	function swapETHToToken(address[] memory path)
		public
		payable
		returns (uint256[] memory amounts)
	{
		uint256 deadline = block.timestamp + 15;

		return
			uniRouter.swapExactETHForTokens{value: msg.value}(
				0,
				path,
				msg.sender,
				deadline
			);
	}
}
