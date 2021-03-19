const { newKit } = require('@celo/contractkit')
const web3 = require('web3');
const fs = require('fs');
const abiBridge = require('../../../abis/Bridge.json');
const abiFederation = require('../../../abis/Federation.json');
const TransactionSender = require('./TransactionSender');
const CustomError = require('./CustomError');
const utils = require('./utils');

module.exports = class Federator {
    constructor(config, logger, Web3 = web3) {
        this.config = config;
        this.logger = logger;

        this.mainWeb3 = new Web3(config.mainchain.host);
        this.sideWeb3 = new Web3(config.sidechain.host);

        this.mainBridgeContract = new this.mainWeb3.eth.Contract(abiBridge, this.config.mainchain.bridge);
        this.sideBridgeContract = new this.sideWeb3.eth.Contract(abiBridge, this.config.sidechain.bridge);
        this.federationContract = new this.sideWeb3.eth.Contract(abiFederation, this.config.sidechain.federation);

        this.transactionSender = new TransactionSender(this.sideWeb3, this.logger, this.config);

        this.lastBlockPath = `${config.storagePath || __dirname}/lastBlock.txt`;
    }

    async run() {
        let retries = 1;
        // let retries = 3;
        const sleepAfterRetrie = 3000;
        while (retries > 0) {
            try {
                const currentBlock = await this.mainWeb3.eth.getBlockNumber();
                const chainId = await this.mainWeb3.eth.net.getId();
                let confirmations = 0; //for rsk regtest and ganache
                if (chainId == 31 || chainId == 42) { // rsk testnet and kovan
                    confirmations = 10
                }
                if (chainId == 1) { //ethereum mainnet 24hs
                    confirmations = 5760
                }
                if (chainId == 30) { // rsk mainnet 24hs
                    confirmations = 2880
                }
                const toBlock = currentBlock - confirmations;
                this.logger.info('Running to Block', toBlock);

                if (toBlock <= 0) {
                    return false;
                }

                if (!fs.existsSync(this.config.storagePath)) {
                    fs.mkdirSync(this.config.storagePath);
                }
                let originalFromBlock = this.config.mainchain.fromBlock || 0;
                let fromBlock = null;
                try {
                    fromBlock = fs.readFileSync(this.lastBlockPath, 'utf8');
                } catch (err) {
                    fromBlock = originalFromBlock;
                }
                if (fromBlock < originalFromBlock) {
                    fromBlock = originalFromBlock;
                }
                if (fromBlock >= toBlock) {
                    this.logger.warn(`Current chain Height ${toBlock} is the same or lesser than the last block processed ${fromBlock}`);
                    return false;
                }
                fromBlock = parseInt(fromBlock) + 1;
                this.logger.debug('Running from Block', fromBlock);

                const recordsPerPage = 1000;
                const numberOfPages = Math.ceil((toBlock - fromBlock) / recordsPerPage);
                this.logger.debug(`Total pages ${numberOfPages}, blocks per page ${recordsPerPage}`);

                var fromPageBlock = fromBlock;
                for (var currentPage = 1; currentPage <= numberOfPages; currentPage++) {
                    var toPagedBlock = fromPageBlock + recordsPerPage - 1;
                    if (currentPage == numberOfPages) {
                        toPagedBlock = toBlock
                    }
                    this.logger.debug(`Page ${currentPage} getting events from block ${fromPageBlock} to ${toPagedBlock}`);
                    const logs = await this.mainBridgeContract.getPastEvents('Cross', {
                        fromBlock: fromPageBlock,
                        toBlock: toPagedBlock
                    });
                    if (!logs) throw new Error('Failed to obtain the logs');

                    this.logger.info(`Found ${logs.length} logs`);
                    await this._processLogs(logs, toPagedBlock);
                    fromPageBlock = toPagedBlock + 1;
                }

                return true;
            } catch (err) {
                console.log(err)
                this.logger.error(new Error('Exception Running Federator'), err);
                retries--;
                this.logger.debug(`Run ${3 - retries} retrie`);
                if (retries > 0) {
                    await utils.sleep(sleepAfterRetrie);
                } else {
                    process.exit();
                }
            }
        }
    }

    async _processLogs(logs, toBlock) {
        try {
            const transactionSender = new TransactionSender(this.sideWeb3, this.logger, this.config);
            const from = await transactionSender.getAddress(this.config.privateKey);

            for (let log of logs) {
                this.logger.info('Processing event log:', log);

                const { _to: receiver, _amount: amount, _symbol: symbol, _tokenAddress: tokenAddress,
                    _decimals: decimals, _granularity: granularity } = log.returnValues;

                let transactionId = await this.federationContract.methods.getTransactionId(
                    tokenAddress,
                    receiver,
                    amount,
                    symbol,
                    log.blockHash,
                    log.transactionHash,
                    log.logIndex,
                    decimals,
                    granularity
                ).call();
                this.logger.info('get transaction id:', transactionId);

                let wasProcessed = await this.federationContract.methods.transactionWasProcessed(transactionId).call();
                if (!wasProcessed) {
                    let hasVoted = await this.federationContract.methods.hasVoted(transactionId).call({ from: from });
                    if (!hasVoted) {
                        this.logger.info(`Voting tx: ${log.transactionHash} block: ${log.blockHash} token: ${symbol}`);
                        await this._voteTransaction(tokenAddress,
                            receiver,
                            amount,
                            symbol,
                            log.blockHash,
                            log.transactionHash,
                            log.logIndex,
                            decimals,
                            granularity);
                    } else {
                        this.logger.debug(`Block: ${log.blockHash} Tx: ${log.transactionHash} token: ${symbol}  has already been voted by us`);
                    }

                } else {
                    this.logger.debug(`Block: ${log.blockHash} Tx: ${log.transactionHash} token: ${symbol} was already processed`);
                }
            }
            // this._saveProgress(this.lastBlockPath, toBlock);

            return true;
        } catch (err) {
            // throw new CustomError(`Exception processing logs`, err);
        }
    }


    async _voteTransaction(tokenAddress, receiver, amount, symbol, blockHash, transactionHash, logIndex, decimals, granularity) {
        try {

            const transactionSender = new TransactionSender(this.sideWeb3, this.logger, this.config);
            this.logger.info(`Voting Transfer ${amount} of ${symbol} trough sidechain bridge ${this.sideBridgeContract.options.address} to receiver ${receiver}`);

            let txId = await this.federationContract.methods.getTransactionId(
                tokenAddress,
                receiver,
                amount,
                symbol,
                blockHash,
                transactionHash,
                logIndex,
                decimals,
                granularity
            ).call();


            console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-')
            console.log(this.federationContract.options.address)

            const kit = newKit('https://alfajores-forno.celo-testnet.org')
            kit.connection.addAccount(this.config.privateKey)
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
                this.federationContract.options.address
            )

            console.log({tokenAddress,
                receiver,
                amount,
                symbol,
                blockHash,
                transactionHash,
                logIndex,
                decimals,
                granularity})

            console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-')

            const txObj = instance.methods.voteTransaction(
                tokenAddress,
                receiver,
                amount,
                symbol,
                blockHash,
                transactionHash,
                logIndex,
                decimals,
                granularity
            )

            const tx = await kit.sendTransactionObject(txObj, { from: '0x3Ed68019F385A51FA92E6e1009C4Afa2e4Cc3e1F' })

            console.log(await tx.waitReceipt())

            return

            let txData = await this.federationContract.methods.voteTransaction(
                tokenAddress,
                receiver,
                amount,
                symbol,
                blockHash,
                transactionHash,
                logIndex,
                decimals,
                granularity
            ).encodeABI();

            console.log(`${tokenAddress}, ${receiver}, ${amount}, ${symbol}, ${blockHash}, ${transactionHash}, ${logIndex}, ${decimals}, ${granularity}`)

            this.logger.info(`voteTransaction(${tokenAddress}, ${receiver}, ${amount}, ${symbol}, ${blockHash}, ${transactionHash}, ${logIndex}, ${decimals}, ${granularity})`);
            await transactionSender.sendTransaction(this.federationContract.options.address, txData, 0, this.config.privateKey);
            this.logger.info(`Voted transaction:${transactionHash} of block: ${blockHash} token ${symbol} to Federation Contract with TransactionId:${txId}`);
            return true;
        } catch (err) {
            console.log(err)
            // throw new CustomError(`Exception Voting tx:${transactionHash} block: ${blockHash} token ${symbol}`, err);
        }
    }

    _saveProgress(path, value) {
        if (value) {
            fs.writeFileSync(path, value);
        }
    }
}
