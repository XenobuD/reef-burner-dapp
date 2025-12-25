import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ account, connectWallet, switchAccount, disconnectWallet, availableAccounts, onAboutClick }) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--card-border)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(26, 31, 58, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap',
        gap: '1rem'
      }}
    >
      {/* Logo */}
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flex: '1 1 auto',
          minWidth: '0'
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div style={{
          fontSize: 'clamp(1.2rem, 5vw, 2rem)',
          fontWeight: '900',
          background: 'linear-gradient(135deg, var(--reef-purple) 0%, var(--reef-pink) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          🔥 REEF BURNER
        </div>
      </motion.div>

      {/* About Button - Mobile responsive */}
      <motion.button
        className="btn"
        onClick={onAboutClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'rgba(112, 67, 255, 0.1)',
          border: '1px solid var(--reef-purple)',
          padding: '0.5rem 0.8rem',
          fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{ display: 'inline' }}>📖</span>
        <span style={{ display: 'inline', marginLeft: '0.3rem' }}>About</span>
      </motion.button>

      {/* Wallet Connect Button */}
      <div style={{ flex: '0 0 auto' }}>
        {!account ? (
          <motion.button
            className="btn btn-primary"
            onClick={connectWallet}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '0.6rem 1rem',
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              whiteSpace: 'nowrap'
            }}
          >
            🌊 Connect
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              position: 'relative'
            }}
          >
            {/* Current Account Display */}
            <motion.div
              className="card"
              style={{
                padding: '0.8rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                border: '2px solid var(--reef-purple)',
                cursor: availableAccounts && availableAccounts.length > 1 ? 'pointer' : 'default',
                position: 'relative'
              }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                if (availableAccounts && availableAccounts.length > 1) {
                  setShowAccountDropdown(!showAccountDropdown);
                }
              }}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {formatAddress(account)}
              </span>
              {availableAccounts && availableAccounts.length > 1 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>
                  ▼
                </span>
              )}
            </motion.div>

            {/* Account Dropdown */}
            <AnimatePresence>
              {showAccountDropdown && availableAccounts && availableAccounts.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: '120px',
                    marginTop: '0.5rem',
                    minWidth: '280px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    background: 'rgba(26, 31, 58, 0.98)',
                    border: '2px solid var(--reef-purple)',
                    boxShadow: '0 8px 32px rgba(112, 67, 255, 0.3)'
                  }}
                >
                  <div style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--card-border)'
                  }}>
                    Switch Account ({availableAccounts.length} available)
                  </div>
                  {availableAccounts.map((acc, index) => (
                    <motion.div
                      key={acc.address}
                      onClick={async () => {
                        setShowAccountDropdown(false);
                        await switchAccount(acc.address);
                      }}
                      whileHover={{ backgroundColor: 'rgba(112, 67, 255, 0.1)' }}
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        borderBottom: index < availableAccounts.length - 1 ? '1px solid var(--card-border)' : 'none'
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>
                        {acc.meta?.name || `Account ${index + 1}`}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace'
                      }}>
                        {acc.address}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Disconnect Button */}
            <motion.button
              className="btn"
              onClick={disconnectWallet}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255, 67, 67, 0.1)',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
                padding: '0.6rem 1rem',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                whiteSpace: 'nowrap'
              }}
            >
              Disconnect
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
