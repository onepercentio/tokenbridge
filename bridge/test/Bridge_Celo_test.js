// const MainToken = artifacts.require('./MainToken');
// const Bridge = artifacts.require('./Bridge_Celo');
// const AllowTokens = artifacts.require('./AllowTokens');
// const SideTokenFactory = artifacts.require('./SideTokenFactory');
// const ERC1820Registry = artifacts.require('./ERC1820Registry');
// const MultiSigWallet = artifacts.require('./MultiSigWallet');
// const UtilsContract = artifacts.require('./Utils');

// const utils = require('./utils');
// const BN = web3.utils.BN;
// const randomHex = web3.utils.randomHex;
// const ONE_DAY = 24*3600;

// contract('Bridge', async function (accounts) {
//     const bridgeOwner = accounts[0];
//     const tokenOwner = accounts[1];
//     const bridgeManager = accounts[2];
//     const anAccount = accounts[3];
//     const newBridgeManager = accounts[4];
//     const federation = accounts[5];

//     beforeEach(async function () {
//       console.log(1)
//       this.token = await MainToken.new("MAIN", "MAIN", 18, web3.utils.toWei('1000000000'), { from: tokenOwner });
//       console.log(2)
//       this.allowTokens = await AllowTokens.new(bridgeManager);
//       console.log(3)
//       await this.allowTokens.addAllowedToken(this.token.address, {from: bridgeManager});
//       console.log(4)
//       this.sideTokenFactory = await SideTokenFactory.new();
//       console.log(5)
//       this.utilsContract = await UtilsContract.deployed();
//       console.log(6)
//       await Bridge.link(UtilsContract, this.utilsContract.address);
//       console.log(7)
//       this.bridge = await Bridge.new();
//       console.log(8)
//       await this.bridge.methods['initialize(address,address,address,address,string)'](bridgeManager, 
//         federation, this.allowTokens.address, this.sideTokenFactory.address, 'e');
//       console.log(9)
//         await this.sideTokenFactory.transferPrimary(this.bridge.address);
//     });

//     describe('ERC1820 setup', async function () {

//         it('should have set the erc 1820 set in the initialize function', async function () {
//             const result = await this.bridge.erc1820();
//             assert.equal(result, '0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24');
//         });

//         it('should allow a new erc 1820 address to be set', async function () {
//           const erc1820 = await ERC1820Registry.new()
//           await this.bridge.setERC1820Address(erc1820.address);
//           const result = await this.bridge.erc1820();
//           assert.equal(result, erc1820.address);
//       });

//       });
// });

