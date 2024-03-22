const { ethers } = require("hardhat");

const TOKEN_CONTRACT_NAME = "GKHAN";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const _amountsToFee = [
      ethers.utils.parseEther("5"),
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("15"),
      ethers.utils.parseEther("20"),
    ],
    _percent = [5, 10, 15, 20],
    _feeReceiver = "0x306CD783E2B00b5269e937F896D2eF94Bc6d0d79",
    supply = ethers.utils.parseEther("1000000");
  const { deploy, log } = deployments;
  const namedAccounts = await getNamedAccounts();
  const { deployer } = namedAccounts;
  const deployResult = await deploy("GKHAN", {
    from: deployer,
    args: [_amountsToFee, _percent, _feeReceiver, supply],
    log: true,
  });
};
module.exports.tags = [TOKEN_CONTRACT_NAME];
