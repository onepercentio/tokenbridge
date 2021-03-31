const MultiSigWallet = artifacts.require("MultiSigWallet");

module.exports = async function(deployer, networkName, accounts) {
    // await deployer.deploy(MultiSigWallet, [accounts[0]], 1);
    await deployer.deploy(MultiSigWallet, ['0x9f08BFD816f4F3baE31dEE2e2f4119dcf25824AD'], 1);

    const multisig = await MultiSigWallet.deployed()

    const isOwner = await multisig.isOwner(accounts[0])

    console.log('is owner', accounts[0], isOwner)

    // Replace with below line to use multiple federators
    // deployer.deploy(MultiSigWallet, [accounts[0], accounts[1], accounts[2]], 3);
};