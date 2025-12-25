import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BurnCard = ({
  account,
  burnAmount,
  setBurnAmount,
  handleBurn,
  isBurning,
  connectWallet
}) => {
  const [burnDistribution, setBurnDistribution] = useState({
    burned: 0,
    prize: 0,
    creator: 0
  });

  const [bonusPercent, setBonusPercent] = useState(0);

  useEffect(() => {
    const amount = parseFloat(burnAmount) || 0;
    setBurnDistribution({
      burned: (amount * 0.65).toFixed(2),
      prize: (amount * 0.27).toFixed(2),
      creator: (amount * 0.08).toFixed(2)
    });

    // Calculate bonus percentage
    if (amount >= 1500) {
      setBonusPercent(3);
    } else if (amount >= 1200) {
      setBonusPercent(2);
    } else if (amount >= 1050) {
      setBonusPercent(1);
    } else {
      setBonusPercent(0);
    }
  }, [burnAmount]);

  const isValid = parseFloat(burnAmount) >= 950 && parseFloat(burnAmount) <= 1500;

  return (
    <motion.div
      className="card"
      style={{
        background: 'linear-gradient(135deg, rgba(112, 67, 255, 0.1) 0%, rgba(255, 67, 185, 0.1) 100%)',
        border: '2px solid var(--reef-purple)'
      }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.h2
        style={{
          fontSize: '2rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}
        className="gradient-text"
      >
        🔥 Burn REEF & Enter Lottery
      </motion.h2>

      {!account ? (
        <motion.div
          style={{ textAlign: 'center', padding: '2rem 0' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Connect your wallet to start burning!
          </p>
          <motion.button
            className="btn btn-primary"
            onClick={connectWallet}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🌊 Connect Wallet
          </motion.button>
        </motion.div>
      ) : (
        <div>
          {/* Amount Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              Amount to Burn (REEF)
            </label>
            <input
              type="number"
              className="input"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              min="950"
              max="1500"
              step="50"
              placeholder="950 - 1500 REEF"
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              <span>Min: 950 REEF</span>
              <span>Max: 1,500 REEF</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            {[950, 1050, 1200, 1500].map((amount) => (
              <motion.button
                key={amount}
                className="btn"
                onClick={() => setBurnAmount(amount.toString())}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: burnAmount === amount.toString()
                    ? 'var(--reef-purple)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--card-border)',
                  padding: '0.6rem',
                  fontSize: '0.9rem'
                }}
              >
                {amount}
              </motion.button>
            ))}
          </div>

          {/* Bonus Indicator */}
          <AnimatePresence>
            {bonusPercent > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glow-pink"
                style={{
                  background: 'rgba(255, 67, 185, 0.1)',
                  border: '1px solid var(--reef-pink)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ fontSize: '1.2rem', fontWeight: '700' }}
                >
                  ⭐ +{bonusPercent}% Better Odds! ⭐
                </motion.div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                  {bonusPercent === 3 ? 'Maximum bonus!' : 'Burn more for better chances!'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Distribution Preview */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.8rem'
            }}>
              Distribution Preview:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🔥 Burned Forever (65%)</span>
                <span style={{ fontWeight: '700', color: 'var(--fire)' }}>
                  {burnDistribution.burned} REEF
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>💎 Prize Pool (27%)</span>
                <span style={{ fontWeight: '700', color: 'var(--reef-pink)' }}>
                  {burnDistribution.prize} REEF
                </span>
              </div>
            </div>
          </div>

          {/* Burn Button */}
          <motion.button
            className="btn btn-burn glow-fire"
            onClick={handleBurn}
            disabled={!isValid || isBurning}
            whileHover={isValid && !isBurning ? { scale: 1.05 } : {}}
            whileTap={isValid && !isBurning ? { scale: 0.95 } : {}}
            style={{
              width: '100%',
              opacity: isValid && !isBurning ? 1 : 0.5,
              cursor: isValid && !isBurning ? 'pointer' : 'not-allowed',
              position: 'relative'
            }}
          >
            {isBurning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >
                🔄
              </motion.div>
            ) : (
              <>🔥 BURN {burnAmount} REEF 🔥</>
            )}
          </motion.button>

          {!isValid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: '1rem',
                padding: '0.8rem',
                background: 'rgba(245, 101, 101, 0.1)',
                border: '1px solid var(--danger)',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--danger)'
              }}
            >
              ⚠️ Amount must be between 950 and 1,500 REEF
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BurnCard;
