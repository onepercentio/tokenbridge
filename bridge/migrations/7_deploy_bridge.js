const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const MultiSigWallet = artifacts.require("MultiSigWallet");
const Federation = artifacts.require("Federation");
const AllowTokens = artifacts.require('AllowTokens');
const SideTokenFactory = artifacts.require('SideTokenFactory');
const Bridge = artifacts.require('Bridge');
const Utils = artifacts.require("Utils");
const isCeloNetwork = require('./isCeloNetwork')

module.exports = async function (deployer, networkName, accounts) {
    if (isCeloNetwork(networkName)) return console.log('Skipping on Celo')

    let symbol = 'e';

    const multiSig = await MultiSigWallet.deployed();
    const allowTokens = await AllowTokens.deployed();
    const sideTokenFactory = await SideTokenFactory.deployed();
    const federation = await Federation.deployed();

    console.log('deploying utils')
    await deployer.deploy(Utils)

    console.log('linking both ...........')
    await deployer.link(Utils, Bridge);

    let initArgs = [multiSig.address, federation.address, allowTokens.address, sideTokenFactory.address, symbol];
    console.log('deploying upgradeable bridge')
    const instance = await deployProxy(Bridge, initArgs, { deployer, unsafeAllowLinkedLibraries: true })

    console.log('Deployed', instance.address);

}

//example https://github.com/OpenZeppelin/openzeppelin-sdk/tree/master/examples/truffle-migrate/migrations
// async function ozDeploy(options, name, alias, initArgs) {
//     try {
//         // Register v0 of MyContract in the zos project
//         scripts.add({ contractsData: [{ name: name, alias: alias }] });

//         // Push implementation contracts to the network
//         await scripts.push(options);

//         // Create an instance of MyContract, setting initial values
//         await scripts.create(Object.assign({ contractAlias: alias, methodName: 'initialize', methodArgs: initArgs }, options));
//     } catch (err) {
//         throw new Error(`Error on oz deployment ${err.stack}`);
//     }
// }

// module.exports = function(deployer, networkName, accounts) {
//     let symbol = 'e';

//     if(networkName == 'rskregtest' || networkName == 'rsktestnet' || networkName == 'rskmainnet'|| networkName === 'alfajores')
//         symbol = 'c';

//     deployer.then(async () => {
//         const multiSig = await MultiSigWallet.deployed();
//         const allowTokens = await AllowTokens.deployed();
//         const sideTokenFactory = await SideTokenFactory.deployed();
//         const federation = await Federation.deployed();

//         const { network, txParams } = await ConfigManager.initNetworkConfiguration({ network: networkName, from: accounts[0] });

//         console.log(network, txParams)

//         let initArgs = [multiSig.address, federation.address, allowTokens.address, sideTokenFactory.address, symbol ];
//         console.log(initArgs)

//         // if (networkName === 'soliditycoverage') {
//         //     //soldity coverage doesn't play along with oppen zeppelin sdk
//         //     //so we deploy the un initialized contract just to create the objects
//         //     return deployer.deploy(Bridge);
//         // }

//         // try{
//         //     //running truffle test re runs migrations and OZ exploits if aleready upgraded the contract, check if we already have run a migration
//         //     await Bridge.deployed();
//         // } catch(err) {
//             //If we haven't deployed it then re deploy.
//             await ozDeploy({ network, txParams }, 'Bridge', 'Bridge', initArgs);

//             // //Set the multisig as the Owner of the ProxyAdmin
//             // await scripts.setAdmin({ newAdmin: multiSig.address, network :network, txParams: txParams });
//         // }
//       })
// };