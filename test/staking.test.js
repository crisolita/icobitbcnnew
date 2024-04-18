const { artifacts } = require("hardhat");
const IStakeContract = artifacts.require("StakingRewards");
const StakingRewardsFactory = artifacts.require("StakingRewardsFactory");
const Token = artifacts.require("GKHAN");
const Token2 = artifacts.require("XGKHAN");

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

contract(
  "Staking",
  ([owner, user, admin1, admin2, user2, feeReceiver, pool]) => {
    let token, factory, genesis, token2;

    beforeEach(async function () {
      const maxSupply = toBN(20000000000);
      token = await Token.new(
        [
          ethers.utils.parseEther("50000"),
          ethers.utils.parseEther("0"),
          ethers.utils.parseEther("100000"),
          ethers.utils.parseEther("200000"),
        ],
        [5, 10, 15, 30],
        feeReceiver,
        pool,
        maxSupply,
        { from: owner }
      );
      token2 = await Token2.new(maxSupply);
      const algo = await token.getAmountsToFee();
      console.log(algo[0].toString(), "este es el arreglo");
      genesis = Number(await time.latest()) + 1;
      factory = await StakingRewardsFactory.new(token2.address, genesis);

      await token.mint(owner, maxSupply, { from: owner });
    });

    describe("Staking Factory works", () => {
      it("The owner can deploy and update the stake", async function () {
        const _stakingToken = token.address,
          _rewardsAmount = 50,
          _rewardsDuration = 8000,
          _timeInSeconds = [time.duration.days(15), time.duration.days(180)],
          _percents = [5, 95];

        await factory.deploy(
          _stakingToken,
          _rewardsAmount,
          _rewardsDuration,
          _timeInSeconds,
          _percents
        );

        const stk = await factory.stakingRewardsInfoByStakingToken(
          token.address
        );

        expect(stk.duration.toString()).to.equal("8000");
        expect(stk.rewardAmount.toString()).to.equal("50");

        await factory.update(
          _stakingToken,
          80,
          9000,
          _timeInSeconds,
          _percents
        );

        const stk2 = await factory.stakingRewardsInfoByStakingToken(
          token.address
        );

        expect(stk2.duration.toString()).to.equal("9000");
        expect(stk2.rewardAmount.toString()).to.equal("80");
      });
      it("Users cannot withdraw or exit before timelock", async function () {
        await token.transfer(user, toBN(20));
        const _timeInSeconds = [
          time.duration.days(15),
          time.duration.days(180),
        ];
        const _percents = [5, 95];
        const _stakingToken = token.address,
          _rewardsAmount = toBN("50"),
          _rewardsDuration = (await time.latest()) + 500;
        await token2.transfer(factory.address, toBN("50"));
        // //the owner create the stake
        await factory.deploy(
          _stakingToken,
          _rewardsAmount,
          _rewardsDuration,
          _timeInSeconds,
          _percents
        );
        await time.increase(1);

        await factory.notifyRewardAmounts();

        const stk = (
          await factory.stakingRewardsInfoByStakingToken(token.address)
        ).stakingRewards;
        var stakeContract = new web3.eth.Contract(
          IStakeContract.abi,
          stk.toString()
        );

        await token.approve(stk, toBN("10"), { from: user });
        await token.setExcludeFeeWallets([stk.toString()], true);
        await stakeContract.methods.stake(toBN("10")).send({ from: user });

        const balanceXghan = await token2.balanceOf(user);
        console.log(balanceXghan.toString());
        expect(balanceXghan.toString()).to.be.equal(toBN(10).toString());
        const balanceghan = await token.balanceOf(user);
        console.log(balanceghan.toString());
        expect(balanceghan.toString()).to.be.equal(toBN(10).toString());
        // await expectRevert(
        //   stakeContract.methods.getReward().send({ from: user }),
        //   "No time to claim yet"
        // );
        await expectRevert(
          stakeContract.methods
            .preWithdraw(toBN(1), 4000)
            .send({ from: admin1 }),
          "User doesnt have enougth amount"
        );
        const approve = await token2.approve(stk.toString(), toBN(10), {
          from: user,
        });
        await expectRevert(
          stakeContract.methods.preWithdraw(toBN(1), 4000).send({ from: user }),
          "Time should be greater than minimun"
        );
        const preWithdraw = await stakeContract.methods
          .preWithdraw(toBN(10), time.duration.days(70))
          .send({ from: user });
        await expectRevert(
          stakeContract.methods.withdraw(1).send({ from: admin2 }),
          "Cannot withdraw yet"
        );

        await time.increase(time.duration.days(80));
        await expectRevert(
          stakeContract.methods.withdraw(1).send({ from: admin2 }),
          "You are not the owner"
        );
        const balanceOfUserBeforeClaimToken2 = await token2.balanceOf(user);

        const tx = await stakeContract.methods.getReward().send({ from: user });

        const earned = web3.utils.toBN(parseInt(tx.events[0].raw.data, 16));

        const balanceOfUserToken2 = await token2.balanceOf(user);
        expect(balanceOfUserToken2.toString()).to.equal(
          balanceOfUserBeforeClaimToken2.add(earned).toString()
        );

        const balanceUserToken1BeforeWithdraw = await token.balanceOf(user);
        console.log(
          balanceUserToken1BeforeWithdraw.toString(),
          "balance before withdrwa"
        );

        const pre = await stakeContract.methods.preWithdrawDataById(1).call();
        console.log(pre, "dataaaa    ");
        await stakeContract.methods.withdraw(1).send({ from: user });
        const balanceUserToken1AfterWithdraw = await token.balanceOf(user);
        console.log("errorrr", balanceUserToken1AfterWithdraw.toString());
        expect("13600000000000000000").to.equal(
          balanceUserToken1AfterWithdraw.toString()
        );
      });
      it("Users can stake their tokens and receive rewards", async function () {
        await token.transfer(user, toBN(20));
        const _timeInSeconds = [3000, 16000];
        const _percents = [50, 100];
        const _stakingToken = token.address,
          _rewardsAmount = toBN("50"),
          _rewardsDuration = (await time.latest()) + 500;

        await token2.transfer(factory.address, toBN("50"));
        //the owner create the stake
        await factory.deploy(
          _stakingToken,
          _rewardsAmount,
          _rewardsDuration,
          _timeInSeconds,
          _percents
        );
        await time.increase(1);

        await factory.notifyRewardAmounts();

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

        await time.increase(time.duration.days(15));

        const balanceOfUserBeforeClaim = await token2.balanceOf(user);

        const tx = await stakeContract.methods.getReward().send({ from: user });

        const earned = web3.utils.toBN(parseInt(tx.events[0].raw.data, 16));

        const balanceOfUser = await token2.balanceOf(user);

        expect(balanceOfUser.toString()).to.equal(
          balanceOfUserBeforeClaim.add(earned).toString()
        );
      });
      it("Probando la funcionalidad del transfer del token ", async function () {
        let balanceOwner = await token.balanceOf(owner);
        console.log(balanceOwner.toString(), "balance of owner");
        //owner envia a pool o a user sin fee
        await token.transfer(pool, toBN(1));
        let balancePool = await token.balanceOf(pool);
        let balanceUser = await token.balanceOf(user);

        expect(balanceUser.toString()).to.equal("0");
        expect(balancePool.toString()).to.equal(toBN(1).toString());

        await token.transfer(user, toBN(250000));
        await token.transfer(admin1, toBN(1000));

        let feeReceiverBalance = await token.balanceOf(feeReceiver);
        balanceUser = await token.balanceOf(user);
        expect(balanceUser.toString()).to.equal(toBN(250000).toString());

        console.log(feeReceiverBalance.toString(), "fee receiver balance");
        expect(feeReceiverBalance.toString()).to.equal("0");
        ///user envia a otro user
        let balanceAdmin = await token.balanceOf(admin1);
        await token.transfer(admin1, toBN(500), { from: user });
        balanceUser = await token.balanceOf(user);
        balanceAdmin = await token.balanceOf(admin1);
        console.log(balanceUser.toString(), balanceAdmin.toString());
        feeReceiverBalance = await token.balanceOf(feeReceiver);

        expect(balanceUser.toString()).to.equal(toBN(249500).toString());
        expect(feeReceiverBalance.toString()).to.equal("0");
        expect(balanceAdmin.toString()).to.equal(toBN(1500).toString());

        // user normal envia al pool
        await token.transfer(pool, toBN(400), { from: user });
        balanceAdmin = await token.balanceOf(user);
        balancePool = await token.balanceOf(pool);
        feeReceiverBalance = await token.balanceOf(feeReceiver);
        expect(feeReceiverBalance.toString()).to.equal("20000000000000000000");

        console.log(balancePool.toString());
        console.log(balanceAdmin.toString(), "balanceUser");
        console.log(feeReceiverBalance.toString(), "fee receiver balance");
        await token.transfer(pool, toBN(600), { from: admin1 });
        feeReceiverBalance = await token.balanceOf(feeReceiver);
        expect(feeReceiverBalance.toString()).to.equal("50000000000000000000");

        balanceAdmin = await token.balanceOf(admin1);
        balancePool = await token.balanceOf(pool);
        await token.transfer(pool, toBN(150000), { from: user });
        feeReceiverBalance = await token.balanceOf(feeReceiver);
        expect(feeReceiverBalance.toString()).to.equal(
          "22550000000000000000000"
        );

        console.log(balancePool.toString());
        console.log(balanceAdmin.toString(), "balanceUser");
        console.log(
          feeReceiverBalance.toString(),
          "fee receiver balance en segndo"
        );
      });
    });
  }
);
