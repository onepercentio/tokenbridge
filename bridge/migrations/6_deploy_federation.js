const Federation = artifacts.require("Federation");

module.exports = function(deployer, networkName, accounts) {
    deployer
        .then(async () => {
            return deployer.deploy(Federation, [accounts[0]], 1);
            // return deployer.deploy(Federation, ['0x54527846aDe7e915F4261e1818A997250cE83418'], 1);

            // Replace with below line to use multiple federators
            // return deployer.deploy(Federation, [accounts[0], accounts[1], accounts[2]], 3);
        });
};