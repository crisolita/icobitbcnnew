const CONTRACT_NAME = "StakingRewardsFactory";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const genesis = new Date();
  const _stakingToken = "0x422313d9300243AAE85969BFe728E4B9Da86A60e";
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
