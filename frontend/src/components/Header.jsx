import React from 'react';
import { motion } from 'framer-motion';

const Header = ({ account, connectWallet, disconnectWallet }) => {
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
        padding: '1.5rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--card-border)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(26, 31, 58, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* Logo */}
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div style={{
          fontSize: '2rem',
          fontWeight: '900',
          background: 'linear-gradient(135deg, var(--reef-purple) 0%, var(--reef-pink) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🔥 REEF BURNER
        </div>
      </motion.div>

      {/* Wallet Connect Button */}
      <div>
        {!account ? (
          <motion.button
            className="btn btn-primary"
            onClick={connectWallet}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'relative',
              zIndex: 1
            }}
          >
            🌊 Connect Wallet
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <motion.div
              className="card"
              style={{
                padding: '0.8rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                border: '2px solid var(--reef-purple)'
              }}
              whileHover={{ scale: 1.02 }}
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
            </motion.div>
            <motion.button
              className="btn"
              onClick={disconnectWallet}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255, 67, 67, 0.1)',
                color: 'var(--danger)',
                border: '1px solid var(--danger)'
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
