import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber, formatTimeRemaining } from '../utils/helpers';

const StatCard = ({ icon, label, value, color, delay }) => {
  return (
    <motion.div
      className="card stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      style={{
        borderColor: color
      }}
    >
      <motion.div
        style={{ fontSize: '3rem' }}
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {icon}
      </motion.div>
      <motion.div
        className="stat-value"
        style={{ color }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
      >
        {value}
      </motion.div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
};

const StatsPanel = ({ statistics, timeRemaining, loading }) => {
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="card stat-card"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div style={{ fontSize: '3rem' }}>⏳</div>
            <div className="stat-value">...</div>
            <div className="stat-label">Loading</div>
          </motion.div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: '🔥',
      label: 'Total REEF Burned',
      value: formatNumber(statistics.totalReefBurned || 0),
      color: 'var(--fire)',
      delay: 0
    },
    {
      icon: '💎',
      label: 'Current Prize Pool',
      value: formatNumber(statistics.prizePool || 0),
      color: 'var(--reef-pink)',
      delay: 0.1
    },
    {
      icon: '👥',
      label: 'Total Participants',
      value: statistics.totalParticipants || 0,
      color: 'var(--reef-blue)',
      delay: 0.2
    },
    {
      icon: '🏆',
      label: 'Total Winners',
      value: statistics.totalWinners || 0,
      color: 'var(--warning)',
      delay: 0.3
    },
    {
      icon: '⏰',
      label: 'Time Remaining',
      value: formatTimeRemaining(timeRemaining),
      color: 'var(--reef-purple)',
      delay: 0.4
    }
  ];

  return (
    <motion.div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </motion.div>
  );
};

export default StatsPanel;
