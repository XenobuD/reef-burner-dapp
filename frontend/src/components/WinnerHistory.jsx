import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber, formatDate } from '../utils/helpers';

const WinnerHistory = ({ winners, loading }) => {
  const formatAddress = (address) => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  const openReefScan = (address) => {
    window.open(`https://reef.subscan.io/account/${address}`, '_blank');
  };

  return (
    <motion.div
      className="card"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 67, 185, 0.1) 100%)',
        border: '2px solid var(--warning)'
      }}
    >
      <h2 style={{
        fontSize: '2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🏆 Winner History
      </h2>

      {/* Testing notice */}
      <div style={{
        background: 'rgba(255, 107, 53, 0.1)',
        border: '1px solid var(--warning)',
        borderRadius: '8px',
        padding: '0.75rem',
        marginBottom: '1rem',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        ⚠️ <strong>Testing Phase:</strong> Click winner addresses 🔗 to view on Subscan explorer. Full integration coming in V4!
      </div>

      <div style={{
        overflowX: 'auto',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: '3rem' }}
            >
              ⏳
            </motion.div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Loading winners...
            </p>
          </div>
        ) : winners.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'var(--text-secondary)'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎰</div>
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              No winners yet!
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              The first lottery will happen in 3 days!
            </p>
          </motion.div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 0.8rem'
          }}>
            <thead>
              <tr style={{
                borderBottom: '2px solid var(--card-border)'
              }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Round</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Winner</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Prize</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {winners.map((winner, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                    style={{
                      background: index === 0
                        ? 'linear-gradient(90deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 67, 185, 0.2) 100%)'
                        : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px'
                    }}
                  >
                    <td style={{
                      padding: '1.2rem',
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px'
                    }}>
                      <motion.div
                        style={{
                          background: index === 0
                            ? 'linear-gradient(135deg, var(--warning) 0%, var(--danger) 100%)'
                            : 'var(--reef-purple)',
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          display: 'inline-block',
                          fontWeight: '700'
                        }}
                        animate={index === 0 ? {
                          boxShadow: [
                            '0 0 20px rgba(255, 107, 53, 0.5)',
                            '0 0 40px rgba(255, 107, 53, 0.8)',
                            '0 0 20px rgba(255, 107, 53, 0.5)'
                          ]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Round #{winner.roundNumber}
                      </motion.div>
                    </td>
                    <td style={{ padding: '1.2rem' }}>
                      <div
                        onClick={() => openReefScan(winner.winnerAddress)}
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          color: 'var(--reef-pink)',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--warning)';
                          e.target.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--reef-pink)';
                          e.target.style.textDecoration = 'none';
                        }}
                        title="Click to view on Subscan"
                      >
                        {formatAddress(winner.winnerAddress)} 🔗
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                      <motion.div
                        style={{
                          fontSize: '1.3rem',
                          fontWeight: '700',
                          color: 'var(--warning)'
                        }}
                        animate={index === 0 ? {
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        💎 {formatNumber(winner.prizeAmount)} REEF
                      </motion.div>
                    </td>
                    <td style={{
                      padding: '1.2rem',
                      textAlign: 'right',
                      borderTopRightRadius: '12px',
                      borderBottomRightRadius: '12px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(winner.timestamp)}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Scrollbar styling */}
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: var(--warning);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: var(--danger);
        }
      `}</style>
    </motion.div>
  );
};

export default WinnerHistory;
