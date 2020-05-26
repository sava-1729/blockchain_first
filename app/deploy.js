var web3_lib = require('web3')
var tx_lib = require('ethereumjs-tx')
var web3 = new web3_lib('HTTP://127.0.0.1:7545')

const creator_public_key = '0x211a2C2a94265F8c79b1d0a3b8540eF5F58e23aB'
const creator_private_key = Buffer.from(process.env.PRIVATE_KEY_0, 'hex')

var txCount = 0
var cb = (err, val) => { txCount = val }
web3.eth.getTransactionCount(creator_public_key, cb)

var gasPrice = 0
var cb = (err, val) => { gasPrice = val }
web3.eth.getGasPrice(cb)

const byte_code = ''

var txData = {
    nonce : web3.utils.toHex(txCount),
    gasLimit : web3.utils.toHex(30000),
    gasPrice : web3.utils.toHex(gasPrice),
    data : web3.utils.toHex(byte_code)
}

const txObj = new tx_lib(txData)
txObj.sign(creator_private_key)

const serialized = txObj.serialize().toString('hex')
const raw = '0x' + serialized

web3.eth.sendSignedTransaction(raw, (err, txHash) => {console.log('err:', err, 'txHash:', txHash)})
