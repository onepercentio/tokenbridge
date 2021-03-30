
require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });
const CustomERC1820Registry = artifacts.require("ERC1820Registry");
const isCeloNetwork = require('./isCeloNetwork')

module.exports = async function (deployer, networkName, accounts) {
  if (isCeloNetwork(networkName)) {
    return deployer.deploy(CustomERC1820Registry);
  }

  if (networkName === 'development') {
    return ERC1820Registry(accounts[0]);
  }

  console.log('Skipping ERC1820 deployment')
};


require('@openzeppelin/test-helpers/configure')({ provider: web3.currentProvider, environment: 'truffle' });

//This will be removed when the new RSKJ version is released
var resolve = require('resolve');
const path = require("path");
const testHelperNodeMulesPath =  path.dirname(resolve.sync("@openzeppelin/test-helpers"));
const ether = require(testHelperNodeMulesPath+'/src/ether');
const send = require(testHelperNodeMulesPath+'/src/send');

const { getSingletonsConfig } = require(testHelperNodeMulesPath+'/src/config/singletons');

const { setupLoader } = require('@openzeppelin/contract-loader');

const {
  ERC1820_REGISTRY_ABI,
  ERC1820_REGISTRY_ADDRESS,
  ERC1820_REGISTRY_DEPLOY_TX,
} = require(testHelperNodeMulesPath+'/src/data');

async function ERC1820Registry (funder) {
  // Read https://eips.ethereum.org/EIPS/eip-1820 for more information as to how the ERC1820 registry is deployed to
  // ensure its address is the same on all chains.

  if ((await web3.eth.getCode(ERC1820_REGISTRY_ADDRESS)).length > '0x00'.length) {
    return getDeployedERC1820Registry();
  }

  // 0.08 ether is needed to deploy the registry, and those funds need to be transferred to the account that will deploy
  // the contract.
  await send.ether(funder, '0xa990077c3205cbDf861e17Fa532eeB069cE9fF96', ether('0.08'));

  await web3.eth.sendSignedTransaction(ERC1820_REGISTRY_DEPLOY_TX);

  return getDeployedERC1820Registry();
}

async function getDeployedERC1820Registry () {
  const config = getSingletonsConfig();
  const loader = setupLoader({
    provider: web3.currentProvider,
    defaultGas: config.defaultGas,
    defaultSender: config.defaultSender,
  });

  if (config.abstraction === 'truffle') {
    const registry = loader.truffle.fromABI(ERC1820_REGISTRY_ABI);
    return registry.at(ERC1820_REGISTRY_ADDRESS);

  } else if (config.abstraction === 'web3') {
    const registry = loader.web3.fromABI(ERC1820_REGISTRY_ABI);
    registry.options.address = ERC1820_REGISTRY_ADDRESS;

    return new web3.eth.Contract(ERC1820_REGISTRY_ABI, ERC1820_REGISTRY_ADDRESS);

  } else {
    throw new Error(`Unknown contract abstraction: '${config.abstraction}'`);
  }
}