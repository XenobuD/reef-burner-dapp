import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Provider } from '@reef-defi/evm-provider';
import { formatReef, parseReef, calculateBonus, calculateTickets } from '../utils/helpers';

// Import contract ABI (you'll need to copy this from the compiled contract)
import ReefBurnerABI from '../contracts/ReefBurner.json';

// Contract address - will be set after deployment
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const NETWORK = import.meta.env.VITE_NETWORK || 'reef_mainnet';
const MAINNET_RPC = import.meta.env.VITE_MAINNET_RPC || 'wss://rpc.reefscan.com/ws';

export const useReefContract = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalParticipants: 0,
    totalWinners: 0,
    totalReefBurned: 0,
    prizePool: 0,
    currentRoundParticipants: 0
  });
  const [participants, setParticipants] = useState([]);
  const [winners, setWinners] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Wait for Reef Wallet extension to inject into page
  const waitForReefWallet = async (maxAttempts = 10, delayMs = 300) => {
    for (let i = 0; i < maxAttempts; i++) {
      console.log(`🔍 Attempt ${i + 1}/${maxAttempts}: Checking for Reef Wallet...`);

      if (window.injectedWeb3 && window.injectedWeb3['reef']) {
        console.log('✅ Reef Wallet found!');
        return true;
      }

      console.log(`⏳ Waiting ${delayMs}ms before next check...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    console.error('❌ Reef Wallet not detected after all attempts');
    return false;
  };

  // Initialize provider (Reef Mainnet)
  const initProvider = useCallback(async () => {
    try {
      // Wait for Reef Wallet extension to be injected
      const walletFound = await waitForReefWallet();

      if (!walletFound) {
        console.error('Reef Wallet extension not detected. Please install Reef Wallet.');
        return null;
      }

      const provider = new Provider({
        provider: window.injectedWeb3['reef']
      });

      await provider.api.isReady;
      setProvider(provider);
      return provider;
    } catch (error) {
      console.error('Error initializing provider:', error);
      return null;
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      console.log('🔵 Starting wallet connection...');
      setLoading(true);

      const provider = await initProvider();
      if (!provider) {
        alert('⚠️ Reef Wallet extension not detected!\n\nPlease install Reef Wallet from:\nhttps://chrome.google.com/webstore/detail/reef-wallet/mjgkpalnahacmhkikiommfiomhjipgjn');
        setLoading(false);
        return null;
      }

      console.log('✅ Provider initialized');

      // Request account access from Reef Wallet
      const injectedWeb3 = window.injectedWeb3['reef'];
      console.log('📢 Requesting account access...');
      await injectedWeb3.enable('Reef Burner dApp');

      console.log('🔍 Getting accounts...');
      // Get accounts
      const accounts = await injectedWeb3.accounts.get();
      console.log('Accounts found:', accounts);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Use first account
      const selectedAccount = accounts[0];
      const address = selectedAccount.address;
      console.log('✅ Using account:', address);

      // Create signer from selected account
      const signer = provider.getSigner(address);
      setAccount(address);

      // Initialize contract
      if (CONTRACT_ADDRESS) {
        console.log('📄 Initializing contract at:', CONTRACT_ADDRESS);
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          ReefBurnerABI.abi,
          signer
        );
        setContract(contractInstance);
        console.log('✅ Contract initialized!');
      } else {
        console.warn('⚠️ No contract address set!');
      }

      setLoading(false);
      console.log('🎉 Wallet connected successfully!');
      return address;
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
      setLoading(false);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
  };

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!contract) return;

    try {
      const stats = await contract.getStatistics();
      setStatistics({
        totalParticipants: stats.participants.toNumber(),
        totalWinners: stats.winnersCount.toNumber(),
        totalReefBurned: formatReef(stats.reefBurned),
        prizePool: formatReef(stats.currentPrize),
        currentRoundParticipants: stats.currentRoundParticipantsCount.toNumber()
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [contract]);

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    if (!contract) return;

    try {
      const roundNumber = await contract.roundNumber();
      const participantAddresses = await contract.getRoundParticipants(roundNumber);

      const participantsData = await Promise.all(
        participantAddresses.map(async (address) => {
          const burnedAmount = await contract.userBurnedInRound(roundNumber, address);
          const amount = parseFloat(formatReef(burnedAmount));
          const bonus = calculateBonus(amount);
          const tickets = calculateTickets(amount);

          return {
            address,
            amount: amount.toFixed(2),
            bonus,
            tickets
          };
        })
      );

      setParticipants(participantsData);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  }, [contract]);

  // Fetch winners
  const fetchWinners = useCallback(async () => {
    if (!contract) return;

    try {
      const winnersCount = await contract.getWinnersCount();
      const count = winnersCount.toNumber();

      if (count === 0) {
        setWinners([]);
        return;
      }

      const winnersData = await Promise.all(
        Array.from({ length: Math.min(count, 10) }, async (_, i) => {
          const index = count - 1 - i; // Get latest winners first
          const winner = await contract.getWinner(index);
          return {
            winnerAddress: winner.winnerAddress,
            prizeAmount: formatReef(winner.prizeAmount),
            roundNumber: winner.roundNum.toNumber(),
            timestamp: winner.timestamp.toNumber()
          };
        })
      );

      setWinners(winnersData);
    } catch (error) {
      console.error('Error fetching winners:', error);
    }
  }, [contract]);

  // Fetch time remaining
  const fetchTimeRemaining = useCallback(async () => {
    if (!contract) return;

    try {
      const remaining = await contract.getTimeRemainingInRound();
      setTimeRemaining(remaining.toNumber());
    } catch (error) {
      console.error('Error fetching time remaining:', error);
    }
  }, [contract]);

  // Burn tokens
  const burnTokens = async (amount) => {
    if (!contract || !amount) {
      throw new Error('Contract not initialized or invalid amount');
    }

    try {
      const weiAmount = parseReef(amount);

      // Call burn function
      const tx = await contract.burn({
        value: weiAmount,
        gasLimit: 500000 // Adjust as needed
      });

      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Refresh data
      await Promise.all([
        fetchStatistics(),
        fetchParticipants(),
        fetchWinners(),
        fetchTimeRemaining()
      ]);

      return receipt;
    } catch (error) {
      console.error('Error burning tokens:', error);
      throw error;
    }
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!contract) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchStatistics(),
        fetchParticipants(),
        fetchWinners(),
        fetchTimeRemaining()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [contract, fetchStatistics, fetchParticipants, fetchWinners, fetchTimeRemaining]);

  // Auto-refresh data
  useEffect(() => {
    if (!contract) return;

    fetchAllData();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [contract, fetchAllData]);

  // Listen to contract events
  useEffect(() => {
    if (!contract) return;

    // Listen for Burned events
    contract.on('Burned', (burner, amount, burnedAmount, prizeAmount, creatorAmount, roundNumber) => {
      console.log('Burn event:', { burner, amount: formatReef(amount) });
      fetchAllData();
    });

    // Listen for WinnerSelected events
    contract.on('WinnerSelected', (winner, prizeAmount, roundNumber, timestamp) => {
      console.log('Winner selected:', { winner, prize: formatReef(prizeAmount) });
      fetchAllData();
    });

    return () => {
      contract.removeAllListeners();
    };
  }, [contract, fetchAllData]);

  return {
    account,
    provider,
    contract,
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
