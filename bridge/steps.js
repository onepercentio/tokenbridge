// deployer 0xE42DD19efaCaF0339A5634Dcdf563754E7d98743
// token 0xdCC398CEdF8Af4d30698331fd571aE66FfF6fdFf
// allowed 0x47d6603840D765aa092F80c98af9Ed2464ab2C07
// bridge 0x3dc71bf336d5d9680713248b0e1443b3f796969c


allowTokens = await AllowTokens.deployed()
multisig = await MultiSigWallet.deployed()
bridge = await Bridge.deployed()
token = await MainToken.deployed()

allowData = (await allowTokens.addAllowedToken.request(token.address)).data

await multisig.submitTransaction(allowTokens.address, 0, allowData)

await allowTokens.isTokenAllowed(token.address)
// true

token = await MainToken.deployed()

(await token.balanceOf('0xE42DD19efaCaF0339A5634Dcdf563754E7d98743')).toString()
// 1000000000000000000000

await token.approve(bridge.address, '1000000000000000000000')

await bridge.receiveTokens(token.address, '1000000000000000000')

// config federator
// celo https://alfajores-forno.celo-testnet.org
// kovan https://kovan.infura.io/v3/cab9930f8ed349d0b3a3b9bba5a00bd5