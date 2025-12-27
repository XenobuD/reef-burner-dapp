import React from 'react';
import { motion } from 'framer-motion';

const ContributorsBox = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      style={{
        marginTop: '2rem',
        background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)',
        border: '2px solid var(--card-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--card-border)'
      }}>
        <span style={{ fontSize: '1.8rem', marginRight: '0.75rem' }}>🙏</span>
        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: '600',
          margin: 0
        }}>
          Contributors
        </h2>
      </div>

      {/* Thank you message */}
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        lineHeight: '1.6'
      }}>
        Special thanks to community members who helped improve ReefBurner's security and user experience.
      </p>

      {/* Contributors List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* LaOnDa - Security */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{
            background: 'linear-gradient(135deg, rgba(112, 67, 255, 0.15) 0%, rgba(255, 67, 185, 0.1) 100%)',
            border: '1px solid rgba(112, 67, 255, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #7043ff 0%, #ff43b9 100%)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            flexShrink: 0
          }}>
            🛡️
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.05rem',
              fontWeight: '600',
              marginBottom: '0.25rem',
              color: 'var(--text-primary)'
            }}>
              LaOnDa
            </h3>
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              Security Research & V4 Planning
            </p>
          </div>
          <div style={{
            padding: '0.35rem 0.65rem',
            background: 'rgba(112, 67, 255, 0.25)',
            borderRadius: '6px',
            fontSize: '0.7rem',
            color: 'var(--reef-purple)',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            🏆 MVP
          </div>
        </motion.div>

        {/* Community - General */}
        <a
          href="https://t.me/Dan"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              flexShrink: 0
            }}>
              💬
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: '600',
                marginBottom: '0.25rem',
                color: 'var(--text-primary)'
              }}>
                Dan (Reef Community)
              </h3>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                margin: 0
              }}>
                Testing & Feedback
              </p>
            </div>
            <div style={{
              fontSize: '1.2rem',
              opacity: 0.6
            }}>
              📱
            </div>
          </motion.div>
        </a>

      </div>

      {/* Want to contribute CTA */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--card-border)',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.5rem'
        }}>
          Want to contribute?
        </p>
        <a
          href="https://github.com/XenobuD/reef-burner-dapp"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--reef-purple)',
            fontSize: '0.8rem',
            textDecoration: 'none',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <span>🌟</span>
          <span>Report bugs or suggest features</span>
        </a>
      </div>
    </motion.div>
  );
};

export default ContributorsBox;
