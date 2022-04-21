/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
const HDWalletProvider = require("@truffle/hdwallet-provider");
const ContractKit = require('@celo/contractkit')
const fs = require('fs');
const Web3 = require('web3')
const path = require('path')


const MNEMONIC_DEV = fs.existsSync('./mnemonic_test.key') ? fs.readFileSync('./mnemonic_test.key', { encoding: 'utf8' }) : "";
const MNEMONIC_PROD = fs.existsSync('./mnemonic_prod.key') ? fs.readFileSync('./mnemonic_prod.key', { encoding: 'utf8' }) : "";
const INFURA_API_KEY = fs.existsSync('./infura.key') ? fs.readFileSync('./infura.key',{ encoding: 'utf8' }) : "";

const PRIVATE_KEY_PROD = fs.existsSync('./privateKey.secret') ? fs.readFileSync('./privateKey.secret',{ encoding: 'utf8' }) : "";
// const PRIVATE_KEY_PROD = fs.existsSync('./privateKey2.secret') ? fs.readFileSync('./privateKey2.secret',{ encoding: 'utf8' }) : "";
const PRIVATE_KEY_DEV = fs.existsSync('./privateKey_dev.secret') ? fs.readFileSync('./privateKey_dev.secret',{ encoding: 'utf8' }) : "";

const celoProvider = (pk, host) => {
  console.log('celo provider host:', host)
  const web3 = new Web3(host)

  const kit = ContractKit.newKitFromWeb3(web3)
  const account = web3.eth.accounts.privateKeyToAccount(pk)
  console.log(`Account address: ${account.address}`)
  kit.addAccount(account.privateKey)

  return kit.web3.currentProvider
}

const hd = new HDWalletProvider(MNEMONIC_PROD, "https://mainnet.infura.io/v3/" + INFURA_API_KEY)
console.log(hd)

const ONE_GWEI = 1000000000


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!met
  networks: {
    //Ganache
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 6300000,
      gasPrice: 1000000000,
    },
    //RSK
    rskregtest: {
      host: "127.0.0.1",
      port: 4444,
      network_id: "33",
      gas: 6300000,
      gasPrice: 60000000 // 0.06 gwei
    },
    soliditycoverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    },
    rsktestnet: {
      provider: () =>
        new HDWalletProvider(MNEMONIC, "https://public-node.testnet.rsk.co"),
      network_id: 31,
      gas: 6300000,
      gasPrice: 70000000, // 0.07 gwei
      skipDryRun: true
    },
    rskmainnet: {
      provider: () =>
        new HDWalletProvider(MNEMONIC, "https://public-node.rsk.co"),
      network_id: 30,
      gas: 6300000,
      gasPrice: 65000000, // 0.065 gwei
      skipDryRun: true
    },
     //Ethereum
     ropsten: {
      provider: () => new HDWalletProvider(MNEMONIC_DEV, "https://ropsten.infura.io/v3/" + INFURA_API_KEY),
      network_id: 3,
      gas: 4700000,
      gasPrice: 10000000000,
      skipDryRun: true
    },
    kovan: {
      provider: () => new HDWalletProvider(MNEMONIC_DEV, "https://kovan.infura.io/v3/" + INFURA_API_KEY),
      network_id: 42,
      gas: 6300000,
      gasPrice: 1000000000,
      skipDryRun: true,
      networkCheckTimeout: 300000
    },
    rinkeby: {
      provider: () => new HDWalletProvider(MNEMONIC_DEV, "https://rinkeby.infura.io/v3/" + INFURA_API_KEY),
      network_id: 4,
      gas: 6300000,
      gasPrice: 10000000000,
      skipDryRun: true
    },
    mainnet: {
      provider: () => new HDWalletProvider(MNEMONIC_PROD, "https://mainnet.infura.io/v3/" + INFURA_API_KEY),
      network_id: 1,
      gas: 3000000,
      gasPrice: 60 * ONE_GWEI,
      skipDryRun: true
    },
    // Celo
    alfajores: {
      provider: celoProvider(PRIVATE_KEY_DEV, 'https://alfajores-forno.celo-testnet.org'),
      gasPrice: 1000000000,
      network_id: 44787
    },
    celo: {
      provider: celoProvider(PRIVATE_KEY_PROD, 'https://forno.celo.org'),
      gasPrice: 500000000,
      network_id: 42220
    }
  },
  plugins: ["solidity-coverage"],
  // mocha: {
  //   reporter: 'eth-gas-reporter',
    //reporterOptions : { ... } // See options below
  // },
  compilers: {
      solc: {
        version: "0.5.17",
        settings: {
          optimizer: {
            enabled: false,
            // Optimize for how many times you intend to run the code.
            // Lower values will optimize more for initial deployment cost, higher
            // values will optimize more for high-frequency usage.
            runs: 200
          }
        }
      }
  }
};