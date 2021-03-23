// deployer 0x3Ed68019F385A51FA92E6e1009C4Afa2e4Cc3e1F
// token 0xdCC398CEdF8Af4d30698331fd571aE66FfF6fdFf
// allowed 0x47d6603840D765aa092F80c98af9Ed2464ab2C07
// bridge 0x3dc71bf336d5d9680713248b0e1443b3f796969c
// {
//     "bridge": "0x0dea70cdc84d27c973973be3aab0b003879ae3c8",
//     "federation": "0xf37f75d215030b891a82a997f5abb8e18e9beff2",
//     "multiSig": "0xc411b5d995df1b6ae73540c7c758975716c246ca",
//     "allowTokens": "0xc1fe18443310aa6fb69c40db10a56b4b70a05135",
//     "testToken": "0x7a9fcf3ad930e613ac2f08c35ff51fd216330f28",
//     "host": "https://alfajores-forno.celo-testnet.org",
//     "fromBlock": 4145063
// // }


allowTokens = await AllowTokens.deployed()
multisig = await MultiSigWallet.deployed()
bridge = await Bridge.deployed()
token = await MainToken.deployed()

allowData = (await allowTokens.addAllowedToken.request('0x7a9fcf3ad930e613ac2f08c35ff51fd216330f28')).data

await multisig.submitTransaction('0xc1fe18443310aa6fb69c40db10a56b4b70a05135', 0, allowData)

await allowTokens.isTokenAllowed('0x3dc71bf336d5d9680713248b0e1443b3f796969c') // true

token = '0x3dc71bf336d5d9680713248b0e1443b3f796969c'

(await token.balanceOf('0x3Ed68019F385A51FA92E6e1009C4Afa2e4Cc3e1F')).toString() // 1000000000000000000000

await bridge.receiveTokens('0x0dea70cdc84d27c973973be3aab0b003879ae3c8', '1000000000000000000')

// config federator
// celo https://alfajores-forno.celo-testnet.org
// kovan https://kovan.infura.io/v3/cab9930f8ed349d0b3a3b9bba5a00bd5