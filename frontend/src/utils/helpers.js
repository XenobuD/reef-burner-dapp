import { ethers } from 'ethers';

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

/**
 * Format REEF amount from wei
 */
export const formatReef = (weiAmount) => {
  if (!weiAmount) return '0';
  try {
    return ethers.utils.formatEther(weiAmount);
  } catch (error) {
    console.error('Error formatting REEF:', error);
    return '0';
  }
};

/**
 * Parse REEF amount to wei
 */
export const parseReef = (reefAmount) => {
  try {
    return ethers.utils.parseEther(reefAmount.toString());
  } catch (error) {
    console.error('Error parsing REEF:', error);
    return ethers.BigNumber.from(0);
  }
};

/**
 * Format time remaining
 */
export const formatTimeRemaining = (seconds) => {
  if (!seconds || seconds <= 0) return 'Round Ended';

  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Format date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Shorten address
 */
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Calculate bonus percentage based on amount
 * TESTING PHASE: 5-8 REEF (V4 production will use 950-1500 REEF)
 */
export const calculateBonus = (amount) => {
  if (amount >= 8) return 3;
  if (amount >= 7) return 2;
  if (amount >= 6) return 1;
  return 0;
};

/**
 * Calculate tickets based on amount
 */
export const calculateTickets = (amount) => {
  const baseTickets = 100;
  const bonus = calculateBonus(amount);
  return baseTickets + bonus;
};
