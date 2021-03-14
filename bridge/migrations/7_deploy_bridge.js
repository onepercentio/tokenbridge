const MultiSigWallet = artifacts.require("MultiSigWallet");
const Federation = artifacts.require("Federation");
const AllowTokens = artifacts.require('AllowTokens');
const SideTokenFactory = artifacts.require('SideTokenFactory');
const Bridge = artifacts.require('Bridge');
const Utils = artifacts.require("Utils");




module.exports = function(deployer, networkName, accounts) {
    let symbol = 'e';

    if(networkName == 'rskregtest' || networkName == 'rsktestnet' || networkName == 'rskmainnet'|| networkName === 'alfajores')
        symbol = 'r';

    deployer.then(async () => {
        const multiSig = await MultiSigWallet.deployed();
        const allowTokens = await AllowTokens.deployed();
        const sideTokenFactory = await SideTokenFactory.deployed();
        const federation = await Federation.deployed();
        let initArgs = [multiSig.address, federation.address, allowTokens.address, sideTokenFactory.address, symbol ];

        await deployer.deploy(Bridge, initArgs,[accounts[0]], 1);
        
        await deployer.deploy(Utils)
        .then( () => {
            return deployer.link(Utils, Bridge);
            });

            //Set the multisig as the Owner of the ProxyAdmin
            //await scripts.setAdmin({ newAdmin:multiSig.address, network:network, txParams:txParams });
    });
};