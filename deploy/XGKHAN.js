const { ethers } = require("hardhat");

const TOKEN_CONTRACT_NAME = "XGKHAN";

module.exports = async ({ getNamedAccounts, deployments }) => {
  supply = ethers.utils.parseEther("2000000000");
  const { deploy, log } = deployments;
  const namedAccounts = await getNamedAccounts();
  const { deployer } = namedAccounts;
  const deployResult = await deploy("XGKHAN", {
    from: deployer,
    args: [supply],
    log: true,
  });
};
module.exports.tags = [TOKEN_CONTRACT_NAME];
