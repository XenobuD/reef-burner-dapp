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
  const [isMobile, setIsMobile] = useState(false);
  const [hasReefExtension, setHasReefExtension] = useState(true);

  // Enhanced mobile detection (user agent + screen size + wallet capability)
  useEffect(() => {
    const checkMobile = () => {
      // Check user agent
      const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Check screen size (mobile typically < 768px width)
      const mobileScreen = window.innerWidth < 768;

      // Check if Reef Wallet Extension exists
      const hasExtension = typeof window.reef !== 'undefined';

      setIsMobile(mobileUA || mobileScreen);
      setHasReefExtension(hasExtension);
    };

    checkMobile();

    // Re-check on window resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const amount = parseFloat(burnAmount) || 0;
    setBurnDistribution({
      burned: (amount * 0.65).toFixed(2),
      prize: (amount * 0.27).toFixed(2),
      creator: (amount * 0.08).toFixed(2)
    });

    // Calculate bonus percentage (TESTING MODE: 5-8 REEF)
    if (amount >= 8) {
      setBonusPercent(3);
    } else if (amount >= 7) {
      setBonusPercent(2);
    } else if (amount >= 6) {
      setBonusPercent(1);
    } else {
      setBonusPercent(0);
    }
  }, [burnAmount]);

  const isValid = parseFloat(burnAmount) >= 5 && parseFloat(burnAmount) <= 8;

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
          {/* Mobile Warning - Enhanced with actionable guidance */}
          {(isMobile || !hasReefExtension) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: '1.5rem',
                padding: '1.25rem',
                background: 'rgba(255, 165, 0, 0.1)',
                border: '2px solid orange',
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}
            >
              <p style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'orange', fontSize: '1.1rem' }}>
                {isMobile ? '📱 Mobile Not Supported' : '⚠️ Reef Wallet Not Found'}
              </p>

              <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {isMobile ? (
                  <>
                    Please use a <strong>desktop browser</strong> (Chrome, Firefox, Brave) with the <strong>Reef Wallet Extension</strong> installed.
                  </>
                ) : (
                  <>
                    Please install the <strong>Reef Wallet Extension</strong> for your desktop browser.
                  </>
                )}
              </p>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {isMobile && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('✅ Link copied! Open on desktop browser.');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 165, 0, 0.2)',
                      border: '1px solid orange',
                      borderRadius: '6px',
                      color: 'orange',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}
                  >
                    📋 Copy Link
                  </button>
                )}

                {!hasReefExtension && (
                  <a
                    href="https://docs.reef.io/docs/users/extension/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(112, 67, 255, 0.2)',
                      border: '1px solid var(--reef-purple)',
                      borderRadius: '6px',
                      color: 'var(--reef-purple)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      display: 'inline-block'
                    }}
                  >
                    🦈 Install Reef Extension
                  </a>
                )}
              </div>

              <p style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.7, fontStyle: 'italic' }}>
                Mobile support is <strong>planned</strong> for future updates.
              </p>
            </motion.div>
          )}

          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Connect your wallet to start burning!
          </p>
          <motion.button
            className="btn btn-primary"
            onClick={connectWallet}
            disabled={isMobile || !hasReefExtension}
            whileHover={(!isMobile && hasReefExtension) ? { scale: 1.05 } : {}}
            whileTap={(!isMobile && hasReefExtension) ? { scale: 0.95 } : {}}
            style={{
              opacity: (isMobile || !hasReefExtension) ? 0.5 : 1,
              cursor: (isMobile || !hasReefExtension) ? 'not-allowed' : 'pointer'
            }}
          >
            🌊 Connect Wallet
          </motion.button>
          {(isMobile || !hasReefExtension) && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'orange' }}>
              ⚠️ Connection disabled on mobile/without extension
            </p>
          )}
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
              min="5"
              max="8"
              step="0.1"
              placeholder="5 - 8 REEF"
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              <span>Min: 5 REEF</span>
              <span>Max: 8 REEF</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            {[5, 6, 7, 8].map((amount) => (
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
              ⚠️ Amount must be between 5 and 8 REEF
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BurnCard;
