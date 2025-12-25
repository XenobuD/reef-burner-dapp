import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ParticipantsList = ({ participants, currentAccount, loading }) => {
  const formatAddress = (address) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  return (
    <motion.div
      className="card"
      style={{
        height: '100%',
        maxHeight: '600px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <h2 style={{
        fontSize: '1.8rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        👥 Current Round Participants
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: 'var(--reef-purple)',
            borderRadius: '20px',
            padding: '0.2rem 0.8rem',
            fontSize: '1rem'
          }}
        >
          {participants.length}
        </motion.span>
      </h2>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: '0.5rem'
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
              Loading participants...
            </p>
          </div>
        ) : participants.length === 0 ? (
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
              No participants yet!
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Be the first to burn and enter the lottery!
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {participants.map((participant, index) => {
                const isCurrentUser = participant.address.toLowerCase() === currentAccount?.toLowerCase();
                return (
                  <motion.div
                    key={participant.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    style={{
                      background: isCurrentUser
                        ? 'linear-gradient(135deg, rgba(112, 67, 255, 0.2) 0%, rgba(255, 67, 185, 0.2) 100%)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isCurrentUser ? 'var(--reef-purple)' : 'var(--card-border)'}`,
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isCurrentUser
                            ? 'linear-gradient(135deg, var(--reef-purple) 0%, var(--reef-pink) 100%)'
                            : 'linear-gradient(135deg, var(--reef-blue) 0%, var(--reef-purple) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          color: 'white'
                        }}
                      >
                        {index + 1}
                      </motion.div>
                      <div>
                        <div style={{
                          fontFamily: 'monospace',
                          fontWeight: '600',
                          fontSize: '1rem'
                        }}>
                          {formatAddress(participant.address)}
                          {isCurrentUser && (
                            <motion.span
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              style={{
                                marginLeft: '0.5rem',
                                color: 'var(--reef-pink)',
                                fontSize: '0.9rem'
                              }}
                            >
                              (YOU)
                            </motion.span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.2rem'
                        }}>
                          Burned: {participant.amount} REEF
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end'
                    }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: participant.bonus > 0 ? 'var(--warning)' : 'var(--text-secondary)'
                      }}>
                        {participant.bonus > 0 ? (
                          <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            ⭐ +{participant.bonus}%
                          </motion.span>
                        ) : (
                          'Base odds'
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.2rem'
                      }}>
                        {participant.tickets || 100} tickets
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Scrollbar styling */}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: var(--reef-purple);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: var(--reef-pink);
        }
      `}</style>
    </motion.div>
  );
};

export default ParticipantsList;
