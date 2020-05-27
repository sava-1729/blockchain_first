var web3_lib = require('web3')
var tx_lib = require('ethereumjs-tx').Transaction
var web3 = new web3_lib('HTTP://127.0.0.1:7545')

// var cb_function = (err, val) => { console.log("error:", err, "returned: ", val); return val }

const contractAddress = '0x06B60ED90235e30E6e3B9e2740cB9784c9eA69C1'
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"temp","type":"address"}],"name":"BedAcq","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"temp","type":"address"}],"name":"BedRel","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerSet","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"bed_arr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"free_idx","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBeds","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFreeBeds","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from_address","type":"address"}],"name":"releaseBed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from_address","type":"address"}],"name":"requireBed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"size","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
const gasPrice = 20000000000

const Hospital = new web3.eth.Contract(contractABI, contractAddress)

function sign(txData, SENDER_PRIVATE_KEY)
{
    const txObj = new tx_lib(txData)
    txObj.sign(Buffer.from(SENDER_PRIVATE_KEY, 'hex'))
    const serialized = txObj.serialize().toString('hex')
    const raw = '0x' + serialized
    return raw
}

function makeEthereumTransaction(sender_pkey, sender_skey, receiver_pkey, amount, gasLimit)
{
    web3.eth.getTransactionCount(sender_pkey, (err, txCount) => {
        var txData = {
            nonce : web3.utils.toHex(txCount),
            to : receiver_pkey,
            gasLimit : web3.utils.toHex(gasLimit),
            gasPrice : web3.utils.toHex(gasPrice),
            value : web3.utils.toHex(amount)
        }
        signed_data = sign(txData, sender_skey)
        web3.eth.sendSignedTransaction(signed_data, (err, txHash) => {console.log('error:',err,'txHash:',txHash)})
    })
}

function makeContractTransaction(sender_pkey, sender_skey, contractAddress, functionCall, gasLimit)
{
    web3.eth.getTransactionCount(sender_pkey, (err, txCount) => {
        var txData = {
            nonce : web3.utils.toHex(txCount),
            to : contractAddress,
            gasLimit : web3.utils.toHex(gasLimit),
            gasPrice : web3.utils.toHex(gasPrice),
            data : functionCall
        }
        signed_data = sign(txData, sender_skey)
        web3.eth.sendSignedTransaction(signed_data, (err, txHash) => {console.log('error:',err,'txHash:',txHash)})
    })
}

function reserve_bed()
{
    const SENDER_PUBLIC_KEY = '0x9b7d660076D3eFa3eD668202BC5856ddDF2bB7c3'
    const SENDER_PRIVATE_KEY = '2a669df41f4783d966f3a0b53c543d0ad420814c2afe52a0302d89e099cef0c0'
    const amount = web3.utils.toWei('5', 'ether');
    const gasLimit = 1000000;
    Hospital.methods.getOwner().call((err, ownerAddress) => {
        console.log('ownerAddress:', ownerAddress)
        makeEthereumTransaction(SENDER_PUBLIC_KEY, SENDER_PRIVATE_KEY, ownerAddress, amount, gasLimit)
        console.log('Ethereum transfer complete')
    })

    const request = Hospital.methods.requireBed(SENDER_PUBLIC_KEY).encodeABI()
    makeContractTransaction(SENDER_PUBLIC_KEY, SENDER_PRIVATE_KEY, contractAddress, request, gasLimit)
    console.log('function call complete')
}

function release_bed()
{
    const SENDER_PUBLIC_KEY = '0x9b7d660076D3eFa3eD668202BC5856ddDF2bB7c3'
    const SENDER_PRIVATE_KEY = '2a669df41f4783d966f3a0b53c543d0ad420814c2afe52a0302d89e099cef0c0'
    const request = Hospital.methods.releaseBed(SENDER_PUBLIC_KEY).encodeABI()
    const gasLimit = 1000000;
    makeContractTransaction(SENDER_PUBLIC_KEY, SENDER_PRIVATE_KEY, contractAddress, request, gasLimit)
    console.log('function call complete')
}

function analyse_contract()
{
    Hospital.methods.getFreeBeds().call((err, freeBeds) => {
        console.log(freeBeds)
    })
    Hospital.methods.getBeds().call((err, patients) => {
        console.log(patients)
    })
}
// release_bed()
// reserve_bed()
// analyse_contract()