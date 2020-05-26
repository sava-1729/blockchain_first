var web3_lib = require('web3')
var tx_lib = require('ethereumjs-tx').Transaction
var web3 = new web3_lib('HTTP://127.0.0.1:7545')

tx_hash = '0x1ee34de59828a4eddb00e0951ad6715fa5cff15292ce6a7325b94729d9e62954'
web3.eth.getTransaction(tx_hash, (err, ans) => {console.log(ans)})