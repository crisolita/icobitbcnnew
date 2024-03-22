// const { artifacts } = require("hardhat");
// const Sale = artifacts.require("Sale");
// const Token = artifacts.require("GKHAN");
// const Tool = artifacts.require("ToolV1");

// const { Provider } = require("@ethersproject/abstract-provider");
// const abi = [
//   {
//     constant: true,
//     inputs: [],
//     name: "name",
//     outputs: [{ name: "", type: "string" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [{ name: "_upgradedAddress", type: "address" }],
//     name: "deprecate",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [
//       { name: "_spender", type: "address" },
//       { name: "_value", type: "uint256" },
//     ],
//     name: "approve",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "deprecated",
//     outputs: [{ name: "", type: "bool" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [{ name: "_evilUser", type: "address" }],
//     name: "addBlackList",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "totalSupply",
//     outputs: [{ name: "", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [
//       { name: "_from", type: "address" },
//       { name: "_to", type: "address" },
//       { name: "_value", type: "uint256" },
//     ],
//     name: "transferFrom",
//     outputs: [{ name: "", type: "bool" }],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "upgradedAddress",
//     outputs: [{ name: "", type: "address" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [{ name: "", type: "address" }],
//     name: "balances",
//     outputs: [{ name: "", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "decimals",
//     outputs: [{ name: "", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "maximumFee",
//     outputs: [{ name: "", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "_totalSupply",
//     outputs: [{ name: "", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [],
//     name: "unpause",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [{ name: "_maker", type: "address" }],
//     name: "getBlackListStatus",
//     outputs: [{ name: "", type: "bool" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [
//       { name: "", type: "address" },
//       { name: "", type: "address" },
//     ],
//     name: "allowed",
//     outputs: [{ name: "", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "paused",
//     outputs: [{ name: "", type: "bool" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [{ name: "who", type: "address" }],
//     name: "balanceOf",
//     outputs: [{ name: "", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [],
//     name: "pause",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "getOwner",
//     outputs: [{ name: "", type: "address" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "owner",
//     outputs: [{ name: "", type: "address" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "symbol",
//     outputs: [{ name: "", type: "string" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [
//       { name: "_to", type: "address" },
//       { name: "_value", type: "uint256" },
//     ],
//     name: "transfer",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [
//       { name: "newBasisPoints", type: "uint256" },
//       { name: "newMaxFee", type: "uint256" },
//     ],
//     name: "setParams",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [{ name: "amount", type: "uint256" }],
//     name: "issue",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [{ name: "amount", type: "uint256" }],
//     name: "redeem",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [
//       { name: "_owner", type: "address" },
//       { name: "_spender", type: "address" },
//     ],
//     name: "allowance",
//     outputs: [{ name: "remaining", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "basisPointsRate",
//     outputs: [{ name: "", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [{ name: "", type: "address" }],
//     name: "isBlackListed",
//     outputs: [{ name: "", type: "bool" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [{ name: "_clearedUser", type: "address" }],
//     name: "removeBlackList",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: true,
//     inputs: [],
//     name: "MAX_UINT",
//     outputs: [{ name: "", type: "uint256" }],
//     payable: false,
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [{ name: "newOwner", type: "address" }],
//     name: "transferOwnership",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     constant: false,
//     inputs: [{ name: "_blackListedUser", type: "address" }],
//     name: "destroyBlackFunds",
//     outputs: [],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       { name: "_initialSupply", type: "uint256" },
//       { name: "_name", type: "string" },
//       { name: "_symbol", type: "string" },
//       { name: "_decimals", type: "uint256" },
//     ],
//     payable: false,
//     stateMutability: "nonpayable",
//     type: "constructor",
//   },
//   {
//     anonymous: false,
//     inputs: [{ indexed: false, name: "amount", type: "uint256" }],
//     name: "Issue",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [{ indexed: false, name: "amount", type: "uint256" }],
//     name: "Redeem",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [{ indexed: false, name: "newAddress", type: "address" }],
//     name: "Deprecate",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: false, name: "feeBasisPoints", type: "uint256" },
//       { indexed: false, name: "maxFee", type: "uint256" },
//     ],
//     name: "Params",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: false, name: "_blackListedUser", type: "address" },
//       { indexed: false, name: "_balance", type: "uint256" },
//     ],
//     name: "DestroyedBlackFunds",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [{ indexed: false, name: "_user", type: "address" }],
//     name: "AddedBlackList",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [{ indexed: false, name: "_user", type: "address" }],
//     name: "RemovedBlackList",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: true, name: "owner", type: "address" },
//       { indexed: true, name: "spender", type: "address" },
//       { indexed: false, name: "value", type: "uint256" },
//     ],
//     name: "Approval",
//     type: "event",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: true, name: "from", type: "address" },
//       { indexed: true, name: "to", type: "address" },
//       { indexed: false, name: "value", type: "uint256" },
//     ],
//     name: "Transfer",
//     type: "event",
//   },
//   { anonymous: false, inputs: [], name: "Pause", type: "event" },
//   { anonymous: false, inputs: [], name: "Unpause", type: "event" },
// ];

