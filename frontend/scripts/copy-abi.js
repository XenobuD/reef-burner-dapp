import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const artifactPath = path.join(__dirname, '../../artifacts/contracts/ReefBurner.sol/ReefBurner.json');
const destPath = path.join(__dirname, '../src/contracts/ReefBurner.json');

try {
  // Check if artifact exists
  if (!fs.existsSync(artifactPath)) {
    console.error('❌ Contract artifact not found!');
    console.log('Please compile the contract first by running: yarn hardhat compile');
    process.exit(1);
  }

  // Read artifact
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Extract only what we need
  const contractABI = {
    abi: artifact.abi,
    contractName: artifact.contractName,
    bytecode: artifact.bytecode
  };

  // Write to destination
  fs.writeFileSync(destPath, JSON.stringify(contractABI, null, 2));

  console.log('✅ Contract ABI copied successfully!');
  console.log(`📁 Location: ${destPath}`);
} catch (error) {
  console.error('❌ Error copying ABI:', error.message);
  process.exit(1);
}
