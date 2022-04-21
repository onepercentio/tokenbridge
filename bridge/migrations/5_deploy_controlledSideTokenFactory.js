const MultiSigWallet = artifacts.require("MultiSigWallet");
const ControlledSideTokenFactory = artifacts.require('ControlledSideTokenFactory');
const isCeloNetwork = require('./isCeloNetwork')

module.exports = function (deployer, networkName, accounts) {
    // if (!isCeloNetwork(networkName)) return console.log('Skipping on ethereum')

    // deployer.deploy(ControlledSideTokenFactory, MultiSigWallet.address);
};