// const {
//   expectEvent,
//   expectRevert,
//   time,
// } = require("@openzeppelin/test-helpers");
// const { web3 } = require("@openzeppelin/test-helpers/src/setup");
// const { expect } = require("chai");

// // this function include the decimals
// toBN = (num) => web3.utils.toBN(num + "0".repeat(18));

// toWei = (num) => web3.utils.toWei(num);
// fromWei = (num) => web3.utils.fromWei(num);

// contract(
//   "Sale",
//   ([
//     owner,
//     user,
//     admin1,
//     admin2,
//     user2,
//     user3,
//     user4,
//     approve1,
//     approve2,
//     approve3,
//     feeReceiver,
//   ]) => {
//     let token, sale, tool, USDT_CONTRACT;

//     beforeEach(async function () {
//       const maxSupply = toBN(10000);
//       let USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
//       USDT_CONTRACT = new web3.eth.Contract(abi, USDT);

//       token = await Token.new(
//         [
//           ethers.utils.parseEther("500"),
//           ethers.utils.parseEther("1000"),
//           ethers.utils.parseEther("2000"),
//           ethers.utils.parseEther("300"),
//         ],
//         [5, 10, 15, 20],
//         feeReceiver,
//         maxSupply,
//         { from: owner }
//       );
//       sale = await Sale.new({ from: owner });
//       tool = await Tool.new({ from: owner });
//       sale.initialize(maxSupply, owner, token.address, USDT, admin2, {
//         from: owner,
//       });
//       const path = await tool.getPathOfEthToToken(USDT, { from: user });
//       const swap = await tool.swapETHToToken(path, {
//         from: user,
//         value: ethers.utils.parseUnits("10", "ether"),
//       });

//       await token.mint(owner, maxSupply, { from: owner });
//       await token.setExcludeFeeWallets([sale.address], true);
//       await token.approve(sale.address, maxSupply, { from: owner });
//     });

//     describe("Pruebas solo token", () => {
//       it("Transferencia de mas del primer amount", async function () {
//         const fees = await token.seeData();
//         console.log(fees.toString(), "amount");
//         const tx1 = await token.transfer(
//           user2,
//           ethers.utils.parseEther("1000"),
//           { from: owner }
//         );
//         const balance = await token.balanceOf(user2);
//         const tx2 = await token.transfer(
//           user3,
//           ethers.utils.parseEther("600"),
//           { from: user2 }
//         );
//         const balance2 = await token.balanceOf(user3);
//         const balanceFee = await token.balanceOf(feeReceiver);

//         console.log(
//           balance.toString(),
//           "balance user 2 despues de ponerle 501"
//         );
//         console.log(
//           balance2.toString(),
//           "balance user 3 despues de ponerle 501"
//         );
//         console.log(balanceFee.toString());
//       });
//     });

