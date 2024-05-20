const { artifacts } = require("hardhat");
const FARM = artifacts.require("FARM");
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
    let token, farm, token2;

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

      await token.mint(owner, maxSupply, { from: owner });

      const _timeInSeconds = [time.duration.days(15), time.duration.days(180)],
        _percents = [5, 95];
      farm = await FARM.new();
      await farm.initialize(
        token2.address,
        token.address,
        _timeInSeconds,
        _percents
      );
    });

    describe("Farm works", () => {
      it("Users cannot withdraw or exit before timelock", async function () {
        await token.transfer(user, toBN(20));

        await time.increase(1);
        await token2.mint(farm.address, toBN("10000"));
        await token.approve(farm.address, toBN("10"), { from: user });
        await token.setExcludeFeeWallets([farm.address], true);
        await farm.stake(toBN("10"), { from: user });

        const balanceXghan = await token2.balanceOf(user);
        console.log(balanceXghan.toString());
        expect(balanceXghan.toString()).to.be.equal(toBN(10).toString());
        const balanceghan = await token.balanceOf(user);
        console.log(balanceghan.toString());
        expect(balanceghan.toString()).to.be.equal(toBN(10).toString());
        // await expectRevert(
        //   farm.methods.getReward().send({ from: user }),
        //   "No time to claim yet"
        // );
        await expectRevert(
          farm.preWithdraw(toBN(1), 4000, { from: admin1 }),
          "User doesnt have enougth amount"
        );
        const approve = await token2.approve(farm.address, toBN(10), {
          from: user,
        });
        await expectRevert(
          farm.preWithdraw(toBN(1), 4000, { from: user }),
          "Time should be greater than minimun"
        );
        const preWithdraw = await farm.preWithdraw(
          toBN(10),
          time.duration.days(70),
          { from: user }
        );
        await expectRevert(
          farm.withdraw(1, { from: admin2 }),
          "Cannot withdraw yet"
        );

        await time.increase(time.duration.days(80));
        await expectRevert(
          farm.withdraw(1, { from: admin2 }),
          "You are not the owner"
        );
        const balanceOfUserBeforeClaimToken2 = await token2.balanceOf(user);

        const balanceOfUserToken2 = await token2.balanceOf(user);

        const balanceUserToken1BeforeWithdraw = await token.balanceOf(user);
        console.log(
          balanceUserToken1BeforeWithdraw.toString(),
          "balance before withdrwa"
        );

        const pre = await farm.preWithdrawDataById(1);
        console.log(pre, "dataaaa    ");
        await farm.withdraw(1, { from: user });
        const balanceUserToken1AfterWithdraw = await token.balanceOf(user);
        console.log("errorrr", balanceUserToken1AfterWithdraw.toString());
        expect("13600000000000000000").to.equal(
          balanceUserToken1AfterWithdraw.toString()
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
