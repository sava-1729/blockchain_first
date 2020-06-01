// const web3_lib = require('web3')
// const tx_lib = require('ethereumjs-tx').Transaction
web3 = new Web3(
        (window.web3 && window.web3.currentProvider) ||
        new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));
// var web3 = new Web3('HTTP://127.0.0.1:7545')

// var cb_function = (err, val) => { console.log("error:", err, "returned: ", val); return val }

const contractAddress = '0x7869f86204fa94e1cd63cD29E7a8b8604B9AB431'
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
    const SENDER_PUBLIC_KEY = '0x4C25ff6dC4cb4350c455Aa5cC741D281f5470611'
    const SENDER_PRIVATE_KEY = '51deabad56d312df3aab00234d3777f1c9162c176ab339ad92ce8c01cd94d2b2'
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
    const SENDER_PUBLIC_KEY = '0x4C25ff6dC4cb4350c455Aa5cC741D281f5470611'
    const SENDER_PRIVATE_KEY = '51deabad56d312df3aab00234d3777f1c9162c176ab339ad92ce8c01cd94d2b2'
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

function bind_button()
{
    $(document).on("click", "#message-button", function() {
        reserve_bed()
    });
}

bind_button()
// release_bed()
reserve_bed()
// analyse_contract()
