
require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
const ERC1820Registry = artifacts.require("ERC1820Registry");
const isCeloNetwork = require('./isCeloNetwork')

module.exports = async function (deployer, networkName, accounts) {
  if (!isCeloNetwork(networkName)) return

  try {
    // if it's deployed, move on
    await ERC1820Registry.deployed()
  } catch (error) {
    // deploy an exit
    await deployer.deploy(ERC1820Registry);
    console.log('!!exiting so you can change erc1820 address on bridge and erc777 contracts!!')
    process.exit()
  }


};