import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Provider, Signer } from '@reef-defi/evm-provider';
import { WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
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

      console.log('📡 Connecting to Reef RPC:', MAINNET_RPC);

      // Create WebSocket provider for Reef Chain
      const wsProvider = new WsProvider(MAINNET_RPC);

      // Create Reef Provider with the WebSocket provider
      const reefProvider = new Provider({
        provider: wsProvider
      });

      console.log('⏳ Waiting for API to be ready...');
      await reefProvider.api.isReady;
      console.log('✅ Reef API ready!');

      setProvider(reefProvider);
      return reefProvider;
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

      // Check for Reef Wallet
      if (!window.injectedWeb3 || !window.injectedWeb3['reef']) {
        alert('⚠️ Reef Wallet extension not detected!\n\nPlease install Reef Wallet from Chrome Web Store');
        setLoading(false);
        return null;
      }

      console.log('✅ Reef Wallet detected');

      // Initialize Reef Provider first
      const reefProvider = await initProvider();
      if (!reefProvider) {
        throw new Error('Failed to initialize Reef Provider');
      }

      // Use Polkadot extension API to connect to Reef Wallet
      console.log('📢 Enabling Polkadot extensions...');
      const extensions = await web3Enable('Reef Burner dApp');
      console.log('✅ Extensions enabled:', extensions);

      if (extensions.length === 0) {
        throw new Error('No Polkadot extension found. Please install Reef Wallet.');
      }

      // Get all accounts from Reef Wallet
      console.log('📋 Getting accounts...');
      const allAccounts = await web3Accounts();
      console.log('✅ Found accounts:', allAccounts);

      if (allAccounts.length === 0) {
        throw new Error('No accounts found in Reef Wallet. Please create an account first.');
      }

      // Select the first account
      const selectedAccount = allAccounts[0];
      console.log('👤 Selected account:', selectedAccount);

      // Get the injector (signer) for this account
      console.log('🔐 Getting injector for account...');
      const injector = await web3FromAddress(selectedAccount.address);
      console.log('✅ Got injector:', injector);

      // Create Reef Signer using the account address and injector
      console.log('🔐 Creating Reef Signer...');
      const signer = new Signer(
        reefProvider,
        selectedAccount.address,
        injector.signer
      );

      // Check if account is claimed (has EVM address)
      const isClaimed = await signer.isClaimed();
      console.log('🔍 Account claimed?', isClaimed);

      if (!isClaimed) {
        throw new Error('EVM account not claimed. Please claim your EVM address in Reef Wallet first.');
      }

      // Get EVM address
      const evmAddress = await signer.getAddress();
      console.log('✅ Got EVM address:', evmAddress);

      setAccount(evmAddress);

      // Initialize contract with the signer
      if (CONTRACT_ADDRESS) {
        console.log('📄 Initializing contract at:', CONTRACT_ADDRESS);
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          ReefBurnerABI.abi,
          signer
        );
        setContract(contractInstance);
        console.log('✅ Contract initialized with signer!');
      } else {
        console.warn('⚠️ No contract address set!');
      }

      setLoading(false);
      console.log('🎉 Wallet connected successfully!');
      return evmAddress;
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

  // Note: Reef Provider doesn't support .on() for contract events
  // We'll rely on auto-refresh (every 30 seconds) instead

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
