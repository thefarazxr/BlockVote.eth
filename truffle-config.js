/*
//var HDWalletProvider = require("truffle-hdwallet-provider");
const HDWalletProvider = require("@truffle/hdwallet-provider");
var infura_apikey = "c8c77b5606284917833f2a4bf1c30104";
var mnemonic = "witness bar helmet silly faint debate avoid tomato best hello present salt";
var address = "0xbC3A50596AADC733EBCe13235dA22534AEf30d42";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/c8c77b5606284917833f2a4bf1c30104")
      },
      network_id: 3,
      from: 0xbC3A50596AADC733EBCe13235dA22534AEf30d42,
      gas: 4700388
      
    }
  }
};*/
const HDWalletProvider = require("@truffle/hdwallet-provider");

//const mnemonicPhrase = "witness bar helmet silly faint debate avoid tomato best hello present salt";
var mnemonic = "witness bar helmet silly faint debate avoid tomato best hello present salt";
module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {

      provider: function () {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/c8c77b5606284917833f2a4bf1c30104");
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    }
    /*ropsten: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: mnemonicPhrase
          },
          providerOrUrl: "https://ropsten.infura.io/v3/c8c77b5606284917833f2a4bf1c30104",
          numberOfAddresses: 1,
          shareNonce: true,
          derivationPath: "m/44'/1'/0'/0/"
        }),
      network_id: '3',
      //from: 0xbC3A50596AADC733EBCe13235dA22534AEf30d42,
      //gas: 4700388
    }*/
  }
};