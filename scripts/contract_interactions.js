var web3_lib = require('web3')
var tx_lib = require('ethereumjs-tx').Transaction
var web3 = new web3_lib('https://ropsten.infura.io/v3/a1f0fc3853d04cbcb9cfd13a03009ec6')

const SENDER_PUBLIC_KEY = '0x7f3D10CcBB793aE9C80C1C3539E985c17B5C6643'
const SENDER_PRIVATE_KEY = Buffer.from(process.env.PRIVATE_KEY, 'hex')
const PATIENT_PUBLIC_KEY = '0xDadB98A33e6022de2CEA06FF7B3710f90B65f78A'
const contractABI = [{"inputs":[{"internalType":"string","name":"capacity_","type":"string"},{"internalType":"string","name":"admissionCost_","type":"string"},{"internalType":"string","name":"membershipCost_","type":"string"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"temp","type":"address"}],"name":"AdmittedPatient","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"report","type":"string"}],"name":"CapacityFull","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"temp","type":"address"}],"name":"DischargedPatient","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"doctorAddress","type":"address"}],"name":"NewDoctorEmployed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"perpetrator","type":"address"},{"indexed":true,"internalType":"address","name":"applicantAddress","type":"address"}],"name":"UnauthorizedEmploymentRequest","type":"event"},{"constant":false,"inputs":[{"internalType":"address","name":"patientAddress","type":"address"}],"name":"dischargePatient","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"applicantAddress","type":"address"}],"name":"employDoctor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"freeBeds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"applicantAddress","type":"address"}],"name":"getAdmitted","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getBeds","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getFreeBeds","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"patientAtBed","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"personAddress","type":"address"}],"name":"registerAsPrivilegedMember","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}]
const contractAddress = '0x9AcE8470dd2739907b5400A0cafd21e9Be2187CB'
const Hospital = new web3.eth.Contract(contractABI, contractAddress)

const REQUEST = Hospital.methods.employDoctor(PATIENT_PUBLIC_KEY).encodeABI()

async function callContractFunction(abiEncodedRequest, contractAddress) {
    const txCount = await web3.eth.getTransactionCount(SENDER_PUBLIC_KEY)
    const gasPrice = await web3.eth.getGasPrice()
    var txData = {
        nonce : web3.utils.toHex(txCount),
        gasLimit : web3.utils.toHex(2000000),
        gasPrice : web3.utils.toHex(gasPrice),
        to : contractAddress,
        data : abiEncodedRequest
        // value : web3.utils.toHex(web3.utils.toWei('0.001', 'ether'))
    }
    const txObj = new tx_lib(txData, {chain:'ropsten', hardfork: 'petersburg'})
    txObj.sign(SENDER_PRIVATE_KEY)

    const serialized = txObj.serialize().toString('hex')
    const raw = '0x' + serialized
    console.log('ABOUT TO SEND TRANSACTION')
    console.log("txCount:", txCount)
    const receipt = await web3.eth.sendSignedTransaction(raw);
    console.log('TRANSACTION HASH:', receipt.transactionHash)
    console.log(JSON.stringify(receipt, null, 4));
}
callContractFunction(REQUEST, contractAddress);