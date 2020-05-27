const SENDER_PUBLIC_KEY = '0x211a2C2a94265F8c79b1d0a3b8540eF5F58e23aB'
const RECEIVER_PUBLIC_KEY = '0xEb3662BB61a9EDc7bEDE6D54DE29b0111fcF78F5'
var AMOUNT = 10 //in ethers

var web3_lib = require('web3')
var tx_lib = require('ethereumjs-tx').Transaction
var web3 = new web3_lib('HTTP://127.0.0.1:7545')

const sender_private_key = Buffer.from(process.env.PRIVATE_KEY, 'hex')
AMOUNT = web3.utils.toWei(AMOUNT.toString(), 'ether')

var txCount = 0
var cb = (err, val) => { txCount = val }
web3.eth.getTransactionCount(SENDER_PUBLIC_KEY, cb)

var gasPrice = 0
var cb = (err, val) => { gasPrice = val }
web3.eth.getGasPrice(cb)

var txData = {
    nonce : web3.utils.toHex(txCount),
    to: web3.utils.toHex(RECEIVER_PUBLIC_KEY),
    value: web3.utils.toHex(AMOUNT),
    gasLimit : web3.utils.toHex(30000),
    gasPrice : web3.utils.toHex(gasPrice)
}

const txObj = new tx_lib(txData)
txObj.sign(sender_private_key)

const serialized = txObj.serialize().toString('hex')
const raw = '0x' + serialized

web3.eth.sendSignedTransaction(raw, (err, txHash) => {console.log('err:', err, 'txHash:', txHash)})
