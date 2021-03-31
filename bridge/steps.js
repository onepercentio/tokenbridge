// deployer 0xE42DD19efaCaF0339A5634Dcdf563754E7d98743
// token 0xdCC398CEdF8Af4d30698331fd571aE66FfF6fdFf
// allowed 0x47d6603840D765aa092F80c98af9Ed2464ab2C07
// bridge 0x3dc71bf336d5d9680713248b0e1443b3f796969c

bridge = await Bridge.deployed()
allowTokens = await AllowTokens.deployed()
multisig = await MultiSigWallet.deployed()
token = await MainToken.deployed()
bridge = await Bridge_Celo.deployed()

allowData = (await allowTokens.addAllowedToken.request('0xfc98e825a2264d890f9a1e68ed50e1526abccacd')).data

await multisig.submitTransaction(allowTokens.address, 0, allowData)

maxData = (await allowTokens.setMaxTokensAllowed.request('200000000000000000000000')).data
await multisig.submitTransaction(allowTokens.address, 0, maxData)

dailyData = (await allowTokens.changeDailyLimit.request('200000000000000000000000')).data
await multisig.submitTransaction(allowTokens.address, 0, dailyData)

addData = (await multisig.addOwner.request('0xF2d3af8181600faa5C1BEE7398fcE1277a3B049A')).data
await multisig.submitTransaction(multisig.address, 0, addData)

changeData = (await multisig.changeRequirement.request('2')).data
await multisig.submitTransaction(multisig.address, 0, changeData)

await allowTokens.isTokenAllowed(token.address)
await allowTokens.isTokenAllowed('0xfc98e825a2264d890f9a1e68ed50e1526abccacd')
// true

token = await MainToken.deployed()

(await token.balanceOf('0xE42DD19efaCaF0339A5634Dcdf563754E7d98743')).toString()
// 1000000000000000000000

await token.approve(bridge.address, '100000000000000000000000000000000000000')

await bridge.receiveTokens(token.address, '22345600000000000000')

// config federator
// celo https://alfajores-forno.celo-testnet.org
// kovan https://kovan.infura.io/v3/cab9930f8ed349d0b3a3b9bba5a00bd5

// change side token factory
changeData = (await bridge.changeSideTokenFactory.request('0x35c4C11411360FaF4c77D668FA05Ff0E02CA32Fd')).data
await multisig.submitTransaction(bridge.address, 0, changeData)

// transfer side token factory primary to bridge
bridge = await Bridge_Celo.deployed()
sideTokenFactory = await ControlledSideTokenFactory.deployed()
await sideTokenFactory.transferPrimary(bridge.address)

// add member
federation = await Federation.deployed()
multisig = await MultiSigWallet.deployed()
addMemberData = await(await federation.addMember.request('0xE42DD19efaCaF0339A5634Dcdf563754E7d98743')).data
await multisig.submitTransaction(federation.address, 0, addMemberData)

// side token send to bridgeawait 
sideToken = await SideToken.at('0xc0930d0e5e9fb59a1cbf291db8cb5b896e9d95f5')
  (await sideToken.balanceOf('0xE42DD19efaCaF0339A5634Dcdf563754E7d98743')).toString()

await sideToken.transfer(bridge.address, '1365400000000000000')

// change 1820 address
multisig = await MultiSigWallet.deployed()
change1820 = await(await bridge.changeERC1820Address.request('0xed7b4D67ce7a2d23b6926A06b9277eCdD2e189b2')).data
await multisig.submitTransaction(bridge.address, 0, change1820)

// check celo erc1820 subscription
erc1820 = await ERC1820Registry.deployed()
await erc1820.getInterfaceImplementer(bridge.address, '0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b')

// alfajores main to bridge
token = await MainToken.deployed()
  (await token.balanceOf('0xE42DD19efaCaF0339A5634Dcdf563754E7d98743')).toString()
// 1000000000000000000000
await token.approve(bridge.address, '100000000000000000000000000000000000000')
await bridge.receiveTokens(token.address, '1010100000000000000')

// operator send sidetokes to bridge
transferData = (await sidetoken.operatorSend.request('0xE42DD19efaCaF0339A5634Dcdf563754E7d98743', '0xeced3d9d7cfcf45a151311e0978269c741f3724c', '12345600000000000000', '0x00', '0x00')).data
await multisig.submitTransaction(sidetoken.address, 0, transferData)
(await sidetoken.balanceOf('0xeced3d9d7cfcf45a151311e0978269c741f3724c')).toString()

transferData = (await sidetoken.operatorSend.request('0xeced3d9d7cfcf45a151311e0978269c741f3724c', bridge.address, '12345600000000000000', '0x00', '0x00')).data
await multisig.submitTransaction(sidetoken.address, 0, transferData)

token = await MainToken.deployed()

(await token.balanceOf('0xeced3d9d7cfcf45a151311e0978269c741f3724c')).toString()