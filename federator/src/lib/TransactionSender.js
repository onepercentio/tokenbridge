const Tx = require('ethereumjs-tx');
const ethUtils = require('ethereumjs-util');
const { newKit } = require('@celo/contractkit')
const utils = require('./utils');
const CustomError = require('./CustomError');
const fs = require('fs');
const abiFederation = require('../../../abis/Federation.json');

module.exports = class TransactionSender {
    constructor(client, logger, config) {
        this.client = client;
        this.logger = logger;
        this.chainId = null;
        this.manuallyCheck = `${config.storagePath || __dirname}/manuallyCheck.txt`;
    }

    async getNonce(address) {
        return this.client.eth.getTransactionCount(address, "pending");
    }

    numberToHexString(number) {
        if (!number) {
            return '0x0';
        }
        return `0x${Math.ceil(parseInt(number)).toString(16)}`;
    }

    async getGasPrice(chainId) {
        chainId = parseInt(chainId)
        console.log(chainId)
        if(chainId>= 30 && chainId <=33) {
            return this.getRskGasPrice();
        }
        return this.getEthGasPrice();
    }

    async getGasLimit(rawTx) {
        let estimatedGas = await this.client.eth.estimateGas({ gasPrice: rawTx.gasPrice, value: rawTx.value, to: rawTx.to, data: rawTx.data, from: rawTx.from});
        estimatedGas = (estimatedGas < 250000) ? 250000 : 3500000;
        return estimatedGas;
    }

    async getEthGasPrice() {
        const gasPrice = parseInt(await this.client.eth.getGasPrice());
        return gasPrice <= 1 ? 1: Math.round(gasPrice * 1.5);
    }

    async getRskGasPrice() {
        let block = await this.client.eth.getBlock('latest');
        let gasPrice= parseInt(block.minimumGasPrice);
        return gasPrice <= 1 ? 1: Math.round(gasPrice * 1.05);
    }

    async createRawTransaction(from, to, data, value) {
        const nonce = await this.getNonce(from);
        const chainId =  this.chainId || await this.client.eth.net.getId();
        const gasPrice = await this.getGasPrice(chainId);
        let rawTx = {
            gasPrice: this.numberToHexString(gasPrice),
            value: this.numberToHexString(value),
            to: to,
            data: data,
            from: from,
            nonce: this.numberToHexString(nonce),
            r: 0,
            s: 0
        }
        rawTx.gas = this.numberToHexString(await this.getGasLimit(rawTx));
        return rawTx;
    }

    signRawTransaction(rawTx, privateKey) {
        let tx = new Tx(rawTx);
        tx.sign(utils.hexStringToBuffer(privateKey));
        return tx;
    }

    async getAddress(privateKey) {
        let address = null;
        if (privateKey && privateKey.length) {
            address = utils.privateToAddress(privateKey);
        } else {
            //If no private key provided we use personal (personal is only for testing)
            let accounts = await this.client.eth.getAccounts();
            address = accounts[0];
        }
        return address;
    }

    async sendTransaction(to, data, value, privateKey) {
        const stack = new Error().stack;
        var from = await this.getAddress(privateKey);
        let rawTx = await this.createRawTransaction(from, to, data, value);
        let txHash;
        let error = '';
        let errorInfo = '';
        try {
            let receipt;
            if (privateKey && privateKey.length) {
                let signedTx = this.signRawTransaction(rawTx, privateKey);
                const serializedTx = ethUtils.bufferToHex(signedTx.serialize());
                receipt = await this.client.eth.sendSignedTransaction(serializedTx).once('transactionHash', hash => txHash = hash);
            } else {
                //If no private key provided we use personal (personal is only for testing)
                delete rawTx.r;
                delete rawTx.s;
                delete rawTx.v;
                receipt = await this.client.eth.sendTransaction(rawTx).once('transactionHash', hash => txHash = hash);
            }
            if(receipt.status == 1) {
                this.logger.info(`Transaction Successful txHash:${receipt.transactionHash} blockNumber:${receipt.blockNumber}`);
                return receipt;
            }
            error = 'Transaction Receipt Status Failed';
            errorInfo = receipt;
        } catch(err) {
            if (err.message.indexOf('it might still be mined') > 0) {
                this.logger.warn(`Transaction was not mined within 750 seconds, please make sure your transaction was properly sent. Be aware that
                it might still be mined. transactionHash:${txHash}`);
                fs.appendFileSync(this.manuallyCheck, `transactionHash:${txHash} to:${to} data:${data}\n`);
                return { transactionHash: txHash };
            }
            error = `Send Signed Transaction Failed TxHash:${txHash}`;
            errorInfo = err;
        }
        this.logger.error(error, errorInfo);
        this.logger.error('RawTx that failed', rawTx);
        throw new CustomError(`Transaction Failed: ${error} ${stack}`, errorInfo);
    }

    async sendTransactionToCelo(to, params, method, privateKey, host) {
        const stack = new Error().stack;
        let txHash;
        let tx;
        let error = '';
        let errorInfo = '';

        const from = await this.getAddress(privateKey);
        console.log('FROM', from)
        console.log('TO', to)
        const kit = newKit(host)
        kit.connection.addAccount(privateKey)
    
        try {
            let receipt;
            const instance = await new kit.web3.eth.Contract(abiFederation, to)
            const txObj = await instance.methods[method](...params)
            console.log('WILL SEND TRANSACTION --------------------------')
            tx = await kit.sendTransactionObject(txObj, { from })
            console.log('TRANSACTION WAS SENT --------------------------')
            txHash = await tx.getHash()
            receipt = await tx.waitReceipt()
            console.log(receipt.events.Voted)

            if(receipt.status == 1) {
                this.logger.info(`Transaction Successful txHash: ${receipt.transactionHash} blockNumber:${receipt.blockNumber}`);
                return receipt;
            }
            error = 'Transaction Receipt Status Failed';
            errorInfo = receipt;
        } catch(err) {
            if (err.message.indexOf('it might still be mined') > 0) {
                this.logger.warn(`Transaction was not mined within 750 seconds, please make sure your transaction was properly sent. Be aware that
                it might still be mined. transactionHash:${txHash}`);
                fs.appendFileSync(this.manuallyCheck, `transactionHash: ${txHash} to: ${to} tx: ${tx}\n`);
                return { transactionHash: txHash };
            }
            error = `Send Signed Transaction Failed TxHash:${txHash}`;
            errorInfo = err;
        }
        this.logger.error(error, errorInfo);
        this.logger.error('tx that failed', tx);
        throw new CustomError(`Transaction Failed: ${error} ${stack}`, errorInfo);
    }

}