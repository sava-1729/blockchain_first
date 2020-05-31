const SENDER_PUBLIC_KEY = '0x7f3D10CcBB793aE9C80C1C3539E985c17B5C6643'
const RECEIVER_PUBLIC_KEY = '0x308dEAbbF556acfdB122d4F20B19390c903B5143'
const SENDER_PRIVATE_KEY = Buffer.from(process.env.PRIVATE_KEY, 'hex')
var web3_lib = require('web3')
var web3 = new web3_lib('https://ropsten.infura.io/v3/a1f0fc3853d04cbcb9cfd13a03009ec6')
var tx_lib = require('ethereumjs-tx').Transaction

async function sendSignedTx() {
    const txCount = await web3.eth.getTransactionCount(SENDER_PUBLIC_KEY)
    var amount = await web3.eth.getBalance(SENDER_PUBLIC_KEY)
    amount = amount - web3.utils.toWei('0.01', 'ether')
    var gasPrice = await web3.eth.getGasPrice()
    var txData = {
        nonce : web3.utils.toHex(txCount),
        gasLimit : web3.utils.toHex(1000000),
        gasPrice : web3.utils.toHex(gasPrice),
        to : RECEIVER_PUBLIC_KEY,
        value : web3.utils.toHex(amount)
    }
    const txObj = new tx_lib(txData, {chain:'ropsten', hardfork: 'petersburg'})
    txObj.sign(SENDER_PRIVATE_KEY)

    const serialized = txObj.serialize().toString('hex')
    const raw = '0x' + serialized
    console.log('ABOUT TO SEND TRANSACTION')
    const receipt = await web3.eth.sendSignedTransaction(raw);
    console.log('TRANSACTION COMPLETE')
    console.log('Transaction Hash:', receipt.txHash);
}
sendSignedTx();