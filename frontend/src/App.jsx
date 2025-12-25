import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import BurnCard from './components/BurnCard';
import ParticipantsList from './components/ParticipantsList';
import WinnerHistory from './components/WinnerHistory';
import AnimatedBackground from './components/AnimatedBackground';

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

  const handleBurn = async () => {
    if (!account || !burnAmount) return;

    try {
      setIsBurning(true);
      await burnTokens(burnAmount);
      setBurnAmount('5'); // Reset to minimum (testing mode: 5 REEF)
    } catch (error) {
      console.error('Burn failed:', error);
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

      <Header
        account={account}
        connectWallet={connectWallet}
        switchAccount={switchAccount}
        disconnectWallet={disconnectWallet}
        availableAccounts={availableAccounts}
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

        {/* Trigger Lottery Button (shows when round ended) */}
        {account && timeRemaining <= 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}
          >
            <motion.button
              className="btn btn-primary"
              onClick={handleTriggerLottery}
              disabled={isTriggering}
              whileHover={!isTriggering ? { scale: 1.05 } : {}}
              whileTap={!isTriggering ? { scale: 0.95 } : {}}
              animate={!isTriggering ? {
                boxShadow: [
                  '0 8px 32px rgba(255, 67, 185, 0.4)',
                  '0 12px 48px rgba(255, 67, 185, 0.6)',
                  '0 8px 32px rgba(255, 67, 185, 0.4)'
                ]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                fontSize: '1.2rem',
                padding: '1.2rem 3rem',
                background: 'linear-gradient(135deg, #FF43B9, #7043FF)',
                border: '2px solid var(--reef-pink)',
                opacity: isTriggering ? 0.6 : 1,
                cursor: isTriggering ? 'not-allowed' : 'pointer'
              }}
            >
              {isTriggering ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block' }}
                >
                  🔄
                </motion.div>
              ) : (
                '🎲 TRIGGER THE LOTTERY 🎲'
              )}
            </motion.button>
            <p style={{
              marginTop: '1rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              ⏰ Round ended! Anyone can trigger.
            </p>
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
