const Bridge_Celo = artifacts.require("Bridge_Celo");
const SideTokenFactory = artifacts.require('SideTokenFactory');
const isCeloNetwork = require('./isCeloNetwork')

module.exports = function (deployer, networkName, accounts) {
  if (!isCeloNetwork(networkName)) return

  deployer
    .then(async () => {
      const sideTokenFactory = await SideTokenFactory.deployed();
      const bridge = await Bridge_Celo.deployed();
      console.log("Bridge Address", bridge.address)
      await sideTokenFactory.transferPrimary(bridge.address);
    });
}