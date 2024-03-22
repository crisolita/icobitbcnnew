const { artifacts } = require("hardhat");
const IStakeContract = artifacts.require("StakingRewards");
const StakingRewardsFactory = artifacts.require("StakingRewardsFactory");
const Token = artifacts.require("GKHAN");
const { Provider } = require("@ethersproject/abstract-provider");

const {
  expectEvent,
  expectRevert,
  time,
} = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { expect } = require("chai");
const { latest } = require("@openzeppelin/test-helpers/src/time");

// this function include the decimals
toBN = (num) => web3.utils.toBN(num + "0".repeat(18));

toWei = (num) => web3.utils.toWei(num);
fromWei = (num) => web3.utils.fromWei(num);

contract("Staking", ([owner, user, admin1, admin2, user2, feeReceiver]) => {
  let token, factory, genesis;

  beforeEach(async function () {
    const maxSupply = toBN(10000);
    token = await Token.new(
      [
        ethers.utils.parseEther("500"),
        ethers.utils.parseEther("1000"),
        ethers.utils.parseEther("2000"),
        ethers.utils.parseEther("300"),
      ],
      [5, 10, 15, 20],
      feeReceiver,
      maxSupply,
      { from: owner }
    );
    genesis = Number(await time.latest()) + 1;
    factory = await StakingRewardsFactory.new(token.address, genesis);

    await token.mint(owner, maxSupply, { from: owner });
  });

  describe("Staking Factory works", () => {
    it("The owner can deploy and update the stake", async function () {
      const _stakingToken = token.address,
        _rewardsAmount = 50,
        _rewardsDuration = 8000,
        _stakedTimeToClaim = [0];

      await factory.deploy(
        _stakingToken,
        _rewardsAmount,
        _rewardsDuration,
        _stakedTimeToClaim,
        0
      );

      const stk = await factory.stakingRewardsInfoByStakingToken(token.address);

      expect(stk.duration.toString()).to.equal("8000");
      expect(stk.rewardAmount.toString()).to.equal("50");

      await factory.update(_stakingToken, 80, 9000, _stakedTimeToClaim, 0);

      const stk2 = await factory.stakingRewardsInfoByStakingToken(
        token.address
      );

      expect(stk2.duration.toString()).to.equal("9000");
      expect(stk2.rewardAmount.toString()).to.equal("80");
    });
    it("Users cannot withdraw or exit before timelock", async function () {
      await token.transfer(user, toBN(20));

      const _stakingToken = token.address,
        _rewardsAmount = toBN("50"),
        _rewardsDuration = (await time.latest()) + 500,
        _stakedTimeToClaim = [
          Number(await time.latest()) + 864000,
          Number(await time.latest()) + 1728000,
          Number(await time.latest()) + 2592000,
        ];
      _timelock = Number(await time.latest()) + 2592000;

      await token.transfer(factory.address, toBN("50"));
      //the owner create the stake
      await factory.deploy(
        _stakingToken,
        _rewardsAmount,
        _rewardsDuration,
        _stakedTimeToClaim,
        _timelock
      );
      await time.increase(1);

      await factory.notifyRewardAmounts({ from: admin2 });

      const stk = (
        await factory.stakingRewardsInfoByStakingToken(token.address)
      ).stakingRewards;
      var stakeContract = new web3.eth.Contract(
        IStakeContract.abi,
        stk.toString()
      );

      await token.approve(stk, toBN("2"), { from: user });
      await token.setExcludeFeeWallets([stk.toString()], true);
      await stakeContract.methods.stake(toBN("2")).send({ from: user });

      await expectRevert(
        stakeContract.methods.getReward().send({ from: user }),
        "No time to claim yet"
      );
      await expectRevert(
        stakeContract.methods.withdraw(toBN("2")).send({ from: user }),
        "Cannot withdraw yet"
      );
      await time.increase(time.duration.days(15));

      const balanceOfUserBeforeClaim = await token.balanceOf(user);

      const tx = await stakeContract.methods.getReward().send({ from: user });

      const earned = web3.utils.toBN(parseInt(tx.events[0].raw.data, 16));

      const balanceOfUser = await token.balanceOf(user);

      expect(balanceOfUser.toString()).to.equal(
        balanceOfUserBeforeClaim.add(earned).toString()
      );

      await expectRevert(
        stakeContract.methods.getReward().send({ from: user }),
        "No time to claim yet"
      );
      await expectRevert(
        stakeContract.methods.exit().send({ from: user }),
        "Cannot withdraw yet"
      );
      await time.increase(2592000);

      await stakeContract.methods.exit().send({ from: user });
    });
    it("Users can stake their tokens and receive rewards", async function () {
      await token.transfer(user, toBN(20));

      const _stakingToken = token.address,
        _rewardsAmount = toBN("50"),
        _rewardsDuration = (await time.latest()) + 500,
        _stakedTimeToClaim = [
          Number(await time.latest()) + 864000,
          Number(await time.latest()) + 1728000,
          Number(await time.latest()) + 2592000,
        ];
      _timelock = Number(await time.latest()) + 2592000;

      await token.transfer(factory.address, toBN("50"));
      //the owner create the stake
      await factory.deploy(
        _stakingToken,
        _rewardsAmount,
        _rewardsDuration,
        _stakedTimeToClaim,
        _timelock
      );
      await time.increase(1);

      await factory.notifyRewardAmounts({ from: admin2 });

      const stk = (
        await factory.stakingRewardsInfoByStakingToken(token.address)
      ).stakingRewards;
      var stakeContract = new web3.eth.Contract(
        IStakeContract.abi,
        stk.toString()
      );
      await token.setExcludeFeeWallets([stk.toString()], true);
      await token.approve(stk, toBN("2"), { from: user });

      await stakeContract.methods.stake(toBN("2")).send({ from: user });

      await expectRevert(
        stakeContract.methods.getReward().send({ from: user }),
        "No time to claim yet"
      );

      await time.increase(time.duration.days(15));

      const balanceOfUserBeforeClaim = await token.balanceOf(user);

      const tx = await stakeContract.methods.getReward().send({ from: user });

      const earned = web3.utils.toBN(parseInt(tx.events[0].raw.data, 16));

      const balanceOfUser = await token.balanceOf(user);

      expect(balanceOfUser.toString()).to.equal(
        balanceOfUserBeforeClaim.add(earned).toString()
      );

      await expectRevert(
        stakeContract.methods.getReward().send({ from: user }),
        "No time to claim yet"
      );
    });
    it("Viendo a ver el APY", async function () {
      await token.transfer(user, toWei("2000"));
      await token.transfer(user2, toWei("2000"));
      const _stakingToken = token.address,
        _rewardsAmount = toWei("10"),
        _rewardsDuration = time.duration.days(1),
        _stakedTimeToClaim = [0];

      await token.transfer(factory.address, toWei("50"));
      //the owner create the stake
      await factory.deploy(
        _stakingToken,
        _rewardsAmount,
        _rewardsDuration,
        _stakedTimeToClaim,
        0
      );
      await time.increase(1);

      await factory.notifyRewardAmounts({ from: admin2 });

      const stk = (
        await factory.stakingRewardsInfoByStakingToken(token.address)
      ).stakingRewards;
      var stakeContract = new web3.eth.Contract(
        IStakeContract.abi,
        stk.toString()
      );

      await token.approve(stk, toWei("2"), { from: user });

      await stakeContract.methods.stake(toWei("1")).send({ from: user });
      await token.approve(stk, toWei("2000"), { from: user2 });
      const rewardpertoken = await stakeContract.methods
        .rewardPerToken()
        .call();

      console.log(rewardpertoken, "This is reward per token");
      // await stakeContract.methods.stake(toWei("1")).send({ from: user2 });
      await time.increase(time.duration.days(1));

      const balanceOfUserBeforeClaim = await token.balanceOf(user);

      const tx = await stakeContract.methods.getReward().send({ from: user });

      const balanceOfUser = await token.balanceOf(user);
      console.log(
        balanceOfUserBeforeClaim.toString(),
        "user 1",
        balanceOfUser.toString()
      );
    });
  });
});
