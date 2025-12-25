const hre = require("hardhat");
const { Provider, Signer, TestAccountSigningKey } = require('@reef-defi/evm-provider');
const { WsProvider, Keyring } = require('@polkadot/api');
const { ethers } = require('ethers');

async function main() {
  console.log("Starting ReefBurner deployment on Reef Mainnet...\n");

  // Connect to Reef Mainnet
  const WS_URL = "wss://rpc.reefscan.com/ws";
  const wsProvider = new WsProvider(WS_URL);
  const provider = new Provider({
    provider: wsProvider
  });

  await provider.api.isReady;
  console.log("✅ Connected to Reef Mainnet\n");

  // Import account from seed phrase (same pattern as hardhat-reef plugin)
  // ⚠️ SECURITY: Add your seed phrase here only when deploying, then remove it immediately
  const mnemonic = "YOUR_SEED_PHRASE_HERE";
  const keyring = new Keyring({ type: 'sr25519' });
  const keyringPair = keyring.addFromUri(mnemonic);

  // Create signing key and add the keyring pair
  const signingKey = new TestAccountSigningKey(provider.api.registry);
  signingKey.addKeyringPair([keyringPair]);

  const signer = new Signer(provider, keyringPair.address, signingKey);

  // Wait for signer to be ready
  const isClaimed = await signer.isClaimed();
  if (!isClaimed) {
    console.log("Claiming EVM account...");
    await signer.claimDefaultAccount();
  }

  const evmAddress = await signer.getAddress();
  console.log("Deploying with account:", evmAddress);

  // Get balance
  const balance = await signer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance.toString()), "REEF\n");

  // Set creator wallet
  const CREATOR_WALLET = evmAddress;
  console.log("Creator wallet:", CREATOR_WALLET, "\n");

  // Get contract factory
  const ReefBurner = await hre.ethers.getContractFactory("ReefBurner", signer);

  console.log("Deploying ReefBurner contract...");
  const reefBurner = await ReefBurner.deploy(CREATOR_WALLET);

  console.log("Waiting for deployment...");
  await reefBurner.deployed();

  const contractAddress = reefBurner.address;
  console.log("\n✅ ReefBurner deployed to:", contractAddress);

  // Get initial contract state
  console.log("\n=== Initial Contract State ===");
  console.log("Owner:", await reefBurner.owner());
  console.log("Creator Wallet:", await reefBurner.creatorWallet());
  console.log("Round Number:", (await reefBurner.roundNumber()).toString());
  console.log("Min Burn Amount:", ethers.utils.formatEther(await reefBurner.minBurnAmount()), "REEF");
  console.log("Prize Pool:", ethers.utils.formatEther(await reefBurner.prizePool()), "REEF");
  console.log("Total Burned:", ethers.utils.formatEther(await reefBurner.totalBurned()), "REEF");
  console.log("Paused:", await reefBurner.paused());

  const timeRemaining = await reefBurner.getTimeRemainingInRound();
  const hours = Number(timeRemaining) / (60 * 60);
  console.log("Time Remaining in Round:", hours.toFixed(2), "hours");

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Reef Mainnet");
  console.log("Explorer:", `https://reefscan.com/contract/${contractAddress}`);

  console.log("\n=== IMPORTANT ===");
  console.log("⚠️  TESTING MODE ACTIVE:");
  console.log("    • Range: 5-8 REEF");
  console.log("    • Lottery: 1 HOUR");
  console.log("    • Remember to change back to 950-1500 REEF and 3 days for production!");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "reef_mainnet",
    contractAddress: contractAddress,
    creatorWallet: CREATOR_WALLET,
    deployer: evmAddress,
    timestamp: new Date().toISOString(),
    testMode: true,
    minBurn: "5 REEF",
    maxBurn: "8 REEF",
    lotteryDuration: "1 hour"
  };

  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync('./deployments/reef_mainnet_test.json', JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✅ Deployment info saved to: ./deployments/reef_mainnet_test.json");

  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
