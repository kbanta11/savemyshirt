require('dotenv').config();
const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
  
    // set up keys and provider.
    const apiKey = process.env.INFURA_API_KEY;
    const privKey = process.env.DEVNET_PRIVKEY;
    const provider = new ethers.providers.InfuraProvider("maticmum", apiKey);
  
    // create wallet.
    let wallet = new ethers.Wallet(privKey, provider);
    console.log('Your wallet address:', wallet.address);
  
    // connect signer to contract object.
   const MinterContract = await (
     await hre.ethers.getContractFactory("NFTShirt")
   ).connect(wallet);
   console.log('Deploying NFTShirt contract to Polygon');

    const contract = await MinterContract.deploy("Save My Shirt!", "SMS");
    await contract.deployed();
    
    // success!
    console.log(`Minter Contract is deployed to ${contract.address} on Mumbai Testnet`);
    //await run_keeper(contract.address);
  }
  
  main()