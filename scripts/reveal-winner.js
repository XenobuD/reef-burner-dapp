const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log('🎲 Revealing winner for stuck lottery...\n');

  const contractAddress = "0x9217CaCEa3Eeaf1Fb941c4Fdc17d165248Dd896f";

  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);

  // Get contract
  const ReefBurnerV2 = await ethers.getContractFactory("ReefBurnerV2");
  const contract = ReefBurnerV2.attach(contractAddress);

  // Check randomness status
  const randomStatus = await contract.getRandomnessStatus();
  console.log('\n📊 Randomness Status:');
  console.log('Committed:', randomStatus.committed);
  console.log('Commit Block:', randomStatus.commitBlock.toString());
  console.log('Blocks Until Reveal:', randomStatus.blocksUntilReveal.toString());

  if (!randomStatus.committed) {
    console.log('\n❌ Randomness not committed yet. Nothing to reveal.');
    return;
  }

  const currentBlock = await ethers.provider.getBlockNumber();
  console.log('\nCurrent Block:', currentBlock);
  console.log('Need to wait until block:', randomStatus.commitBlock.add(3).toString());

  if (randomStatus.blocksUntilReveal > 0) {
    console.log(`\n⏳ Need to wait ${randomStatus.blocksUntilReveal} more blocks...`);
    console.log('Please run this script again after those blocks have passed.');
    return;
  }

  console.log('\n✅ Ready to reveal winner!');
  console.log('🎲 Revealing winner...\n');

  const tx = await contract.revealWinner({
    gasLimit: 800000
  });

  console.log('Transaction sent:', tx.hash);
  console.log('Waiting for confirmation...\n');

  const receipt = await tx.wait();
  console.log('✅ Winner revealed!');
  console.log('Gas used:', receipt.gasUsed.toString());

  // Get updated stats
  const stats = await contract.getStatistics();
  console.log('\n📊 Updated Statistics:');
  console.log('Total Winners:', stats.winnersCount.toString());
  console.log('Current Round:', (await contract.roundNumber()).toString());
  console.log('Prize Pool:', ethers.utils.formatEther(stats.currentPrize), 'REEF');

  // Check for unclaimed prize
  const unclaimedInfo = await contract.getUnclaimedPrizeInfo();
  if (unclaimedInfo.amount.gt(0)) {
    console.log('\n🎁 Unclaimed Prize Info:');
    console.log('Winner:', unclaimedInfo.winner);
    console.log('Amount:', ethers.utils.formatEther(unclaimedInfo.amount), 'REEF');
    console.log('Claimable until round:', unclaimedInfo.claimableUntilRound.toString());
    console.log('Rounds remaining:', unclaimedInfo.roundsRemaining.toString());
  }

  console.log('\n✅ Done!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
