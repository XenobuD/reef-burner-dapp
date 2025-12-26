const hre = require("hardhat");
const { Provider, Signer, TestAccountSigningKey } = require('@reef-defi/evm-provider');
const { WsProvider, Keyring } = require('@polkadot/api');
const { ethers } = require('ethers');

async function main() {
  console.log("🚀 Deploying ReefBurnerV3 ULTRA SECURE on Reef Mainnet...\n");

  // Connect to Reef Mainnet
  const WS_URL = "wss://rpc.reefscan.com/ws";
  const wsProvider = new WsProvider(WS_URL);
  const provider = new Provider({
    provider: wsProvider
  });

  await provider.api.isReady;
  console.log("✅ Connected to Reef Mainnet\n");

  // Import account from seed phrase (from hardhat.config.js)
  const config = require('../hardhat.config.js');
  const mnemonic = config.networks.reef_mainnet.seeds.deployer;

  if (!mnemonic) {
    throw new Error("No seed phrase found in hardhat.config.js! Please add it to reef_mainnet.seeds.deployer");
  }

  const keyring = new Keyring({ type: 'sr25519' });
  const keyringPair = keyring.addFromUri(mnemonic);

  // Create signing key
  const signingKey = new TestAccountSigningKey(provider.api.registry);
  signingKey.addKeyringPair([keyringPair]);

  const signer = new Signer(provider, keyringPair.address, signingKey);

  // Claim EVM account if needed
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
  console.log("⚠️  Creator wallet (IMMUTABLE):", CREATOR_WALLET);
  console.log("⚠️  This will receive 8% of all burns FOREVER!\n");

  // Get contract factory for ReefBurnerV3
  const ReefBurnerV3 = await hre.ethers.getContractFactory("ReefBurnerV3", signer);

  console.log("📦 Deploying ReefBurnerV3 ULTRA SECURE contract...");
  const reefBurner = await ReefBurnerV3.deploy(CREATOR_WALLET);

  console.log("⏳ Waiting for deployment...");
  await reefBurner.deployed();

  const contractAddress = reefBurner.address;
  console.log("\n✅ ReefBurnerV3 ULTRA SECURE deployed to:", contractAddress);

  // Get initial contract state
  console.log("\n=== Initial Contract State ===");
  console.log("Owner:", await reefBurner.owner());
  console.log("Creator Wallet:", await reefBurner.creatorWallet());
  console.log("Round Number:", (await reefBurner.roundNumber()).toString());
  console.log("Min Burn Amount:", ethers.utils.formatEther(await reefBurner.minBurnAmount()), "REEF");
  console.log("Prize Pool:", ethers.utils.formatEther(await reefBurner.prizePool()), "REEF");
  console.log("Unclaimed Prize:", ethers.utils.formatEther(await reefBurner.unclaimedPrize()), "REEF");
  console.log("Total Burned:", ethers.utils.formatEther(await reefBurner.totalBurned()), "REEF");
  console.log("Gas Intensity Level:", (await reefBurner.gasIntensityLevel()).toString());
  console.log("Paused:", await reefBurner.paused());

  const timeRemaining = await reefBurner.getTimeRemainingInRound();
  const minutes = Number(timeRemaining) / 60;
  console.log("Time Remaining:", minutes.toFixed(2), "minutes");

  console.log("\n=== V3 SECURITY UPGRADES ===");
  console.log("✅ Enhanced multi-source randomness (3 entropy sources!)");
  console.log("✅ NO emergencyWithdraw - 100% trustless");
  console.log("✅ Timelock on owner functions (2-day delay)");
  console.log("✅ Configurable gas intensity (0-100 scale)");
  console.log("✅ Renounce ownership option");
  console.log("✅ All code comments accurate (65/27/8)");

  console.log("\n=== V2 Features (Preserved) ===");
  console.log("✅ Anyone can trigger prize claim");
  console.log("✅ 10 round grace period for winners");
  console.log("✅ Auto-burn unclaimed prizes");
  console.log("✅ ReentrancyGuard protection");
  console.log("✅ Immutable creator wallet");

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Reef Mainnet");
  console.log("Explorer:", `https://reefscan.com/contract/${contractAddress}`);

  console.log("\n=== FAST TESTING MODE ===");
  console.log("⚠️  Range: 5-8 REEF");
  console.log("⚠️  Round Duration: 5 MINUTES");
  console.log("⚠️  Grace Period: 10 rounds (50 minutes)");
  console.log("⚠️  Gas Intensity: 50 (medium)");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    version: "3.0",
    network: "reef_mainnet",
    contractAddress: contractAddress,
    creatorWallet: CREATOR_WALLET,
    deployer: evmAddress,
    timestamp: new Date().toISOString(),
    testMode: true,
    minBurn: "5 REEF",
    maxBurn: "8 REEF",
    roundDuration: "5 minutes",
    gracePeriod: "10 rounds (50 minutes)",
    gasIntensity: 50,
    v3Features: {
      enhancedRandomness: true,
      multiSourceEntropy: 3,
      noEmergencyWithdraw: true,
      timelockDelay: "2 days",
      configurableGas: true,
      renounceOwnership: true
    },
    v2Features: {
      unclaimedPrizeSystem: true,
      anyoneCanClaim: true,
      autoBurnUnclaimed: true
    }
  };

  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync('./deployments/reef_mainnet-v3.json', JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to: ./deployments/reef_mainnet-v3.json");
  console.log("\n🎉 V3 ULTRA SECURE DEPLOYMENT COMPLETE!");
  console.log("\n🔐 This is the MOST SECURE version yet!");
  console.log("✅ Fair randomness");
  console.log("✅ Trustless (no rug pull possible)");
  console.log("✅ Transparent (timelock on changes)");

  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
