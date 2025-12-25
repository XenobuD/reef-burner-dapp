const hre = require("hardhat");
const { Provider, Signer } = require('@reef-defi/evm-provider');
const { WsProvider, Keyring } = require('@polkadot/api');
const { createTestPairs } = require('@polkadot/keyring/testingPairs');

async function main() {
  console.log("🚀 Auto-deploying ReefBurnerV2...\n");

  try {
    // Connect to Reef
    console.log("Connecting to Reef mainnet...");
    const provider = new Provider({
      provider: new WsProvider('wss://rpc.reefscan.com/ws')
    });

    await provider.api.isReady;
    console.log("✅ Connected to Reef\n");

    // Create wallet from seed
    const mnemonic = "wear faint garbage you trick loyal board report weapon dutch neck parade";
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(mnemonic);

    console.log("Wallet address:", pair.address);

    // Create signer
    const signer = new Signer(provider, pair.address, provider);

    // Claim EVM account if not claimed
    if (!(await signer.isClaimed())) {
      console.log("Claiming EVM account...");
      await signer.claimDefaultAccount();
    }

    const evmAddress = await signer.getAddress();
    console.log("EVM address:", evmAddress);

    const balance = await signer.getBalance();
    console.log("Balance:", hre.ethers.utils.formatEther(balance), "REEF\n");

    // Deploy contract
    console.log("📦 Deploying ReefBurnerV2...");

    const ReefBurnerV2 = await hre.ethers.getContractFactory("ReefBurnerV2", signer);
    const contract = await ReefBurnerV2.deploy(evmAddress);

    console.log("⏳ Waiting for deployment...");
    await contract.deployed();

    console.log("✅ DEPLOYED!");
    console.log("\n=== CONTRACT INFO ===");
    console.log("Address:", contract.address);
    console.log("Creator:", evmAddress);
    console.log("\nReefScan:");
    console.log(`https://reefscan.com/contract/${contract.address}`);

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
      version: "2.0",
      contractAddress: contract.address,
      creatorWallet: evmAddress,
      deployer: evmAddress,
      network: "reef_mainnet",
      timestamp: new Date().toISOString()
    };

    fs.mkdirSync('./deployments', { recursive: true });
    fs.writeFileSync(
      './deployments/reef_mainnet-v2.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 Saved to: ./deployments/reef_mainnet-v2.json");
    console.log("\n🎉 DEPLOYMENT COMPLETE!");

    await provider.api.disconnect();
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
