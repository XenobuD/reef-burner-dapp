const hre = require("hardhat");

async function main() {
  console.log("Starting ReefBurner deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "REEF\n");

  // Set creator wallet address (CHANGE THIS TO YOUR CREATOR WALLET)
  const CREATOR_WALLET = deployer.address; // For testing, using deployer as creator wallet
  console.log("Creator wallet address:", CREATOR_WALLET, "\n");

  // Deploy ReefBurner contract
  console.log("Deploying ReefBurner contract...");
  const ReefBurner = await hre.ethers.getContractFactory("ReefBurner");
  const reefBurner = await ReefBurner.deploy(CREATOR_WALLET);

  await reefBurner.deployed();

  const contractAddress = reefBurner.address;
  console.log("ReefBurner deployed to:", contractAddress);

  // Get initial contract state
  console.log("\n=== Initial Contract State ===");
  console.log("Owner:", await reefBurner.owner());
  console.log("Creator Wallet:", await reefBurner.creatorWallet());
  console.log("Round Number:", await reefBurner.roundNumber());
  console.log("Min Burn Amount:", hre.ethers.utils.formatEther(await reefBurner.minBurnAmount()), "REEF");
  console.log("Prize Pool:", hre.ethers.utils.formatEther(await reefBurner.prizePool()), "REEF");
  console.log("Total Burned:", hre.ethers.utils.formatEther(await reefBurner.totalBurned()), "REEF");
  console.log("Paused:", await reefBurner.paused());

  const timeRemaining = await reefBurner.getTimeRemainingInRound();
  const days = Number(timeRemaining) / (24 * 60 * 60);
  console.log("Time Remaining in Round:", days.toFixed(2), "days");

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Block Number:", await hre.ethers.provider.getBlockNumber());

  console.log("\n=== Next Steps ===");
  console.log("1. Verify contract on Reefscan (if on mainnet)");
  console.log("2. Test burn functionality");
  console.log("3. Monitor prize distribution");
  console.log("4. Build and deploy frontend");

  console.log("\n=== Important Addresses ===");
  console.log("Save these addresses for frontend integration:");
  console.log("Contract:", contractAddress);
  console.log("Creator Wallet:", CREATOR_WALLET);

  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    creatorWallet: CREATOR_WALLET,
    deployer: deployer.address,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  const deploymentPath = `./deployments/${hre.network.name}.json`;
  fs.mkdirSync('./deployments', { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\nDeployment info saved to:", deploymentPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
