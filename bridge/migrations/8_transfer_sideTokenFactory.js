const Bridge = artifacts.require("Bridge");
const SideTokenFactory = artifacts.require('SideTokenFactory');
const isCeloNetwork = require('./isCeloNetwork')

module.exports = function (deployer, networkName, accounts) {
    if (isCeloNetwork(networkName)) return console.log('Skipping on celo')

    deployer
        .then(async () => {
            const sideTokenFactory = await SideTokenFactory.deployed();
            const bridge = await Bridge.deployed();
            console.log("Bridge Address", bridge.address)
            await sideTokenFactory.transferPrimary(bridge.address);
        });
}