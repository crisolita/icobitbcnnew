const { ethers } = require("hardhat");

const SALE_CONTRACT_NAME = "Sale";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const maxSupply = ethers.utils.parseEther("1000000");
  const stableCoin = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
  const receiver = "0x812c15abB818e638A08D48CC36f4Fa6A88f3fF23";
  const Token = await deployments.get("GKHAN");

  // Upgradeable Proxy
  const deployResult = await deploy("Sale", {
    from: deployer,
    proxy: {
      owner: deployer,
      execute: {
        init: {
          methodName: "initialize",
          args: [maxSupply, deployer, Token.address, stableCoin, receiver],
        },
      },
    },
    log: true,
  });
};
module.exports.tags = [SALE_CONTRACT_NAME];
module.exports.dependencies = ["GKHAN"];
