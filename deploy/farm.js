const CONTRACT_NAME = "FARM";
const {
  expectEvent,
  expectRevert,
  time,
} = require("@openzeppelin/test-helpers");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const _timeInSeconds = [1296000, 15552000],
    _percents = [5, 95];
  const Token1 = "0x849921808285Eb9d8CD79F5eD63f653468Ca2298";
  const Token2 = "0x9c999a7ed2A7f21472607070763b2BaFbc97A9d9";

  // Upgradeable Proxy
  const deployResult = await deploy("FARM", {
    from: deployer,
    proxy: {
      owner: deployer,
      execute: {
        init: {
          methodName: "initialize",
          args: [Token2, Token1, _timeInSeconds, _percents],
        },
      },
    },
    log: true,
  });
};
module.exports.tags = [CONTRACT_NAME];
