import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import BurnCard from './components/BurnCard';
import ParticipantsList from './components/ParticipantsList';
import WinnerHistory from './components/WinnerHistory';
import AnimatedBackground from './components/AnimatedBackground';
import AboutModal from './components/AboutModal';

// 🔄 TOGGLE BETWEEN MOCK (local demo) AND REAL (blockchain)
const USE_MOCK = false; // ✅ REAL MODE - connected to Reef Mainnet (TESTING: 5-8 REEF, 1 hour)

import { useReefContract } from './hooks/useReefContract';
import { useReefContractMock } from './hooks/useReefContractMock';

function App() {
  // Use MOCK for local testing or REAL for blockchain
  const contractHook = USE_MOCK ? useReefContractMock : useReefContract;

  const {
    account,
    connectWallet,
    switchAccount,
    disconnectWallet,
    burnTokens,
    triggerLottery,
    revealWinner,
    claimPrize,
    statistics,
    participants,
    winners,
    timeRemaining,
    randomnessStatus,
    unclaimedPrizeInfo,
    loading,
    availableAccounts
  } = contractHook();

  const [burnAmount, setBurnAmount] = useState('5'); // Testing mode: 5-8 REEF
  const [isBurning, setIsBurning] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Check URL parameters to auto-open About modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('about') === 'true') {
      setShowAboutModal(true);
    }
  }, []);

  const handleBurn = async () => {
    if (!account || !burnAmount) return;

    // Validate amount before sending transaction
    const amount = parseFloat(burnAmount);
    if (isNaN(amount)) {
      alert('⚠️ Invalid amount. Please enter a number.');
      return;
    }

    if (amount < 5) {
      alert('⚠️ Amount too low!\n\nMinimum: 5 REEF (testing mode)');
      return;
    }

    if (amount > 8) {
      alert('⚠️ Amount too high!\n\nMaximum: 8 REEF (testing mode)');
      return;
    }

    try {
      setIsBurning(true);
      console.log('🔥 App: Starting burn for', burnAmount, 'REEF');

      await burnTokens(burnAmount);

      console.log('🎉 App: Burn completed!');
      setBurnAmount('5'); // Reset to minimum (testing mode: 5 REEF)
      alert('✅ Burn successful! Transaction confirmed on blockchain.\n\nYou are now entered in the lottery! 🎲');
    } catch (error) {
      console.error('❌ App: Burn failed:', error);

      // Convert error to string for better detection
      const errorString = error.toString() + (error.message || '');

      // User-friendly error messages
      let errorMsg = '❌ Burn failed!\n\n';

      // Detect Reef Chain "Module { index: 6, error: 2 }" = Insufficient Balance
      if (errorString.includes('Module') && errorString.includes('index: 6') && errorString.includes('error: 2')) {
        errorMsg += '💰 Insufficient REEF balance!\n\n';
        errorMsg += '⚠️ MINIMUM REQUIRED: 1500-2000 REEF in your wallet\n\n';
        errorMsg += 'Why so much?\n';
        errorMsg += '• Burn amount: Only 5-8 REEF (testing phase)\n';
        errorMsg += '• Blockchain verification: Requires 1500+ REEF minimum balance\n';
        errorMsg += '• Gas fees: ~1-2 REEF\n';
        errorMsg += '• Recommended: 2000 REEF for safety\n\n';
        errorMsg += '💡 Even though you only burn 5-8 REEF, the smart contract\n';
        errorMsg += '   verifies you have sufficient total balance (1500-2000 REEF).\n\n';
        errorMsg += '📊 REEF price: ~$0.00014 (2000 REEF = ~$0.28)\n\n';
        errorMsg += 'Please add more REEF to your wallet and try again.';
      } else if (errorString.includes('insufficient funds') || errorString.includes('InsufficientBalance')) {
        errorMsg += 'Insufficient REEF balance. Make sure you have enough REEF to cover the burn amount + gas fees (~0.5 REEF extra).';
      } else if (errorString.includes('user rejected') || errorString.includes('rejected')) {
        errorMsg += 'Transaction was rejected in your wallet.';
      } else if (errorString.includes('Max participants')) {
        errorMsg += 'Maximum participants reached for this round. Please wait for the next round.';
      } else if (errorString.includes('Amount below minimum')) {
        errorMsg += 'Burn amount is below minimum (5 REEF). Please increase the amount.';
      } else if (errorString.includes('Amount exceeds maximum')) {
        errorMsg += 'Burn amount exceeds maximum (8 REEF for testing). Please reduce the amount.';
      } else {
        errorMsg += error.message || 'Unknown error occurred. Please check console for details.';
      }

      alert(errorMsg);
    } finally {
      setIsBurning(false);
    }
  };

  const handleTriggerLottery = async () => {
    if (!account) {
      alert('⚠️ Please connect your wallet first!');
      return;
    }

    try {
      setIsTriggering(true);
      await triggerLottery();
      alert('�� Lottery triggered successfully! Check the winner below.');
      setIsTriggering(false);
    } catch (error) {
      console.error('Trigger failed:', error);
      setIsTriggering(false); // Reset immediately

      // Convert error to string for checking (error.message may be undefined)
      const errorString = error.toString() + (error.message || '');

      // User cancelled transaction - ignore silently
      if (errorString.includes('user rejected') || errorString.includes('User rejected')) {
        console.log('User cancelled transaction');
        return;
      }

      // Priority too low - user clicked twice too fast, show friendly message
      if (errorString.includes('Priority is too low')) {
        console.log('⚠️ Transaction already submitted, ignoring duplicate click');
        alert('⏳ Transaction already in progress!\n\nPlease wait 10-15 seconds for the current block to finish processing.');
        return;
      }

      // Handle "Must commit first" error (round not ended yet)
      if (errorString.includes('Must commit first')) {
        alert('⏰ Round not finished yet!\n\nPlease wait until the round timer reaches 0:00, then try again.');
        return;
      }

      // Handle "Round not finished" error
      if (errorString.includes('Round not finished')) {
        alert('⏰ Round still in progress!\n\nPlease wait for the 5-minute round to complete before triggering the lottery.');
        return;
      }

      // Handle "Already committed" error
      if (errorString.includes('Already committed')) {
        alert('⚠️ Lottery already triggered!\n\nPlease click "Reveal Winner" button to complete the draw.');
        return;
      }

      alert(`❌ Failed to trigger lottery: ${error.message}`);
    }
  };

  const handleRevealWinner = async () => {
    if (!account) {
      alert('⚠️ Please connect your wallet first!');
      return;
    }

    try {
      setIsRevealing(true);
      // revealWinner will now automatically wait for 3 blocks if needed
      await revealWinner();
      alert('🎉 Winner revealed successfully!');
      setIsRevealing(false);
    } catch (error) {
      console.error('Reveal failed:', error);
      setIsRevealing(false); // Reset immediately

      // Convert error to string for checking (error.message may be undefined)
      const errorString = error.toString() + (error.message || '');

      // User cancelled transaction - ignore silently
      if (errorString.includes('user rejected') || errorString.includes('User rejected')) {
        console.log('User cancelled transaction');
        return;
      }

      // Priority too low - user clicked twice too fast, show friendly message
      if (errorString.includes('Priority is too low')) {
        console.log('⚠️ Transaction already submitted, ignoring duplicate click');
        alert('⏳ Transaction already in progress!\n\nPlease wait 10-15 seconds for the current block to finish processing.');
        return;
      }

      // Must commit first - no randomness committed yet
      if (errorString.includes('Must commit first')) {
        alert('⚠️ No lottery to reveal!\n\nPlease click "Trigger Lottery" button first to start the draw.');
        return;
      }

      // Transaction is outdated - someone else already revealed
      if (errorString.includes('Transaction is outdated') || errorString.includes('1010')) {
        console.log('✅ Winner already revealed by someone else');
        alert('✅ Winner already revealed!\n\nSomeone else revealed the winner while you were clicking. You can now claim the prize below!');
        return;
      }

      alert(`❌ Failed to reveal winner: ${error.message}`);
    }
  };

  const handleClaimPrize = async () => {
    if (!account) {
      alert('⚠️ Please connect your wallet first!');
      return;
    }

    try {
      setIsClaiming(true);
      await claimPrize();
      alert('💰 Prize claimed and sent to winner successfully!');
      setIsClaiming(false);
    } catch (error) {
      console.error('Claim failed:', error);
      setIsClaiming(false); // Reset state immediately on error

      // User-friendly error messages
      if (error.message?.includes('user rejected') || error.message?.includes('User rejected')) {
        // User closed wallet popup - don't show error
        console.log('User cancelled transaction');
        return;
      }

      alert(`❌ Failed to claim prize: ${error.message}`);
    }
  };

  return (
    <div className="app-container">
      <AnimatedBackground />

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      <Header
        account={account}
        connectWallet={connectWallet}
        switchAccount={switchAccount}
        disconnectWallet={disconnectWallet}
        availableAccounts={availableAccounts}
        onAboutClick={() => setShowAboutModal(true)}
      />

      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <motion.h1
            className="gradient-text"
            style={{
              fontSize: '4rem',
              fontWeight: '900',
              marginBottom: '1rem',
              letterSpacing: '-2px'
            }}
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            🔥 REEF BURNER 🔥
          </motion.h1>
          <motion.p
            style={{
              fontSize: '1.5rem',
              color: 'var(--text-secondary)',
              maxWidth: '800px',
              margin: '0 auto'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Burn REEF. Create Deflation. Win Massive Prizes Every 3 Days!
          </motion.p>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <StatsPanel
            statistics={statistics}
            timeRemaining={timeRemaining}
            loading={loading}
          />
        </motion.div>

        {/* Show reveal button if randomness committed but winner not revealed AND there are participants */}
        {randomnessStatus.committed && account && participants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                padding: '1.5rem 2rem',
                background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1), rgba(255, 67, 185, 0.1))',
                border: '2px solid orange',
                borderRadius: '16px',
                display: 'inline-block'
              }}
            >
              <p style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: 'orange',
                marginBottom: '0.5rem'
              }}>
                ⏳ Waiting for Winner Reveal
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                {randomnessStatus.blocksUntilReveal > 0
                  ? `Wait ${randomnessStatus.blocksUntilReveal} more blocks before revealing...`
                  : 'Ready to reveal winner! Click below to complete the lottery.'}
              </p>

              {randomnessStatus.blocksUntilReveal === 0 && (
                <motion.button
                  className="btn"
                  onClick={handleRevealWinner}
                  disabled={isRevealing}
                  whileHover={!isRevealing ? { scale: 1.05 } : {}}
                  whileTap={!isRevealing ? { scale: 0.95 } : {}}
                  style={{
                    background: 'linear-gradient(135deg, var(--reef-purple), var(--reef-pink))',
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    opacity: isRevealing ? 0.5 : 1,
                    cursor: isRevealing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isRevealing ? '⏳ Waiting for blocks & revealing...' : '🎲 Reveal Winner Now!'}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Unclaimed Prize Display (shows when there's a prize waiting to be claimed) */}
        {unclaimedPrizeInfo && unclaimedPrizeInfo.amount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.3)',
                  '0 0 40px rgba(255, 215, 0, 0.5)',
                  '0 0 20px rgba(255, 215, 0, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))',
                border: '2px solid gold',
                borderRadius: '16px',
                display: 'inline-block',
                minWidth: '400px'
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ fontSize: '3rem', marginBottom: '1rem' }}
              >
                💰
              </motion.div>

              <p style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'gold',
                marginBottom: '1rem'
              }}>
                Unclaimed Prize Available!
              </p>

              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1rem'
              }}>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: 'gold',
                  marginBottom: '0.5rem'
                }}>
                  {parseFloat(unclaimedPrizeInfo.amount).toFixed(2)} REEF
                </p>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)'
                }}>
                  Winner: {unclaimedPrizeInfo.winner?.slice(0, 6)}...{unclaimedPrizeInfo.winner?.slice(-4)}
                </p>
              </div>

              <p style={{
                fontSize: '0.9rem',
                color: 'orange',
                marginBottom: '1.5rem'
              }}>
                ⏰ {unclaimedPrizeInfo.roundsRemaining} rounds remaining to claim
                {unclaimedPrizeInfo.roundsRemaining <= 3 && ' - Hurry!'}
              </p>

              {account && (
                <motion.button
                  className="btn"
                  onClick={handleClaimPrize}
                  disabled={isClaiming}
                  whileHover={!isClaiming ? { scale: 1.05 } : {}}
                  whileTap={!isClaiming ? { scale: 0.95 } : {}}
                  style={{
                    background: 'linear-gradient(135deg, gold, orange)',
                    color: '#000',
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    opacity: isClaiming ? 0.5 : 1,
                    cursor: isClaiming ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isClaiming ? '🔄 Claiming Prize...' : '💰 Claim Prize for Winner'}
                </motion.button>
              )}

              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginTop: '1rem',
                fontStyle: 'italic'
              }}>
                Anyone can trigger the claim to send the prize to the winner!
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Auto-trigger info (shows when round ended) */}
        {timeRemaining <= 0 && !randomnessStatus.committed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                padding: '1.5rem 2rem',
                background: 'linear-gradient(135deg, rgba(112, 67, 255, 0.1), rgba(255, 67, 185, 0.1))',
                border: '2px solid var(--reef-pink)',
                borderRadius: '16px',
                display: 'inline-block'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block', fontSize: '2rem', marginBottom: '0.5rem' }}
              >
                🎲
              </motion.div>
              <p style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: 'var(--reef-pink)',
                marginBottom: '0.5rem'
              }}>
                Round Ended - Ready to Draw Winner!
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                Click the button below to trigger the lottery
              </p>

              {/* Manual trigger button */}
              {account && (
                <motion.button
                  className="btn btn-primary"
                  onClick={handleTriggerLottery}
                  disabled={isTriggering}
                  whileHover={!isTriggering ? { scale: 1.05 } : {}}
                  whileTap={!isTriggering ? { scale: 0.95 } : {}}
                  style={{
                    padding: '1rem 2rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: isTriggering ? 'not-allowed' : 'pointer',
                    opacity: isTriggering ? 0.7 : 1
                  }}
                >
                  {isTriggering ? '🔄 Triggering Lottery...' : '🎲 Trigger Lottery Now'}
                </motion.button>
              )}

              {!account && (
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  marginTop: '1rem'
                }}>
                  Connect wallet to trigger the lottery
                </p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Main Burn Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginTop: '3rem'
        }}>

          {/* Burn Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <BurnCard
              account={account}
              burnAmount={burnAmount}
              setBurnAmount={setBurnAmount}
              handleBurn={handleBurn}
              isBurning={isBurning}
              connectWallet={connectWallet}
            />
          </motion.div>

          {/* Participants List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <ParticipantsList
              participants={participants}
              currentAccount={account}
              loading={loading}
            />
          </motion.div>

        </div>

        {/* Winner History */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ marginTop: '3rem' }}
        >
          <WinnerHistory
            winners={winners}
            loading={loading}
          />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            marginTop: '4rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}
        >
          <p>🔒 Fully Automated • 🎲 Fair Weighted Lottery • 🔥 65% Burned Forever</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            ⚠️ TESTING MODE: Range: 5-8 REEF per transaction • Lottery every 1 hour
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
            Built on Reef Chain 🌊
          </p>
          {USE_MOCK && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                marginTop: '2rem',
                padding: '1rem 2rem',
                background: 'rgba(255, 165, 0, 0.1)',
                border: '2px solid orange',
                borderRadius: '12px',
                display: 'inline-block'
              }}
            >
              ⚠️ <strong>DEMO MODE</strong> - No real blockchain transactions ⚠️
            </motion.div>
          )}
        </motion.div>

      </main>
    </div>
  );
}

export default App;
