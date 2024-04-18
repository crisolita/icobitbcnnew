const { ethers } = require("hardhat");

const CONTRACT_NAME = "BRIDGE";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const Token = "0x849921808285Eb9d8CD79F5eD63f653468Ca2298";
  // Upgradeable Proxy
  const deployResult = await deploy("BRIDGE", {
    from: deployer,
    proxy: {
      owner: deployer,
      execute: {
        init: {
          methodName: "initialize",
          args: [Token, "1713459384"],
        },
      },
    },
    log: true,
  });
};
module.exports.tags = [CONTRACT_NAME];
