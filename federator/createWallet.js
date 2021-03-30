const ethers = require('ethers')


// const wallet = ethers.Wallet.createRandom('asdf321w65e1fa3s2d1f6514321a36w5e1f3s2d')
const wallet = ethers.Wallet.fromMnemonic('')
console.log(wallet.address)
console.log(wallet.mnemonic.phrase)
console.log(wallet.privateKey)