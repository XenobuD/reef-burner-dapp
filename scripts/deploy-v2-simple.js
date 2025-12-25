const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting ReefBurner V2 deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "REEF\n");

  // Set creator wallet (using deployer address - will receive 8% of all burns)
  const CREATOR_WALLET = deployer.address;
  console.log("⚠️  Creator wallet (IMMUTABLE):", CREATOR_WALLET);
  console.log("⚠️  This address will receive 8% of all burns FOREVER!\n");

  // Deploy ReefBurnerV2 contract
  console.log("📦 Deploying ReefBurnerV2 contract...");
  const ReefBurnerV2 = await hre.ethers.getContractFactory("ReefBurnerV2");
  const reefBurner = await ReefBurnerV2.deploy(CREATOR_WALLET);

  await reefBurner.deployed();

  const contractAddress = reefBurner.address;
  console.log("✅ ReefBurnerV2 deployed to:", contractAddress, "\n");

  // Get initial contract state
  console.log("=== Initial Contract State ===");
  console.log("Owner:", await reefBurner.owner());
  console.log("Creator Wallet:", await reefBurner.creatorWallet());
  console.log("Round Number:", await reefBurner.roundNumber());
  console.log("Min Burn Amount:", hre.ethers.utils.formatEther(await reefBurner.minBurnAmount()), "REEF");
  console.log("Prize Pool:", hre.ethers.utils.formatEther(await reefBurner.prizePool()), "REEF");
  console.log("Unclaimed Prize:", hre.ethers.utils.formatEther(await reefBurner.unclaimedPrize()), "REEF");
  console.log("Total Burned:", hre.ethers.utils.formatEther(await reefBurner.totalBurned()), "REEF");
  console.log("Paused:", await reefBurner.paused());

  const timeRemaining = await reefBurner.getTimeRemainingInRound();
  const hours = Number(timeRemaining) / 3600;
  console.log("Time Remaining:", hours.toFixed(2), "hours\n");

  console.log("=== V2 Features ===");
  console.log("✅ Unclaimed prize system (10 round grace period)");
  console.log("✅ Anyone can trigger prize claim");
  console.log("✅ Auto-burn unclaimed after 10 rounds");
  console.log("✅ ReentrancyGuard protection");
  console.log("✅ Immutable creator wallet");
  console.log("✅ No rug pull possible");
  console.log("✅ Max 500 participants per round\n");

  console.log("=== Deployment Summary ===");
  console.log("Contract:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Block:", await hre.ethers.provider.getBlockNumber());
  console.log("\nReefScan:");
  console.log(`https://reefscan.com/contract/${contractAddress}\n`);

  console.log("=== Next Steps ===");
  console.log("1. 🔍 Verify:");
  console.log(`   npx hardhat verify --network reef_mainnet ${contractAddress} ${CREATOR_WALLET}`);
  console.log("2. 🎨 Update frontend CONTRACT_ADDRESS");
  console.log("3. 📋 Copy new ABI to frontend");
  console.log("4. 🧪 Test deployment\n");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    version: "2.0",
    network: hre.network.name,
    contractAddress: contractAddress,
    creatorWallet: CREATOR_WALLET,
    deployer: deployer.address,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };

  const deploymentPath = `./deployments/${hre.network.name}-v2.json`;
  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("💾 Deployment saved:", deploymentPath);
  console.log("\n🎉 V2 Deployment Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
