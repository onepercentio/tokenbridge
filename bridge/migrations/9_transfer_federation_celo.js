const BridgeCelo = artifacts.require("Bridge_Celo");
const Federation = artifacts.require('Federation');
const MultiSigWallet = artifacts.require('MultiSigWallet');
const isCeloNetwork = require('./isCeloNetwork')

module.exports = function (deployer, networkName, accounts) {
  if (!isCeloNetwork(networkName)) return console.log('Skipping on ethereum')

    deployer
        .then(async () => {
            const federation = await Federation.deployed();
            const bridge = await BridgeCelo.deployed();
            await federation.setBridge(bridge.address);
            const multiSig = await MultiSigWallet.deployed();
            await federation.transferOwnership(multiSig.address);
        });
}