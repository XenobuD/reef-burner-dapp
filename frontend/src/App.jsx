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
    statistics,
    participants,
    winners,
    timeRemaining,
    loading,
    availableAccounts
  } = contractHook();

  const [burnAmount, setBurnAmount] = useState('5'); // Testing mode: 5-8 REEF
  const [isBurning, setIsBurning] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
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

      // User-friendly error messages
      let errorMsg = '❌ Burn failed!\n\n';
      if (error.message.includes('insufficient funds')) {
        errorMsg += 'Insufficient REEF balance. Make sure you have enough REEF to cover the burn amount + gas fees.';
      } else if (error.message.includes('user rejected') || error.message.includes('rejected')) {
        errorMsg += 'Transaction was rejected in your wallet.';
      } else if (error.message.includes('Max participants')) {
        errorMsg += 'Maximum participants reached for this round. Please wait for the next round.';
      } else {
        errorMsg += error.message;
      }

      alert(errorMsg);
    } finally {
      setIsBurning(false);
    }
  };

  const handleTriggerLottery = async () => {
    if (!account) return;

    try {
      setIsTriggering(true);
      await triggerLottery();
      alert('🎉 Lottery triggered successfully! Check the winner below.');
    } catch (error) {
      console.error('Trigger failed:', error);
      alert(`❌ Failed to trigger lottery: ${error.message}`);
    } finally {
      setIsTriggering(false);
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

        {/* Auto-trigger info (shows when round ended) */}
        {timeRemaining <= 0 && (
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
                Lottery Triggering Automatically...
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Winner will be selected and prize sent automatically!
              </p>
            </motion.div>

            {/* Manual trigger option */}
            {account && (
              <div style={{ marginTop: '1.5rem' }}>
                <motion.button
                  className="btn"
                  onClick={handleTriggerLottery}
                  disabled={isTriggering}
                  whileHover={!isTriggering ? { scale: 1.05 } : {}}
                  whileTap={!isTriggering ? { scale: 0.95 } : {}}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--card-border)',
                    padding: '0.8rem 1.5rem',
                    fontSize: '0.9rem',
                    opacity: isTriggering ? 0.5 : 0.7,
                    cursor: isTriggering ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isTriggering ? '🔄 Triggering...' : 'Or trigger manually'}
                </motion.button>
              </div>
            )}
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
