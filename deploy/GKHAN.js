const { ethers } = require("hardhat");

const TOKEN_CONTRACT_NAME = "GKHAN";
// uint256[] memory _amountsToFee,
// 		uint256[] memory _percents,
// 		address _feeReceiver,
// 		address _pool,
// 		uint256 supply
module.exports = async ({ getNamedAccounts, deployments }) => {
  const _amountsToFee = [
      ethers.utils.parseEther("0"),
      ethers.utils.parseEther("50000"),
      ethers.utils.parseEther("100000"),
      ethers.utils.parseEther("200000"),
    ],
    _percent = [5, 10, 15, 30],
    _feeReceiver = "0x306CD783E2B00b5269e937F896D2eF94Bc6d0d79",
    supply = ethers.utils.parseEther("2000000000"),
    pool = "0x333068D06563a8DfDBF330A0e04A9d128e98bf5a";
  const { deploy, log } = deployments;
  const namedAccounts = await getNamedAccounts();
  const { deployer } = namedAccounts;
  const deployResult = await deploy("GKHAN", {
    from: deployer,
    args: [_amountsToFee, _percent, _feeReceiver, pool, supply],
    log: true,
  });
};
module.exports.tags = [TOKEN_CONTRACT_NAME];