//     describe("Create phases", () => {
//       it("Create first phase", async function () {
//         const price = "5" /** 5$ per token*/,
//           min = toBN(2);
//         (supply = toBN(5000)),
//           (timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ]),
//           (percentToRelease = [10, 30, 50, 10]),
//           (dateEndPhase = Number(await time.latest()) + 3600);
//         /** the phase will last one hour */
//         const max = toBN(10);
//         const tx = await sale.createPhase(
//           true,
//           max,
//           min,
//           price,
//           dateEndPhase,
//           supply,
//           time.duration.days(60),
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         const phase = await sale.phases(1);

//         /** checking that the phase is created */
//         expect(phase.price.toString()).to.equal(
//           price.toString(),
//           "Phase price err"
//         );
//         expect(Number(phase.minimunEntry)).to.equal(
//           Number(min),
//           "Phase minimunEntry err"
//         );
//         expect(Number(phase.endAt)).to.equal(
//           Number(dateEndPhase),
//           "Phase ends err"
//         );
//         expect(Number(phase.supply)).to.equal(
//           Number(supply),
//           "Phase supply err"
//         );
//         expect(phase.isPublic).to.equal(true);
//         expect(phase.timelock.toString()).to.equal(
//           time.duration.days(60).toString()
//         );
//       });
//       it("Create first phase, buy tokens, cancel phase (by owner) and created another phase to buy", async function () {
//         const price = toBN(1),
//           min = toBN(2);
//         (supply = toBN(500)),
//           (timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ]),
//           (percentToRelease = [10, 30, 50, 10]),
//           (dateEndPhase =
//             Number(await time.latest()) +
//             3600) /** the phase will last one hour */;
//         const max = toBN(25);
//         const tx = await sale.createPhase(
//           true,
//           max,
//           min,
//           price,
//           dateEndPhase,
//           supply,
//           time.duration.days(60),
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         await expectRevert(
//           sale.createPhase(
//             true,
//             max,
//             min,
//             price,
//             dateEndPhase,
//             supply,
//             time.duration.days(60),
//             timeToRelease,
//             percentToRelease,
//             {
//               from: owner,
//             }
//           ),
//           "This phase isn't over"
//         );
//         expect((await token.balanceOf(user)).toString()).to.equal("0");

//         await sale.cancelPhase();

//         await sale.createPhase(
//           true,
//           max,
//           min,
//           price,
//           dateEndPhase,
//           supply,
//           0,
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         const approve = await USDT_CONTRACT.methods
//           .approve(sale.address, "75758450403")
//           .send({ from: user });

//         balanceUSDT = await USDT_CONTRACT.methods.balanceOf(user).call();
//         console.log("el primero", balanceUSDT);
//         await sale.buyTokenWithStableCoin(toBN(3), {
//           from: user,
//         });
//         balanceUSDT = await USDT_CONTRACT.methods
//           .balanceOf(sale.address)
//           .call();
//         let balanceUSDTuser = await USDT_CONTRACT.methods
//           .balanceOf(user)
//           .call();
//         console.log("el tercero", balanceUSDT);
//         console.log("el del user", balanceUSDTuser);
//         expect((await token.balanceOf(user)).toString()).to.equal(
//           toBN(3).toString()
//         );
//       });

//       it("Errors creating phases", async function () {
//         const maxSupply = toBN(1000),
//           timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ],
//           percentToRelease = [10, 30, 50, 10];
//         /// err end date is now less one second
//         const max = toBN(25);
//         await expectRevert(
//           sale.createPhase(
//             true,
//             max,
//             toBN(2),
//             1,
//             (await time.latest()) - 1,
//             toBN(1),
//             time.duration.days(60),
//             timeToRelease,
//             percentToRelease,
//             {
//               from: owner,
//             }
//           ),
//           "The end of the phase should be greater than now"
//         );
//         /// err more that maxSupply (the current supply is maxSupply - phase one original supply)
//         await expectRevert(
//           sale.createPhase(
//             true,
//             max,
//             toBN(1),
//             1,
//             (await time.latest()) + 1,
//             maxSupply + 20,
//             time.duration.days(60),
//             timeToRelease,
//             percentToRelease,
//             {
//               from: owner,
//             }
//           ),
//           "Not enough supply to mint"
//         );

//         await expectRevert(
//           sale.createPhase(
//             true,
//             max,
//             toBN(1),
//             1,
//             (await time.latest()) + 1,
//             maxSupply + 20,
//             time.duration.days(60),
//             timeToRelease,
//             percentToRelease,
//             {
//               from: user,
//             }
//           ),
//           `AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000`
//         );

//         await expectRevert(
//           sale.createPhase(
//             true,
//             max,
//             toBN(1),
//             1,
//             (await time.latest()) + 1,
//             maxSupply + 20,
//             time.duration.days(60),
//             timeToRelease,
//             [10, 100, 12, 15],
//             {
//               from: owner,
//             }
//           ),
//           "Percentages do not add to 100"
//         );

//         await expectRevert(
//           sale.createPhase(
//             true,
//             max,
//             toBN(1),
//             1,
//             (await time.latest()) + 1,
//             maxSupply + 20,
//             time.duration.days(60),
//             timeToRelease,
//             [10, 100, 12],
//             {
//               from: owner,
//             }
//           ),
//           "No match entry"
//         );

//         await expectRevert(
//           sale.createPhase(
//             true,
//             max,
//             toBN(1),
//             1,
//             (await time.latest()) + 1,
//             maxSupply + 20,
//             time.duration.days(60),
//             timeToRelease,
//             [10, 30, 0, 70],
//             {
//               from: owner,
//             }
//           ),
//           "No percent"
//         );

//         await expectRevert(
//           sale.createPhase(
//             true,
//             max,
//             toBN(1),
//             1,
//             (await time.latest()) + 1,
//             maxSupply + 20,
//             time.duration.days(60),
//             [0, 10, 10, 10],
//             percentToRelease,
//             {
//               from: owner,
//             }
//           ),
//           "No time"
//         );
//       });
//     });

//     describe("Vesting works", () => {
//       it("Should release token in the rigth time", async function () {
//         const price = toBN(1) /** 5$ per token */,
//           min = toBN(2);
//         (supply = toBN(5000)),
//           (timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ]),
//           (percentToRelease = [10, 30, 50, 10]),
//           (dateEndPhase =
//             Number(await time.latest()) +
//             time.duration.days(10)) /** the phase will last one hour */,
//           (timeLock = time.duration.days(60));
//         const max = toBN("400");
//         await sale.createPhase(
//           true,
//           max,
//           min,
//           price,
//           dateEndPhase,
//           supply,
//           timeLock,
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         const currentPhaseNumber = Number(await sale.currentPhase());

//         const id = 1;

//         const preUserBalance = Number(await token.balanceOf(user));
//         const prePhaseSupply = Number(
//           (await sale.phases(currentPhaseNumber)).supply
//         );
//         balanceUSDT = await USDT_CONTRACT.methods.balanceOf(user).call();
//         console.log(balanceUSDT);
//         const approve = await USDT_CONTRACT.methods
//           .approve(sale.address, "75758450403")
//           .send({ from: user });

//         await sale.buyTokenWithStableCoin(toBN("400"), {
//           from: user,
//         });

//         await expectRevert(
//           sale.release(id, { from: user }),
//           "Current time is before release time"
//         );

//         await time.increase(time.duration.days(15));

//         await sale.release(id, { from: user });
//         const posPhaseSupply = Number(
//           (await sale.phases(currentPhaseNumber)).supply
//         );

//         expect(preUserBalance).to.equal(0, "user phase one pre balance err");

//         // /// check the user have the token
//         expect(Number(await token.balanceOf(user))).to.equal(
//           Number((toBN("400") * 10) / 100),
//           "user phase one pos balance err"
//         );

//         await time.increase(time.duration.days(10));

//         await sale.release(id, { from: user });

//         expect(Number(await token.balanceOf(user))).to.equal(
//           Number((toBN("400") * 40) / 100),
//           "user phase one pos balance err"
//         );
//         await time.increase(time.duration.days(10));

//         await sale.release(id, { from: user });

//         expect(Number(await token.balanceOf(user))).to.equal(
//           Number((toBN("400") * 90) / 100),
//           "user phase one pos balance err"
//         );

//         await time.increase(time.duration.days(30));

//         await sale.release(id, { from: user });

//         expect(Number(await token.balanceOf(user))).to.equal(
//           Number((toBN("400") * 100) / 100),
//           "user phase one pos balance err"
//         );

//         await expectRevert(
//           sale.release(id, { from: user }),
//           "Already claim tokens"
//         );

//         await expectRevert(
//           sale.release(id, { from: owner }),
//           "This is not your id"
//         );

//         // /// check the phase supply decrase
//         expect(prePhaseSupply).to.equal(
//           posPhaseSupply + Number(toBN("400")),
//           "supply phase one balance err"
//         );
//       });
//     });

//     describe("End the phase diferent ways", () => {
//       it("Should end the phase (supply out)", async function () {
//         const dateEndPhase =
//             Number(await time.latest()) + time.duration.days(1),
//           supply = toBN(2500),
//           timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ],
//           percentToRelease = [10, 30, 50, 10],
//           isPublic = true,
//           min = toBN(2),
//           price = toBN(5);
//         const max = toBN(2500);

//         await sale.createPhase(
//           isPublic,
//           max,
//           min,
//           price,
//           dateEndPhase,
//           supply,
//           time.duration.days(60),
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         const currentPhaseNumber = await sale.currentPhase();

//         amountOfTokens = toBN(3);

//         // call the ETH/BNB needed to this operation
//         // const ethNeeded = price.mul(supply).div(await sale.getLatestPrice());

//         // / err not enought ETH/BNB

//         /// Err not enought tokens.
//         await expectRevert(
//           sale.buyTokenWithStableCoin(toBN(1), { from: user }),
//           "There are too few tokens"
//         );
//         const approve = await USDT_CONTRACT.methods
//           .approve(sale.address, "75758450403")
//           .send({ from: user });
//         await sale.buyTokenWithStableCoin(
//           (await sale.phases(currentPhaseNumber)).supply,
//           {
//             from: user,
//           }
//         );

//         // Check that the initial phase is over
//         assert.isTrue(
//           Boolean((await sale.phases(currentPhaseNumber)).over),
//           "The phase is over"
//         );

//         // check supply
//         expect(Number((await sale.phases(0)).supply)).to.equal(
//           0,
//           "Not enought supply"
//         );
//       });

//       it("Should end the phase (time out)", async function () {
//         const dateEndPhase = Number(await time.latest()) + 3600,
//           supply = toBN(2500),
//           timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ],
//           percentToRelease = [10, 30, 50, 10],
//           isPublic = true,
//           min = toBN(1),
//           price = toBN(1);
//         const max = supply;
//         await sale.createPhase(
//           isPublic,
//           max,
//           min,
//           price,
//           dateEndPhase,
//           supply,
//           time.duration.days(60),
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         amountOfTokens = toBN(3);

//         //increase time to end the phase
//         await time.increase(time.duration.hours(2));

//         await expectRevert(
//           sale.buyTokenWithStableCoin(amountOfTokens, { from: user }),
//           "This phase is over, wait for the next"
//         );
//       });
//     });

//     describe("Only owner functions works", () => {
//       it("Only owner can cancel the phase", async function () {
//         const dateEndPhase =
//             Number(await time.latest()) + time.duration.days(1),
//           supply = await sale.tokensRemainForSale(),
//           timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ],
//           percentToRelease = [10, 30, 50, 10];
//         const max = supply;
//         await sale.createPhase(
//           true,
//           max,
//           toBN(2),
//           5,
//           dateEndPhase,
//           supply,
//           25,
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         const currentPhaseNumber = Number(await sale.currentPhase());

//         await expectRevert(
//           sale.cancelPhase({ from: user }),
//           "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
//         );

//         await sale.cancelPhase({ from: owner });
//         assert.isTrue(
//           Boolean((await sale.phases(currentPhaseNumber)).over),
//           "The phase is over"
//         );
//       });
//     });

//     describe("Claims works", () => {
//       it("Should see id, time and percent to release", async function () {
//         const price = toBN(1) /** 278934$ per token*/,
//           min = toBN("1");
//         (supply = toBN(5000)),
//           (timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ]),
//           (percentToRelease = [10, 30, 50, 10]),
//           (dateEndPhase = Number(await time.latest()) + time.duration.days(10)),
//           (timeLock = 3600);

//         await sale.createPhase(
//           true,
//           supply,
//           min,
//           price,
//           dateEndPhase,
//           supply,
//           timeLock,
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         const id = "1";
//         const approve = await USDT_CONTRACT.methods
//           .approve(sale.address, "75758450403")
//           .send({ from: user });
//         const shop = await sale.buyTokenWithStableCoin(toBN("10"), {
//           from: user,
//         });

//         expectEvent(shop, "Purchase", {
//           _account: user,
//           _amount: toBN("10"),
//           _id: id,
//         });

//         await time.increase(time.duration.days(10));
//         expect(
//           (await sale.getPercentsToReleaseForID(id))[0].toString()
//         ).to.equal(percentToRelease[0].toString());
//         expect(
//           (await sale.getPercentsToReleaseForID(id))[1].toString()
//         ).to.equal(percentToRelease[1].toString());
//         expect(
//           (await sale.getPercentsToReleaseForID(id))[2].toString()
//         ).to.equal(percentToRelease[2].toString());
//         expect(
//           (await sale.getPercentsToReleaseForID(id))[3].toString()
//         ).to.equal(percentToRelease[3].toString());
//         await sale.release(id, { from: user });
//         expect((await sale.getWhenIsTheNextClaim(id)).toString()).to.equal(
//           (await sale.getTimesToReleaseForID(id))[1].toString()
//         );
//       });
//       it("Should recieve the purchase event and release event", async function () {
//         const price = toBN("1") /** 278934$ per token*/,
//           min = toBN("9");
//         (supply = toBN(5000)),
//           (timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ]),
//           (percentToRelease = [10, 30, 50, 10]),
//           (dateEndPhase =
//             Number(await time.latest()) +
//             time.duration.days(10)) /** the phase will last one hour */,
//           (timeLock = 3600);
//         const max = supply;
//         await sale.createPhase(
//           true,
//           max,
//           min,
//           price,
//           dateEndPhase,
//           supply,
//           timeLock,
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         const id = "1";
//         const approve = await USDT_CONTRACT.methods
//           .approve(sale.address, "75758450403")
//           .send({ from: user });
//         const shop = await sale.buyTokenWithStableCoin(toBN("10"), {
//           from: user,
//         });

//         expectEvent(shop, "Purchase", {
//           _account: user,
//           _amount: toBN("10"),
//           _id: id,
//         });

//         await time.increase(time.duration.days(20));

//         const release = await sale.release(id, { from: user });

//         expectEvent(release, "Claims", { _id: id });
//       });
//     });

//     describe("WhitesList works", () => {
//       it("Can create and delete an entire whitelist", async function () {
//         expect(await sale.getWhitelist()).deep.to.equal([]);
//         const whitelist = [approve1, approve2, approve3];
//         await sale.addToWhitelist(whitelist);
//         expect(await sale.getWhitelist()).deep.to.equal(whitelist);
//         await sale.removeWhitelistedAddress();
//         expect(await sale.getWhitelist()).deep.to.equal([]);
//       });
//       it("Only the two admins can access to the private phase", async function () {
//         const dateEndPhase =
//             Number(await time.latest()) + time.duration.days(10),
//           supply = await sale.tokensRemainForSale(),
//           timeToRelease = [
//             time.duration.days(10),
//             time.duration.days(20),
//             time.duration.days(30),
//             time.duration.days(60),
//           ],
//           percentToRelease = [10, 30, 50, 10];

//         await sale.createPhase(
//           false,
//           supply,
//           toBN(2),
//           5,
//           dateEndPhase,
//           supply,
//           25,
//           timeToRelease,
//           percentToRelease,
//           {
//             from: owner,
//           }
//         );

//         // add the admin to a whitelist
//         await sale.addToWhitelist([admin1, admin2]);

//         // the ordinary user cannot buy because the phase is private

//         await expectRevert(
//           sale.buyTokenWithStableCoin(toBN(2), { from: user }),
//           "This phase is private"
//         );
//       });
//     });
//   }
// );
