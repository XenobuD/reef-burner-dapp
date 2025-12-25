const hre = require("hardhat");
const { Provider, Signer, TestAccountSigningKey } = require('@reef-defi/evm-provider');
const { WsProvider, Keyring } = require('@polkadot/api');
const { ethers } = require('ethers');

async function main() {
  console.log("🚀 Deploying ReefBurnerV2 on Reef Mainnet...\n");

  // Connect to Reef Mainnet
  const WS_URL = "wss://rpc.reefscan.com/ws";
  const wsProvider = new WsProvider(WS_URL);
  const provider = new Provider({
    provider: wsProvider
  });

  await provider.api.isReady;
  console.log("✅ Connected to Reef Mainnet\n");

  // Import account from seed phrase
  const mnemonic = "YOUR_SEED_PHRASE_HERE"; // Removed for security
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

  // Get contract factory for ReefBurnerV2
  const ReefBurnerV2 = await hre.ethers.getContractFactory("ReefBurnerV2", signer);

  console.log("📦 Deploying ReefBurnerV2 contract...");
  const reefBurner = await ReefBurnerV2.deploy(CREATOR_WALLET);

  console.log("⏳ Waiting for deployment...");
  await reefBurner.deployed();

  const contractAddress = reefBurner.address;
  console.log("\n✅ ReefBurnerV2 deployed to:", contractAddress);

  // Get initial contract state
  console.log("\n=== Initial Contract State ===");
  console.log("Owner:", await reefBurner.owner());
  console.log("Creator Wallet:", await reefBurner.creatorWallet());
  console.log("Round Number:", (await reefBurner.roundNumber()).toString());
  console.log("Min Burn Amount:", ethers.utils.formatEther(await reefBurner.minBurnAmount()), "REEF");
  console.log("Prize Pool:", ethers.utils.formatEther(await reefBurner.prizePool()), "REEF");
  console.log("Unclaimed Prize:", ethers.utils.formatEther(await reefBurner.unclaimedPrize()), "REEF");
  console.log("Total Burned:", ethers.utils.formatEther(await reefBurner.totalBurned()), "REEF");
  console.log("Paused:", await reefBurner.paused());

  const timeRemaining = await reefBurner.getTimeRemainingInRound();
  const hours = Number(timeRemaining) / (60 * 60);
  console.log("Time Remaining:", hours.toFixed(2), "hours");

  console.log("\n=== V2 Features ===");
  console.log("✅ Anyone can trigger prize claim");
  console.log("✅ 10 round grace period for winners");
  console.log("✅ Auto-burn unclaimed prizes");
  console.log("✅ ReentrancyGuard protection");
  console.log("✅ Immutable creator wallet");
  console.log("✅ No rug pull possible");

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Reef Mainnet");
  console.log("Explorer:", `https://reefscan.com/contract/${contractAddress}`);

  console.log("\n=== TESTING MODE ===");
  console.log("⚠️  Range: 5-8 REEF");
  console.log("⚠️  Lottery: 1 HOUR");
  console.log("⚠️  Grace Period: 10 rounds (10 hours)");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    version: "2.0",
    network: "reef_mainnet",
    contractAddress: contractAddress,
    creatorWallet: CREATOR_WALLET,
    deployer: evmAddress,
    timestamp: new Date().toISOString(),
    testMode: true,
    minBurn: "5 REEF",
    maxBurn: "8 REEF",
    lotteryDuration: "1 hour",
    gracePeriod: "10 rounds",
    features: {
      unclaimedPrizeSystem: true,
      anyoneCanClaim: true,
      autoBurnUnclaimed: true
    }
  };

  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync('./deployments/reef_mainnet-v2.json', JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to: ./deployments/reef_mainnet-v2.json");
  console.log("\n🎉 V2 DEPLOYMENT COMPLETE!");

  process.exit(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
