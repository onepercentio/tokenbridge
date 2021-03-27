const SideTokenFactory = artifacts.require('SideTokenFactory');
const isCeloNetwork = require('./isCeloNetwork')

module.exports = function(deployer, networkName, accounts) {
    if (isCeloNetwork(networkName)) return

    deployer.deploy(SideTokenFactory);
};