const CONTRACT_NAME = "StakingRewardsFactory";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const genesis = new Date();
  const _stakingToken = "0x849921808285Eb9d8CD79F5eD63f653468Ca2298";
  const { deploy, log } = deployments;
  const namedAccounts = await getNamedAccounts();
  const { deployer } = namedAccounts;
  const deployResult = await deploy("StakingRewardsFactory", {
    from: deployer,
    args: [_stakingToken, Math.ceil(genesis.getTime() / 1000) + 300],
    log: true,
  });
};
module.exports.tags = [CONTRACT_NAME];
