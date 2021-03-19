// deployer 0x3Ed68019F385A51FA92E6e1009C4Afa2e4Cc3e1F
// token 0xdCC398CEdF8Af4d30698331fd571aE66FfF6fdFf
// allowed 0x47d6603840D765aa092F80c98af9Ed2464ab2C07
// bridge 0x3dc71bf336d5d9680713248b0e1443b3f796969c


allowTokens = await AllowTokens.deployed()
multisig = await MultiSigWallet.deployed()
bridge = await Bridge.deployed()
token = await MainToken.deployed()

allowData = (await allowTokens.addAllowedToken.request('0xdCC398CEdF8Af4d30698331fd571aE66FfF6fdFf')).data

await multisig.submitTransaction('0x47d6603840D765aa092F80c98af9Ed2464ab2C07', 0, allowData)

await allowed.isTokenAllowed('0xdCC398CEdF8Af4d30698331fd571aE66FfF6fdFf') // true

token = await MainToken.deployed()

(await token.balanceOf('0x3Ed68019F385A51FA92E6e1009C4Afa2e4Cc3e1F')).toString() // 1000000000000000000000

await bridge.receiveTokens('0xdCC398CEdF8Af4d30698331fd571aE66FfF6fdFf', '1000000000000000000')

// config federator
// celo https://alfajores-forno.celo-testnet.org
// kovan https://kovan.infura.io/v3/cab9930f8ed349d0b3a3b9bba5a00bd5