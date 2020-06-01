function setup()
{
    window.ethereum.enable()
    window.web3 = new Web3(window.ethereum)
    document.getElementById("loader").style.display = false
    window.ethereum.autoRefreshOnNetworkChange = false
    console.log("SETUP COMPLETE.")
}

async function deployContract() {
    document.getElementById("loader").style.display = true
    const amount = document.getElementById("amt").value
    const arg1 = String(document.getElementById("arg1").value)
    const arg2 = String(document.getElementById("arg2").value)
    const arg3 = String(document.getElementById("arg3").value)
    const args = [arg1, arg2, arg3]
    const argTypes = ["string", "string", "string"]
    console.log("amount: ", amount)
    console.log("Arguments: ", args)
    console.log("Argument types: ", argTypes)
    const encodedArgs = window.web3.eth.abi.encodeParameters(argTypes, args).slice(2);
    const byteCode = "<byte code of the contract>"
    const txCount = await window.web3.eth.getTransactionCount(window.ethereum.selectedAddress)
    const gasPrice = await window.web3.eth.getGasPrice()
    var txData = {
        nonce : window.web3.utils.toHex(txCount),
        gasLimit : window.web3.utils.toHex(5000000),
        gasPrice : window.web3.utils.toHex(gasPrice),
        data : byteCode + encodedArgs,
        value : window.web3.utils.toHex(window.web3.utils.toWei(amount, 'ether')),
        from : window.ethereum.selectedAddress
    }
    const receipt = await ethereum.send({method : 'eth_sendTransaction', params : [txData]})
    console.log(receipt)
    document.getElementById("welcome").innerHTML = "Deployed!"
}
