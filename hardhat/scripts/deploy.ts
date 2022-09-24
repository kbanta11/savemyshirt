require('dotenv').config();
const axios = require('axios').default;
const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {

  // set up keys and provider.
  const apiKey = process.env.ALCHEMY_API_KEY;
  const privKey = process.env.DEVNET_PRIVKEY;
  const provider = new ethers.providers.AlchemyProvider("matic", apiKey);

  // create wallet.
  let wallet = new ethers.Wallet(privKey, provider);
  console.log('Your wallet address:', wallet.address);

  // connect signer to contract object.
  const MinterContract = await (
    await hre.ethers.getContractFactory("NFTShirt")
  ).connect(wallet);
  console.log('Deploying NFTShirt contract to Polygon');

  let maxFeePerGas = ethers.BigNumber.from(40000000000) // fallback to 40 gwei
  let maxPriorityFeePerGas = ethers.BigNumber.from(40000000000) // fallback to 40 gwei
  try {
    const { data } = await axios({
        method: 'GET',
        url: 'https://gasstation-mainnet.matic.network/v2',
    })
    maxFeePerGas = ethers.utils.parseUnits(
        Math.ceil(data.fast.maxFee) + '',
        'gwei'
    )
    maxPriorityFeePerGas = ethers.utils.parseUnits(
        Math.ceil(data.fast.maxPriorityFee) + '',
        'gwei'
    )
  } catch {
    //ignore
  }

  console.log(`Max Fee: ${maxFeePerGas}. Priority Fee: ${maxPriorityFeePerGas}`)
  const contract = await MinterContract.deploy("Save My Shirt!", "SMS", {
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    maxFeePerGas: maxFeePerGas
  });
  console.log(JSON.stringify(contract))
  await contract.deployed();
    
    // success!
    console.log(`Minter Contract is deployed to ${contract.address} on Mumbai Testnet`);
    //await run_keeper(contract.address);
  }
  
  main()
