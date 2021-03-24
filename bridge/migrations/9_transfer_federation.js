const Bridge = artifacts.require("Bridge");
const Federation = artifacts.require('Federation');
const MultiSigWallet = artifacts.require('MultiSigWallet');
const isCeloNetwork = require('./isCeloNetwork')

module.exports = function (deployer, networkName, accounts) {
    if (isCeloNetwork(networkName)) return

    deployer
        .then(async () => {
            const federation = await Federation.deployed();
            const bridge = await Bridge.deployed();
            await federation.setBridge(bridge.address);
            const multiSig = await MultiSigWallet.deployed();
            await federation.transferOwnership(multiSig.address);
        });
}