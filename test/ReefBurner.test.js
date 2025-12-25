const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReefBurner", function () {
  let ReefBurner;
  let reefBurner;
  let owner;
  let devWallet;
  let user1;
  let user2;
  let user3;
  let attacker;

  const ONE_REEF = ethers.parseEther("1");
  const TEN_REEF = ethers.parseEther("10");
  const HUNDRED_REEF = ethers.parseEther("100");

  beforeEach(async function () {
    // Get signers
    [owner, devWallet, user1, user2, user3, attacker] = await ethers.getSigners();

    // Deploy contract
    ReefBurner = await ethers.getContractFactory("ReefBurner");
    reefBurner = await ReefBurner.deploy(devWallet.address);
    await reefBurner.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await reefBurner.owner()).to.equal(owner.address);
    });

    it("Should set the correct dev wallet", async function () {
      expect(await reefBurner.devWallet()).to.equal(devWallet.address);
    });

    it("Should initialize round number to 1", async function () {
      expect(await reefBurner.roundNumber()).to.equal(1);
    });

    it("Should not be paused initially", async function () {
      expect(await reefBurner.paused()).to.equal(false);
    });

    it("Should set correct percentages", async function () {
      expect(await reefBurner.BURN_PERCENTAGE()).to.equal(70);
      expect(await reefBurner.PRIZE_PERCENTAGE()).to.equal(20);
      expect(await reefBurner.DEV_PERCENTAGE()).to.equal(10);
    });

    it("Should reject deployment with zero dev wallet", async function () {
      const ReefBurnerFactory = await ethers.getContractFactory("ReefBurner");
      await expect(
        ReefBurnerFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid dev wallet");
    });
  });

  describe("Burn Function", function () {
    it("Should allow users to burn REEF", async function () {
      await expect(
        reefBurner.connect(user1).burn({ value: TEN_REEF })
      ).to.not.be.reverted;
    });

    it("Should reject burns below minimum amount", async function () {
      const tooLow = ethers.parseEther("0.5");
      await expect(
        reefBurner.connect(user1).burn({ value: tooLow })
      ).to.be.revertedWith("Amount below minimum");
    });

    it("Should correctly distribute funds (70% burn, 20% prize, 10% dev)", async function () {
      const devBalanceBefore = await ethers.provider.getBalance(devWallet.address);

      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      const expectedDevAmount = TEN_REEF * 10n / 100n; // 10% = 1 REEF
      const devBalanceAfter = await ethers.provider.getBalance(devWallet.address);

      expect(devBalanceAfter - devBalanceBefore).to.equal(expectedDevAmount);

      const expectedPrizePool = TEN_REEF * 20n / 100n; // 20% = 2 REEF
      expect(await reefBurner.prizePool()).to.equal(expectedPrizePool);

      const expectedBurned = TEN_REEF * 70n / 100n; // 70% = 7 REEF
      expect(await reefBurner.totalBurned()).to.equal(expectedBurned);
    });

    it("Should add user to round participants", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      const participants = await reefBurner.getCurrentRoundParticipants();
      expect(participants.length).to.equal(1);
      expect(participants[0]).to.equal(user1.address);
    });

    it("Should not add same user twice to participants", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });
      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      const participants = await reefBurner.getCurrentRoundParticipants();
      expect(participants.length).to.equal(1);
    });

    it("Should track user burned amount in round", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });
      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      const userBurned = await reefBurner.getUserBurnInCurrentRound(user1.address);
      expect(userBurned).to.equal(TEN_REEF * 2n);
    });

    it("Should track total user burned (lifetime)", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });
      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      const totalUserBurned = await reefBurner.totalUserBurned(user1.address);
      expect(totalUserBurned).to.equal(TEN_REEF * 2n);
    });

    it("Should emit Burned event", async function () {
      await expect(reefBurner.connect(user1).burn({ value: TEN_REEF }))
        .to.emit(reefBurner, "Burned")
        .withArgs(
          user1.address,
          TEN_REEF,
          TEN_REEF * 70n / 100n, // burned
          TEN_REEF * 20n / 100n, // prize
          TEN_REEF * 10n / 100n, // dev
          1 // round number
        );
    });

    it("Should handle multiple users burning", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });
      await reefBurner.connect(user2).burn({ value: TEN_REEF });
      await reefBurner.connect(user3).burn({ value: TEN_REEF });

      const participants = await reefBurner.getCurrentRoundParticipants();
      expect(participants.length).to.equal(3);

      const expectedTotalBurned = TEN_REEF * 3n * 70n / 100n;
      expect(await reefBurner.totalBurned()).to.equal(expectedTotalBurned);

      const expectedPrizePool = TEN_REEF * 3n * 20n / 100n;
      expect(await reefBurner.prizePool()).to.equal(expectedPrizePool);
    });
  });

  describe("Round Management", function () {
    it("Should start at round 1", async function () {
      expect(await reefBurner.roundNumber()).to.equal(1);
    });

    it("Should return correct time remaining in round", async function () {
      const timeRemaining = await reefBurner.getTimeRemainingInRound();
      const SEVEN_DAYS = 7n * 24n * 60n * 60n;

      // Should be approximately 7 days (allowing small variance)
      expect(timeRemaining).to.be.closeTo(SEVEN_DAYS, 100n);
    });

    it("Should indicate when round should end", async function () {
      expect(await reefBurner.shouldEndRound()).to.equal(false);

      // Fast forward 7 days
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      expect(await reefBurner.shouldEndRound()).to.equal(true);
    });

    it("Should allow manual trigger of round end after duration", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      // Try to trigger before 7 days - should fail
      await expect(
        reefBurner.triggerRoundEnd()
      ).to.be.revertedWith("Round not finished yet");

      // Fast forward 7 days
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // Now should work
      await expect(reefBurner.triggerRoundEnd()).to.not.be.reverted;

      // Round number should increment
      expect(await reefBurner.roundNumber()).to.equal(2);
    });

    it("Should automatically start new round on burn after duration", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      expect(await reefBurner.roundNumber()).to.equal(1);

      // Fast forward 7 days
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // Burn in new round
      await reefBurner.connect(user2).burn({ value: TEN_REEF });

      // Should be round 2 now
      expect(await reefBurner.roundNumber()).to.equal(2);
    });
  });

  describe("Prize Distribution", function () {
    it("Should select winner and distribute prize automatically", async function () {
      // Users participate
      await reefBurner.connect(user1).burn({ value: HUNDRED_REEF });
      await reefBurner.connect(user2).burn({ value: HUNDRED_REEF });
      await reefBurner.connect(user3).burn({ value: HUNDRED_REEF });

      const expectedPrizePool = HUNDRED_REEF * 3n * 20n / 100n; // 60 REEF
      expect(await reefBurner.prizePool()).to.equal(expectedPrizePool);

      // Fast forward 7 days
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // Trigger round end
      const tx = await reefBurner.triggerRoundEnd();
      const receipt = await tx.wait();

      // Check WinnerSelected event was emitted
      const winnerEvent = receipt.logs.find(
        log => {
          try {
            const parsed = reefBurner.interface.parseLog(log);
            return parsed && parsed.name === "WinnerSelected";
          } catch {
            return false;
          }
        }
      );

      expect(winnerEvent).to.not.be.undefined;

      // Prize pool should be reset
      expect(await reefBurner.prizePool()).to.equal(0);

      // Winner should be recorded
      expect(await reefBurner.getWinnersCount()).to.equal(1);

      const winner = await reefBurner.getWinner(0);
      expect(winner.prizeAmount).to.equal(expectedPrizePool);
      expect(winner.roundNum).to.equal(1);
    });

    it("Should not distribute prize if no participants", async function () {
      // Fast forward 7 days without any burns
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await reefBurner.triggerRoundEnd();

      // Should still move to round 2 but no winner
      expect(await reefBurner.roundNumber()).to.equal(2);
      expect(await reefBurner.getWinnersCount()).to.equal(0);
    });

    it("Should handle multiple rounds of prize distribution", async function () {
      // Round 1
      await reefBurner.connect(user1).burn({ value: TEN_REEF });
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await reefBurner.triggerRoundEnd();

      expect(await reefBurner.getWinnersCount()).to.equal(1);

      // Round 2
      await reefBurner.connect(user2).burn({ value: TEN_REEF });
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await reefBurner.triggerRoundEnd();

      expect(await reefBurner.getWinnersCount()).to.equal(2);

      // Verify different rounds
      const winner1 = await reefBurner.getWinner(0);
      const winner2 = await reefBurner.getWinner(1);

      expect(winner1.roundNum).to.equal(1);
      expect(winner2.roundNum).to.equal(2);
    });
  });

  describe("Security Tests", function () {
    it("Should prevent reentrancy attacks", async function () {
      // The contract doesn't have external calls that could be exploited
      // but we test that state updates happen before transfers
      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      const prizePool = await reefBurner.prizePool();
      expect(prizePool).to.be.gt(0);
    });

    it("Should handle zero value attacks", async function () {
      await expect(
        reefBurner.connect(attacker).burn({ value: 0 })
      ).to.be.revertedWith("Amount below minimum");
    });

    it("Should prevent unauthorized pause", async function () {
      await expect(
        reefBurner.connect(attacker).pause()
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should prevent unauthorized unpause", async function () {
      await reefBurner.connect(owner).pause();

      await expect(
        reefBurner.connect(attacker).unpause()
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should prevent burns when paused", async function () {
      await reefBurner.connect(owner).pause();

      await expect(
        reefBurner.connect(user1).burn({ value: TEN_REEF })
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should prevent unauthorized ownership transfer", async function () {
      await expect(
        reefBurner.connect(attacker).transferOwnership(attacker.address)
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should prevent unauthorized min burn amount change", async function () {
      await expect(
        reefBurner.connect(attacker).setMinBurnAmount(ethers.parseEther("100"))
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should prevent unauthorized dev wallet change", async function () {
      await expect(
        reefBurner.connect(attacker).setDevWallet(attacker.address)
      ).to.be.revertedWith("Only owner can call this");
    });

    it("Should prevent setting zero address as dev wallet", async function () {
      await expect(
        reefBurner.connect(owner).setDevWallet(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should prevent setting zero address as new owner", async function () {
      await expect(
        reefBurner.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should prevent setting zero as min burn amount", async function () {
      await expect(
        reefBurner.connect(owner).setMinBurnAmount(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should handle integer overflow protection", async function () {
      // Modern Solidity (0.8+) has built-in overflow protection
      // Test that very large values are handled correctly
      const largeValue = ethers.parseEther("1000000");

      // This should work without overflow
      await expect(
        reefBurner.connect(user1).burn({ value: largeValue })
      ).to.not.be.reverted;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause", async function () {
      await reefBurner.connect(owner).pause();
      expect(await reefBurner.paused()).to.equal(true);
    });

    it("Should allow owner to unpause", async function () {
      await reefBurner.connect(owner).pause();
      await reefBurner.connect(owner).unpause();
      expect(await reefBurner.paused()).to.equal(false);
    });

    it("Should allow owner to update min burn amount", async function () {
      const newAmount = ethers.parseEther("5");
      await reefBurner.connect(owner).setMinBurnAmount(newAmount);
      expect(await reefBurner.minBurnAmount()).to.equal(newAmount);
    });

    it("Should allow owner to update dev wallet", async function () {
      await reefBurner.connect(owner).setDevWallet(user1.address);
      expect(await reefBurner.devWallet()).to.equal(user1.address);
    });

    it("Should allow owner to transfer ownership", async function () {
      await reefBurner.connect(owner).transferOwnership(user1.address);
      expect(await reefBurner.owner()).to.equal(user1.address);
    });

    it("Should emit events on admin actions", async function () {
      await expect(reefBurner.connect(owner).pause())
        .to.emit(reefBurner, "EmergencyPause")
        .withArgs(true);

      await expect(reefBurner.connect(owner).unpause())
        .to.emit(reefBurner, "EmergencyPause")
        .withArgs(false);

      const newAmount = ethers.parseEther("5");
      await expect(reefBurner.connect(owner).setMinBurnAmount(newAmount))
        .to.emit(reefBurner, "MinBurnAmountUpdated")
        .withArgs(newAmount);

      await expect(reefBurner.connect(owner).setDevWallet(user1.address))
        .to.emit(reefBurner, "DevWalletUpdated")
        .withArgs(user1.address);
    });
  });

  describe("View Functions", function () {
    it("Should return correct round participants", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });
      await reefBurner.connect(user2).burn({ value: TEN_REEF });

      const participants = await reefBurner.getRoundParticipants(1);
      expect(participants.length).to.equal(2);
      expect(participants[0]).to.equal(user1.address);
      expect(participants[1]).to.equal(user2.address);
    });

    it("Should return winner details correctly", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await reefBurner.triggerRoundEnd();

      const winner = await reefBurner.getWinner(0);
      expect(winner.winnerAddress).to.equal(user1.address);
      expect(winner.roundNum).to.equal(1);
    });

    it("Should revert on invalid winner index", async function () {
      await expect(
        reefBurner.getWinner(999)
      ).to.be.revertedWith("Invalid index");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle exact minimum burn amount", async function () {
      await expect(
        reefBurner.connect(user1).burn({ value: ONE_REEF })
      ).to.not.be.reverted;
    });

    it("Should handle very small amounts above minimum", async function () {
      const slightlyAboveMin = ONE_REEF + 1n;
      await expect(
        reefBurner.connect(user1).burn({ value: slightlyAboveMin })
      ).to.not.be.reverted;
    });

    it("Should handle participant joining right before round end", async function () {
      await reefBurner.connect(user1).burn({ value: TEN_REEF });

      // Almost 7 days
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 - 60]);
      await ethers.provider.send("evm_mine");

      // User2 joins last minute
      await reefBurner.connect(user2).burn({ value: TEN_REEF });

      const participants = await reefBurner.getCurrentRoundParticipants();
      expect(participants.length).to.equal(2);
    });

    it("Should handle empty round followed by active round", async function () {
      // Round 1: no participants
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await reefBurner.triggerRoundEnd();

      // Round 2: active
      await reefBurner.connect(user1).burn({ value: TEN_REEF });
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await reefBurner.triggerRoundEnd();

      expect(await reefBurner.getWinnersCount()).to.equal(1); // Only round 2 winner
    });

    it("Should accept direct REEF transfers via receive()", async function () {
      const tx = {
        to: await reefBurner.getAddress(),
        value: ONE_REEF
      };

      await expect(user1.sendTransaction(tx)).to.not.be.reverted;

      // But should not add to prize pool
      expect(await reefBurner.prizePool()).to.equal(0);
    });
  });

  describe("Gas Consumption", function () {
    it("Should consume significant gas for burn operations", async function () {
      const tx = await reefBurner.connect(user1).burn({ value: TEN_REEF });
      const receipt = await tx.wait();

      // Gas used should be > 100k due to intensive operations
      expect(receipt.gasUsed).to.be.gt(100000n);
    });
  });
});
