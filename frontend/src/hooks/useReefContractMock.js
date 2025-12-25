import { useState, useEffect, useCallback } from 'react';

/**
 * MOCK VERSION - For local testing without blockchain
 * This simulates the contract functionality with fake data
 */

export const useReefContractMock = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock statistics
  const [statistics, setStatistics] = useState({
    totalParticipants: 156,
    totalWinners: 12,
    totalReefBurned: 245678.50,
    prizePool: 45234.20,
    currentRoundParticipants: 23
  });

  // Mock participants
  const [participants, setParticipants] = useState([
    { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4', amount: '1500.00', bonus: 3, tickets: 103 },
    { address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', amount: '1200.00', bonus: 2, tickets: 102 },
    { address: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0', amount: '1050.00', bonus: 1, tickets: 101 },
    { address: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E', amount: '950.00', bonus: 0, tickets: 100 },
    { address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30', amount: '1500.00', bonus: 3, tickets: 103 },
  ]);

  // Mock winners
  const [winners, setWinners] = useState([
    {
      winnerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4',
      prizeAmount: '42150.50',
      roundNumber: 12,
      timestamp: Math.floor(Date.now() / 1000) - 86400 // Yesterday
    },
    {
      winnerAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      prizeAmount: '38920.30',
      roundNumber: 11,
      timestamp: Math.floor(Date.now() / 1000) - 259200 // 3 days ago
    },
    {
      winnerAddress: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      prizeAmount: '35600.00',
      roundNumber: 10,
      timestamp: Math.floor(Date.now() / 1000) - 518400 // 6 days ago
    }
  ]);

  // Time remaining (2 days, 5 hours, 30 minutes in seconds)
  const [timeRemaining, setTimeRemaining] = useState(189000);

  // Mock wallet connection
  const connectWallet = async () => {
    setLoading(true);

    // Simulate async wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if Reef Wallet or any wallet is installed
    if (!window.ethereum) {
      alert('⚠️ No wallet detected!\n\nFor DEMO purposes, we\'ll use a mock address.\n\nTo use the real dApp, please install Reef Extension Wallet from:\nhttps://reef.io/wallet');

      // Use mock address for demo
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4';
      setAccount(mockAddress);
      setLoading(false);
      return mockAddress;
    }

    try {
      // Try to connect to real wallet
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        console.log('✅ Connected to wallet:', accounts[0]);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);

      // Fallback to mock address
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4';
      setAccount(mockAddress);
    }

    setLoading(false);
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    console.log('🔌 Wallet disconnected');
  };

  // Mock burn function
  const burnTokens = async (amount) => {
    console.log('🔥 MOCK: Burning', amount, 'REEF');

    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add current user to participants if connected
    if (account) {
      const bonus = amount >= 1500 ? 3 : amount >= 1200 ? 2 : amount >= 1050 ? 1 : 0;
      const tickets = 100 + bonus;

      const newParticipant = {
        address: account,
        amount: parseFloat(amount).toFixed(2),
        bonus,
        tickets
      };

      // Check if already in list
      const exists = participants.some(p => p.address.toLowerCase() === account.toLowerCase());

      if (!exists) {
        setParticipants(prev => [newParticipant, ...prev]);
        setStatistics(prev => ({
          ...prev,
          currentRoundParticipants: prev.currentRoundParticipants + 1,
          totalReefBurned: prev.totalReefBurned + parseFloat(amount),
          prizePool: prev.prizePool + (parseFloat(amount) * 0.27)
        }));
      }
    }

    console.log('✅ MOCK: Burn successful!');
    alert(`✅ MOCK TRANSACTION SUCCESSFUL!\n\n🔥 Burned Forever: ${(amount * 0.65).toFixed(2)} REEF\n💎 Added to Prize Pool: ${(amount * 0.27).toFixed(2)} REEF\n\n⚠️ This is a DEMO - no real transaction was made!`);
  };

  // Auto-update time remaining
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    account,
    provider: null,
    contract: null,
    connectWallet,
    disconnectWallet,
    burnTokens,
    statistics,
    participants,
    winners,
    timeRemaining,
    loading
  };
};
