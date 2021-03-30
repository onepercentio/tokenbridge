var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, networkName, accounts) {
  console.log(networkName)
  console.log(accounts)
  deployer.deploy(Migrations);
};
