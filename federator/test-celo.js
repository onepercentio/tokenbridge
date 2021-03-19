const { newKit } = require('@celo/contractkit')
const Web3 = require('web3');

const kit = newKit('https://alfajores-forno.celo-testnet.org')
kit.connection.addAccount('0xfb7bacb863436010ff2e5d9a8363e62f0ec353ff55a6e552675b6a7ec2faa5bd')
const instance = new kit.web3.eth.Contract(
  [
      {
          "inputs": [
              {
                  "internalType": "address[]",
                  "name": "_members",
                  "type": "address[]"
              },
              {
                  "internalType": "uint256",
                  "name": "_required",
                  "type": "uint256"
              }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
      },
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": false,
                  "internalType": "address",
                  "name": "bridge",
                  "type": "address"
              }
          ],
          "name": "BridgeChanged",
          "type": "event"
      },
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "transactionId",
                  "type": "bytes32"
              }
          ],
          "name": "Executed",
          "type": "event"
      },
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": true,
                  "internalType": "address",
                  "name": "member",
                  "type": "address"
              }
          ],
          "name": "MemberAddition",
          "type": "event"
      },
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": true,
                  "internalType": "address",
                  "name": "member",
                  "type": "address"
              }
          ],
          "name": "MemberRemoval",
          "type": "event"
      },
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": true,
                  "internalType": "address",
                  "name": "previousOwner",
                  "type": "address"
              },
              {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
              }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
      },
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "required",
                  "type": "uint256"
              }
          ],
          "name": "RequirementChange",
          "type": "event"
      },
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
              },
              {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "transactionId",
                  "type": "bytes32"
              },
              {
                  "indexed": false,
                  "internalType": "address",
                  "name": "originalTokenAddress",
                  "type": "address"
              },
              {
                  "indexed": false,
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
              },
              {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
              },
              {
                  "indexed": false,
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
              },
              {
                  "indexed": false,
                  "internalType": "bytes32",
                  "name": "blockHash",
                  "type": "bytes32"
              },
              {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "transactionHash",
                  "type": "bytes32"
              },
              {
                  "indexed": false,
                  "internalType": "uint32",
                  "name": "logIndex",
                  "type": "uint32"
              },
              {
                  "indexed": false,
                  "internalType": "uint8",
                  "name": "decimals",
                  "type": "uint8"
              },
              {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "granularity",
                  "type": "uint256"
              }
          ],
          "name": "Voted",
          "type": "event"
      },
      {
          "constant": true,
          "inputs": [],
          "name": "MAX_MEMBER_COUNT",
          "outputs": [
              {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [],
          "name": "bridge",
          "outputs": [
              {
                  "internalType": "contract IBridge",
                  "name": "",
                  "type": "address"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
              }
          ],
          "name": "isMember",
          "outputs": [
              {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [],
          "name": "isOwner",
          "outputs": [
              {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
              }
          ],
          "name": "members",
          "outputs": [
              {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [],
          "name": "owner",
          "outputs": [
              {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
              }
          ],
          "name": "processed",
          "outputs": [
              {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [],
          "name": "required",
          "outputs": [
              {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [
              {
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
              }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
              },
              {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
              }
          ],
          "name": "votes",
          "outputs": [
              {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [
              {
                  "internalType": "address",
                  "name": "_bridge",
                  "type": "address"
              }
          ],
          "name": "setBridge",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [
              {
                  "internalType": "address",
                  "name": "originalTokenAddress",
                  "type": "address"
              },
              {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
              },
              {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
              },
              {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
              },
              {
                  "internalType": "bytes32",
                  "name": "blockHash",
                  "type": "bytes32"
              },
              {
                  "internalType": "bytes32",
                  "name": "transactionHash",
                  "type": "bytes32"
              },
              {
                  "internalType": "uint32",
                  "name": "logIndex",
                  "type": "uint32"
              },
              {
                  "internalType": "uint8",
                  "name": "decimals",
                  "type": "uint8"
              },
              {
                  "internalType": "uint256",
                  "name": "granularity",
                  "type": "uint256"
              }
          ],
          "name": "voteTransaction",
          "outputs": [
              {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "internalType": "bytes32",
                  "name": "transactionId",
                  "type": "bytes32"
              }
          ],
          "name": "getTransactionCount",
          "outputs": [
              {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "internalType": "bytes32",
                  "name": "transactionId",
                  "type": "bytes32"
              }
          ],
          "name": "hasVoted",
          "outputs": [
              {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "internalType": "bytes32",
                  "name": "transactionId",
                  "type": "bytes32"
              }
          ],
          "name": "transactionWasProcessed",
          "outputs": [
              {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [
              {
                  "internalType": "address",
                  "name": "originalTokenAddress",
                  "type": "address"
              },
              {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
              },
              {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
              },
              {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
              },
              {
                  "internalType": "bytes32",
                  "name": "blockHash",
                  "type": "bytes32"
              },
              {
                  "internalType": "bytes32",
                  "name": "transactionHash",
                  "type": "bytes32"
              },
              {
                  "internalType": "uint32",
                  "name": "logIndex",
                  "type": "uint32"
              },
              {
                  "internalType": "uint8",
                  "name": "decimals",
                  "type": "uint8"
              },
              {
                  "internalType": "uint256",
                  "name": "granularity",
                  "type": "uint256"
              }
          ],
          "name": "getTransactionId",
          "outputs": [
              {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
              }
          ],
          "payable": false,
          "stateMutability": "pure",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [
              {
                  "internalType": "address",
                  "name": "_newMember",
                  "type": "address"
              }
          ],
          "name": "addMember",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [
              {
                  "internalType": "address",
                  "name": "_oldMember",
                  "type": "address"
              }
          ],
          "name": "removeMember",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "constant": true,
          "inputs": [],
          "name": "getMembers",
          "outputs": [
              {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
              }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
      },
      {
          "constant": false,
          "inputs": [
              {
                  "internalType": "uint256",
                  "name": "_required",
                  "type": "uint256"
              }
          ],
          "name": "changeRequirement",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
      }
  ],
  '0xf37f75d215030b891a82a997f5abb8e18e9beff2'
)
;(async () => {
  const tx = await instance.methods.getMembers().call()
  console.log(tx)
  // console.log(await tx.waitReceipt())
})()
