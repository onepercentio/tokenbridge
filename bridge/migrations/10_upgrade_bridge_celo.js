//const { scripts, ConfigManager } = require('@openzeppelin/cli');
const BridgeV1Proxy = artifacts.require("Bridge_Celo");
const BridgeV2 = artifacts.require("Bridge_Celo_v2");
const Utils = artifacts.require("Utils");
const isCeloNetwork = require('./isCeloNetwork')
const { upgradeProxy, admin } = require('@openzeppelin/truffle-upgrades')

module.exports = async function (deployer, networkName, accounts) {
  if (!isCeloNetwork(networkName)) return console.log('Skipping on ethereum')

  await deployer.deploy(Utils)
  
  console.log('Linking both Bridge and Utils')
  await deployer.link(Utils, BridgeV2);
  
  console.log('Upgrading bridge')

  const instance = await upgradeProxy(BridgeV1Proxy.address, BridgeV2, { deployer, unsafeAllowLinkedLibraries: true })
  
  console.log('Upgraded', instance.address);
};
