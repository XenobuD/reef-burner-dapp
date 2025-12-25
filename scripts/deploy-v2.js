const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting ReefBurner V2 deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "REEF\n");

  // ⚠️ IMPORTANT: Set your creator wallet address
  // This is IMMUTABLE - cannot be changed after deployment!
  const CREATOR_WALLET = deployer.address; // Change this to your actual creator wallet
  console.log("⚠️  Creator wallet (IMMUTABLE):", CREATOR_WALLET);
  console.log("⚠️  This address will receive 8% of all burns FOREVER!\n");

  // Confirmation before deployment
  console.log("📋 Deployment Configuration:");
  console.log("   Contract: ReefBurnerV2");
  console.log("   Network:", hre.network.name);
  console.log("   Creator Wallet:", CREATOR_WALLET);
  console.log("   Features:");
  console.log("   ✅ Unclaimed prize system (10 round grace period)");
  console.log("   ✅ Anyone can trigger prize claim");
  console.log("   ✅ Auto-burn unclaimed prizes");
  console.log("   ✅ ReentrancyGuard protection");
  console.log("   ✅ Immutable creator wallet");
  console.log("   ✅ No rug pull possible\n");

  // Deploy ReefBurnerV2 contract
  console.log("📦 Deploying ReefBurnerV2 contract...");
  const ReefBurnerV2 = await hre.ethers.getContractFactory("ReefBurnerV2");
  const reefBurner = await ReefBurnerV2.deploy(CREATOR_WALLET);

  console.log("⏳ Waiting for deployment transaction...");
  await reefBurner.deployed();

  const contractAddress = reefBurner.address;
  console.log("✅ ReefBurnerV2 deployed to:", contractAddress, "\n");

  // Get initial contract state
  console.log("=== Initial Contract State ===");
  console.log("Owner:", await reefBurner.owner());
  console.log("Creator Wallet (immutable):", await reefBurner.creatorWallet());
  console.log("Round Number:", (await reefBurner.roundNumber()).toString());
  console.log("Min Burn Amount:", hre.ethers.utils.formatEther(await reefBurner.minBurnAmount()), "REEF");
  console.log("Max Burn Amount:", hre.ethers.utils.formatEther(await reefBurner.MAX_BURN_AMOUNT()), "REEF");
  console.log("Prize Pool:", hre.ethers.utils.formatEther(await reefBurner.prizePool()), "REEF");
  console.log("Unclaimed Prize:", hre.ethers.utils.formatEther(await reefBurner.unclaimedPrize()), "REEF");
  console.log("Total Burned:", hre.ethers.utils.formatEther(await reefBurner.totalBurned()), "REEF");
  console.log("Total Unclaimed Burned:", hre.ethers.utils.formatEther(await reefBurner.totalUnclaimedBurned()), "REEF");
  console.log("Paused:", await reefBurner.paused());
  console.log("Claim Grace Period:", (await reefBurner.CLAIM_GRACE_PERIOD()).toString(), "rounds");
  console.log("Max Participants:", (await reefBurner.MAX_PARTICIPANTS_PER_ROUND()).toString());

  const timeRemaining = await reefBurner.getTimeRemainingInRound();
  const hours = Number(timeRemaining) / 3600;
  console.log("Time Remaining in Round:", hours.toFixed(2), "hours\n");

  console.log("=== V2 New Features ===");
  console.log("✅ Unclaimed Prize System:");
  console.log("   - Winner has 10 rounds to claim prize");
  console.log("   - Anyone can trigger prize claim");
  console.log("   - Auto-burns after 10 rounds if unclaimed");
  console.log("✅ Security Improvements:");
  console.log("   - ReentrancyGuard on all state-changing functions");
  console.log("   - Immutable creator wallet (cannot be changed)");
  console.log("   - No emergencyWithdraw (no rug pull possible)");
  console.log("   - Max 500 participants per round");
  console.log("   - Improved randomness (commit-reveal)\n");

  console.log("=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Block Number:", await hre.ethers.provider.getBlockNumber());
  console.log("Deployer:", deployer.address);
  console.log("Creator Wallet:", CREATOR_WALLET, "(IMMUTABLE)\n");

  console.log("=== Next Steps ===");
  console.log("1. ✅ Contract deployed!");
  console.log("2. 🔍 Verify on ReefScan:");
  console.log("   npx hardhat verify --network", hre.network.name, contractAddress, CREATOR_WALLET);
  console.log("3. 🎨 Update frontend:");
  console.log("   - Update CONTRACT_ADDRESS in config.js");
  console.log("   - Copy new ABI to frontend");
  console.log("   - Add unclaimed prize UI components");
  console.log("4. 🧪 Test deployment:");
  console.log("   - Test burn function");
  console.log("   - Test prize claim flow");
  console.log("   - Test auto-burn after 10 rounds");
  console.log("5. 📢 Announce to community!\n");

  console.log("=== Important for Frontend ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("\nReefScan URL:");
  if (hre.network.name === "reef_mainnet" || hre.network.name === "reef") {
    console.log(`https://reefscan.com/contract/${contractAddress}`);
  } else {
    console.log(`https://testnet.reefscan.com/contract/${contractAddress}`);
  }

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    version: "2.0",
    network: hre.network.name,
    contractAddress: contractAddress,
    creatorWallet: CREATOR_WALLET,
    deployer: deployer.address,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    features: {
      unclaimedPrizeSystem: true,
      anyoneCanClaim: true,
      gracePeriod: 10,
      autoBurnUnclaimed: true,
      reentrancyGuard: true,
      immutableCreator: true,
      noRugPull: true,
      maxParticipants: 500,
    },
    settings: {
      minBurnAmount: "5",
      maxBurnAmount: "8",
      roundDuration: "1 hour",
      burnPercentage: 65,
      prizePercentage: 27,
      creatorPercentage: 8,
    }
  };

  const deploymentPath = `./deployments/${hre.network.name}-v2.json`;
  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:", deploymentPath);
  console.log("\n🎉 Deployment complete! Ready to verify and integrate with frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
