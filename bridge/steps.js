// deployer 0xE42DD19efaCaF0339A5634Dcdf563754E7d98743
// token 0xdCC398CEdF8Af4d30698331fd571aE66FfF6fdFf
// allowed 0x47d6603840D765aa092F80c98af9Ed2464ab2C07
// bridge 0x3dc71bf336d5d9680713248b0e1443b3f796969c


allowTokens = await AllowTokens.deployed()
multisig = await MultiSigWallet.deployed()
// bridge = await Bridge.deployed()
bridge = await Bridge_Celo.deployed()
token = await MainToken.deployed()

allowData = (await allowTokens.addAllowedToken.request(token.address)).data

await multisig.submitTransaction(allowTokens.address, 0, allowData)

await allowTokens.isTokenAllowed(token.address)
// true

token = await MainToken.deployed()

(await token.balanceOf('0xE42DD19efaCaF0339A5634Dcdf563754E7d98743')).toString()
// 1000000000000000000000

await token.approve(bridge.address, '100000000000000000000000000000000000000')

await bridge.receiveTokens(token.address, '5432100000000000000')

// config federator
// celo https://alfajores-forno.celo-testnet.org
// kovan https://kovan.infura.io/v3/cab9930f8ed349d0b3a3b9bba5a00bd5

// add member

federation = await Federation.deployed()
multisig = await MultiSigWallet.deployed()
addMemberData = await (await federation.addMember.request('0xE42DD19efaCaF0339A5634Dcdf563754E7d98743')).data
await multisig.submitTransaction(federation.address, 0, addMemberData)


// side token send to bridge
sideToken = await SideToken.at('0xc0930d0e5e9fb59a1cbf291db8cb5b896e9d95f5')
(await sideToken.balanceOf('0xE42DD19efaCaF0339A5634Dcdf563754E7d98743')).toString()

await sideToken.transfer(bridge.address, '1365400000000000000')

// change 1820 address
multisig = await MultiSigWallet.deployed()
change1820 = await (await bridge.changeERC1820Address.request('0xed7b4D67ce7a2d23b6926A06b9277eCdD2e189b2')).data
await multisig.submitTransaction(bridge.address, 0, change1820)