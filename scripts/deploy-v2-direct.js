const ethers = require('ethers');
const fs = require('fs');

async function main() {
  console.log("🚀 Direct deployment to Reef...\n");

  try {
    // Connect to Reef RPC
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.reefscan.com');

    console.log("Testing connection...");
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.chainId);

    // Create wallet from mnemonic
    const mnemonic = "wear faint garbage you trick loyal board report weapon dutch neck parade";
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const signer = wallet.connect(provider);

    console.log("\nWallet address:", signer.address);

    // Get balance
    const balance = await signer.getBalance();
    console.log("Balance:", ethers.utils.formatEther(balance), "REEF\n");

    // Load contract ABI and bytecode
    const contractJson = JSON.parse(
      fs.readFileSync('./artifacts/contracts/ReefBurnerV2.sol/ReefBurnerV2.json', 'utf8')
    );

    console.log("📦 Deploying ReefBurnerV2...");
    console.log("Creator wallet:", signer.address);

    // Create contract factory
    const factory = new ethers.ContractFactory(
      contractJson.abi,
      contractJson.bytecode,
      signer
    );

    // Deploy
    const contract = await factory.deploy(signer.address, {
      gasLimit: 8000000
    });

    console.log("⏳ Waiting for deployment transaction...");
    console.log("TX hash:", contract.deployTransaction.hash);

    await contract.deployed();

    console.log("\n✅ DEPLOYED SUCCESSFULLY!");
    console.log("\n=== CONTRACT INFO ===");
    console.log("Address:", contract.address);
    console.log("Creator:", signer.address);
    console.log("\nReefScan:");
    console.log(`https://reefscan.com/contract/${contract.address}`);

    // Save deployment info
    const deploymentInfo = {
      version: "2.0",
      contractAddress: contract.address,
      creatorWallet: signer.address,
      deployer: signer.address,
      network: "reef_mainnet",
      txHash: contract.deployTransaction.hash,
      timestamp: new Date().toISOString()
    };

    fs.mkdirSync('./deployments', { recursive: true });
    fs.writeFileSync(
      './deployments/reef_mainnet-v2.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 Deployment info saved!");
    console.log("\n🎉 READY TO USE!");

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    if (error.error) console.error(error.error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
