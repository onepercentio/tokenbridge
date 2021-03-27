
const MainToken = artifacts.require('MainToken');

function shouldDeployToken(network) {
    return !network.toLowerCase().includes('mainnet');
}

module.exports = function(deployer, networkName, accounts) {
    deployer
    .then(() => {
        if(shouldDeployToken(networkName)) {
            console.log('will deploy token')
            return deployer.deploy(MainToken, 'MAIN', 'MAIN', 18, web3.utils.toWei('1000'));
        }
    });
}