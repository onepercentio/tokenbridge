const SideTokenFactory = artifacts.require('SideTokenFactory_v0');

module.exports = async (deployer, networkName, accounts) => {
    await deployer.deploy(SideTokenFactory);
}