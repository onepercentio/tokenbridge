
    // io/tokenbridgeThis script looks for a .secret file in the project root. 
    // If none is found, it creates an account private key and saves the key in a new .secret file. 
    // If a .secret file is found, it returns an account object corresponding to the stored private key.

const Web3 = require('web3')
const fs = require('fs')
const path = require('path')
var web3 = new Web3();

const filePath = path.join('', './privateKey.secret');

function getAccount() {
    return web3.eth.accounts.privateKeyToAccount('0xfb7bacb863436010ff2e5d9a8363e62f0ec353ff55a6e552675b6a7ec2faa5bd')
    // return new Promise(resolve => {
    //     if(fs.existsSync(filePath)){
    //         fs.readFile(filePath, {encoding: 'utf-8'}, (err, data) => {
    //             resolve(web3.eth.accounts.privateKeyToAccount('0xfb7bacb863436010ff2e5d9a8363e62f0ec353ff55a6e552675b6a7ec2faa5bd'))
    //         })
    //     } else {
    //         let randomAccount = web3.eth.accounts.create()
            
        
    //         fs.writeFile(filePath, randomAccount.privateKey, (err) => {
    //             if(err) {
    //                 return console.log(err);
    //             }
    //         })

    //         resolve(randomAccount)
            
    //     }
    // })
}

module.exports = {
    getAccount
}