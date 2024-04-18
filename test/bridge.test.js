// const { artifacts, waffle } = require("hardhat");
// const Bridge = artifacts.require("BRIDGE");
// const Token = artifacts.require("GKHAN");
// const Token2 = artifacts.require("XGKHAN");

// const { Provider } = require("@ethersproject/abstract-provider");

// const {
//   expectEvent,
//   expectRevert,
//   time,
// } = require("@openzeppelin/test-helpers");
// const { web3 } = require("@openzeppelin/test-helpers/src/setup");
// const { expect } = require("chai");
// const { latest } = require("@openzeppelin/test-helpers/src/time");

// // this function include the decimals
// toBN = (num) => web3.utils.toBN(num + "0".repeat(18));

// toWei = (num) => web3.utils.toWei(num);
// fromWei = (num) => web3.utils.fromWei(num);

// contract("Bridge", ([owner, user, user2, user3, user4, pool, feeReceiver]) => {
//   let token, bridge;

//   beforeEach(async function () {
//     const maxSupply = toBN(200000);
//     token = await Token.new(
//       [
//         ethers.utils.parseEther("500"),
//         ethers.utils.parseEther("1000"),
//         ethers.utils.parseEther("2000"),
//         ethers.utils.parseEther("300"),
//       ],
//       [5, 10, 15, 20],
//       feeReceiver,
//       pool,
//       maxSupply,
//       { from: owner }
//     );

//     await token.mint(owner, maxSupply, { from: owner });
//     const hoy = await time.latest();
//     console.log(hoy);
//     bridge = await Bridge.new();
//     await bridge.initialize(token.address, Number(hoy) + 86400 + 86400);
//     const approve = await token.approve(bridge.address, toBN(100));
//     const setRewards = await bridge.setReward(
//       [user, user2, user3, user4],
//       [toBN(10), toBN(20), toBN(30), toBN(40)],
//       { from: owner }
//     );
//     const bridgeBalance = await token.balanceOf(bridge.address);
//     console.log("bridge", bridgeBalance.toString());
//   });

//   describe("Bridge works", () => {
//     it("See the rewards and allow someone to claim", async function () {
//       let see = await bridge.seeReward(user);
//       console.log(see);
//       await time.increase(time.duration.days(3));
//       const claim = await bridge.claim({ from: user });
//       see = await bridge.seeReward(user);
//       console.log(see);
//       expect(see.remainAmount.toString()).to.equal("9986200000000000000");
//       await time.increase(time.duration.minutes(800));

//       const claim2 = await bridge.claim({ from: user4 });
//       see = await bridge.seeReward(user4);
//       console.log(see);
//       const claim5 = await bridge.claim({ from: user2 });
//       see = await bridge.seeReward(user2);
//       console.log("user 2 first time", see);

//       await time.increase(time.duration.days(30));
//       const claim6 = await bridge.claim({ from: user2 });
//       see = await bridge.seeReward(user2);
//       console.log(see, "user 2 second time");
//       await time.increase(time.duration.days(800));
//       const claim4 = await bridge.claim({ from: user4 });
//       see = await bridge.seeReward(user4);
//       console.log(see, "last see");
//     });
//   });
// });
