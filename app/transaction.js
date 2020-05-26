var web3_lib = require('web3')
// var tx_lib = require('ethereumjs-tx').Transaction
var web3 = new web3_lib('HTTP://127.0.0.1:7545')

const contractAddress = ''
const contractABI = ''

const Hospital = new web3.eth.Contract(contractABI, contractAddress)

var assert = require('assert');

function reserve_bed(form)
{
    const txHash = form.txhash.value
    const SENDER_PUBLIC_KEY = form.pkey.value
    const sender_private_key = form.skey.value

    var txObj = null
    web3.eth.getTransaction(txHash, (err, ans) => { txObj = ans })
    const sender = txObj.from
    const recipient = txObj.to
    const amount = web3.utils.fromWei(txObj.value, 'ether')
    const hash = txObj.hash

    assert(sender == SENDER_PUBLIC_KEY);
    assert(hash == txHash);

    var txCount = 0
    var cb = (err, val) => { txCount = val }
    web3.eth.getTransactionCount(SENDER_PUBLIC_KEY, cb)

    var gasPrice = 0
    var cb = (err, val) => { gasPrice = val }
    web3.eth.getGasPrice(cb)

    var txData = {
        nonce : web3.utils.toHex(txCount),
        to : web3.utils.toHex(this.contractAddress),
        gasLimit : web3.utils.toHex(30000),
        gasPrice : web3.utils.toHex(gasPrice),
        data : Hospital.methods.requireBed(sender, recipient, amount, hash).encodeABI()
    }

    const txObj = new tx_lib(txData)
    txObj.sign(sender_private_key)
    
    const serialized = txObj.serialize().toString('hex')
    const raw = '0x' + serialized
    
    web3.eth.sendSignedTransaction(raw, (err, txHash) => {console.log('err:', err, 'txHash:', txHash)})
}