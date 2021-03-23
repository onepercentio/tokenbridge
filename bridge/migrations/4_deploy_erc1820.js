require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
//const { singletons } = require('@openzeppelin/test-helpers');
const ERC1820Registry = artifacts.require("ERC1820Registry");

module.exports = function(deployer, networkName, accounts) {
  deployer.deploy( ERC1820Registry, [accounts[0]], 1);
};

