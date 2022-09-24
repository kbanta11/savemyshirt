const HardhatUserConfig = require("hardhat/config");
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.15",
  networks: {
    hardhat: {
      chainId: 1337 // localhost chain.
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [process.env.DEVNET_PRIVKEY],
      gas: 5000000000000000
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.DEVNET_PRIVKEY] //
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.ETHERSCAN_API_KEY_POLYGON,
      polygon: process.env.ETHERSCAN_API_KEY_POLYGON,
    }, 
  },
}
