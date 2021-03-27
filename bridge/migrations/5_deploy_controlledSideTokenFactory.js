const MultiSigWallet = artifacts.require("MultiSigWallet");
const ControlledSideTokenFactory = artifacts.require('ControlledSideTokenFactory');
const isCeloNetwork = require('./isCeloNetwork')

module.exports = function (deployer, networkName, accounts) {
    if (!isCeloNetwork(networkName)) return

    deployer.deploy(ControlledSideTokenFactory, MultiSigWallet.address);
};