var web3_lib = require('web3')
// var tx_lib = require('ethereumjs-tx').Transaction
var web3 = new web3_lib('HTTP://127.0.0.1:7545')

var cb_function = (err, val) => { console.log("error:", err, "returned: ", val); return val }

const contractAddress = ''
const contractABI = ''

const Hospital = new web3.eth.Contract(contractABI, contractAddress)

function sign(txData, SENDER_PRIVATE_KEY)
{
    const txObj = new tx_lib(txData)
    txObj.sign(SENDER_PRIVATE_KEY)
    const serialized = txObj.serialize().toString('hex')
    const raw = '0x' + serialized
    return raw
}

function getTxCount(sender_pkey)
{
    return web3.eth.getTransactionCount(sender_pkey, cb_function)
}

function getGasPrice()
{
    return web3.eth.getGasPrice(cb_function)
}

function getEthereumTransactionStruct(sender_pkey, receiver_pkey, amount, gasLimit)
{
    txCount = getTxCount(sender_pkey)
    gasPrice = getGasPrice()
    var txData = {
        nonce : web3.utils.toHex(txCount),
        to : web3.utils.toHex(receiver_pkey),
        gasLimit : web3.utils.toHex(gasLimit),
        gasPrice : web3.utils.toHex(gasPrice),
        value : web3.utils.toHex(amount)
    }
    return txData
}

function getContractTransactionStruct(sender_pkey, contractAddress, functionCall, gasLimit)
{
    txCount = getTxCount(sender_pkey)
    gasPrice = getGasPrice()
    var txData = {
        nonce : web3.utils.toHex(txCount),
        to : web3.utils.toHex(contractAddress),
        gasLimit : web3.utils.toHex(gasLimit),
        gasPrice : web3.utils.toHex(gasPrice),
        data : functionCall
    }
    return txData
}

function makeTransaction(sender_pkey, sender_skey, receiverAddress, data, gasLimit, mode)
{
    txData = null
    if (mode == "eth")
    {
        txData = getEthereumTransactionStruct(sender_pkey, receiverAddress, data, gasLimit)
    }
    elif (mode == "fnc")
    {
        txData = getContractTransactionStruct(sender_pkey, receiverAddress, data, gasLimit)
    }
    signed_data = sign(txData, sender_skey)
    return web3.eth.sendSignedTransaction(signed_data, cb_function)
}

function reserve_bed(form)
{
    const SENDER_PUBLIC_KEY = form.pkey.value
    const SENDER_PRIVATE_KEY = form.skey.value
    const amount = web3.utils.toWei(form.amt.value, 'ether')
    const gasLimit = 40000
    makeTransaction(SENDER_PUBLIC_KEY, SENDER_PRIVATE_KEY, contractAddress, amount, gasLimit, 'eth')

    const request = Hospital.methods.requireBed(SENDER_PUBLIC_KEY).encodeABI()
    makeTransaction(SENDER_PUBLIC_KEY, SENDER_PRIVATE_KEY, contractAddress, request, gasLimit, 'fnc')
}