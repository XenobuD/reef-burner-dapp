import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Provider, Signer } from '@reef-defi/evm-provider';
import { WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { formatReef, parseReef, calculateBonus, calculateTickets } from '../utils/helpers';

// Import contract ABI V2
import ReefBurnerABI from '../contracts/ReefBurnerABI.json';

// Contract address - will be set after deployment
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const NETWORK = import.meta.env.VITE_NETWORK || 'reef_mainnet';
const MAINNET_RPC = import.meta.env.VITE_MAINNET_RPC || 'wss://rpc.reefscan.com/ws';

export const useReefContract = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableAccounts, setAvailableAccounts] = useState([]); // All available wallet accounts
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

  // Check if mobile device
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      console.log('🔵 Starting wallet connection...');
      setLoading(true);

      // Check for Reef Wallet
      if (!window.injectedWeb3 || !window.injectedWeb3['reef']) {
        // Show different message based on device type
        if (isMobile()) {
          // On mobile, try to open Reef Wallet app with deep link
          const currentUrl = window.location.href;
          const reefWalletDeepLink = `reefwallet://browser?url=${encodeURIComponent(currentUrl)}`;

          // Try to open deep link
          window.location.href = reefWalletDeepLink;

          // Wait a bit to see if app opens
          setTimeout(() => {
            // If still here, show instructions
            const userChoice = confirm(
              '📱 Open in Reef Wallet App?\n\n' +
              'Click OK to open Reef Wallet app, or Cancel for instructions.'
            );

            if (!userChoice) {
              alert('📱 How to Connect on Mobile:\n\n' +
                    '1. Download Reef Wallet app:\n' +
                    '   • Google Play Store (Android)\n' +
                    '   • App Store (iOS)\n\n' +
                    '2. Open Reef Wallet app\n' +
                    '3. Look for DApp Browser or Browser icon\n' +
                    '4. Enter URL: reef-burner-dapp.vercel.app\n' +
                    '5. Connect your wallet in the app browser\n\n' +
                    'Alternative: Use MetaMask Mobile browser');
            }
          }, 1500);
        } else {
          alert('⚠️ Reef Wallet Extension Required!\n\n' +
                'Please install Reef Wallet extension:\n\n' +
                '1. Visit Chrome Web Store\n' +
                '2. Search for "Reef Wallet"\n' +
                '3. Click "Add to Chrome"\n' +
                '4. Refresh this page');
        }
        setLoading(false);
        return null;
      }

      console.log('✅ Reef Wallet detected');

      // Initialize Reef Provider first
      const reefProvider = await initProvider();
      if (!reefProvider) {
        throw new Error('Failed to initialize Reef Provider');
      }

      // Enable Reef Wallet specifically
      console.log('📢 Enabling Reef Wallet...');
      const reefExtension = window.injectedWeb3['reef'];
      await reefExtension.enable('Reef Burner dApp');
      console.log('✅ Reef Wallet enabled');

      // Get accounts directly from Reef extension
      console.log('📋 Getting accounts from Reef Wallet...');
      const allAccounts = await reefExtension.accounts.get();
      console.log('✅ Found accounts:', allAccounts);

      if (!allAccounts || allAccounts.length === 0) {
        throw new Error('No accounts found in Reef Wallet. Please create an account first.');
      }

      // Store all available accounts in compatible format
      const formattedAccounts = allAccounts.map(acc => ({
        address: acc.address,
        name: acc.name || 'Reef Account',
        source: 'reef'
      }));
      setAvailableAccounts(formattedAccounts);

      // Select the first account by default
      const selectedAccount = allAccounts[0];
      console.log('👤 Selected account:', selectedAccount);
      console.log(`📊 Total accounts available: ${allAccounts.length}`);

      // Create Reef Signer using the Reef extension's signer
      console.log('🔐 Creating Reef Signer with extension signer...');
      const signer = new Signer(
        reefProvider,
        selectedAccount.address,
        reefExtension.signer
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

  // Switch to different account
  const switchAccount = async (accountAddress) => {
    try {
      console.log('🔄 Switching to account:', accountAddress);
      setLoading(true);

      if (!provider) {
        throw new Error('Provider not initialized');
      }

      // Get Reef extension
      const reefExtension = window.injectedWeb3['reef'];
      if (!reefExtension) {
        throw new Error('Reef Wallet not found');
      }

      // Find the selected account
      const selectedAccount = availableAccounts.find(acc => acc.address === accountAddress);
      if (!selectedAccount) {
        throw new Error('Account not found');
      }

      // Create new signer with Reef extension
      console.log('🔐 Creating signer for new account...');
      const signer = new Signer(
        provider,
        selectedAccount.address,
        reefExtension.signer
      );

      // Get EVM address
      const evmAddress = await signer.getAddress();
      console.log('✅ Switched to EVM address:', evmAddress);

      setAccount(evmAddress);

      // Re-initialize contract with new signer
      if (CONTRACT_ADDRESS) {
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          ReefBurnerABI.abi,
          signer
        );
        setContract(contractInstance);
        console.log('✅ Contract re-initialized with new account!');
      }

      setLoading(false);
      return evmAddress;
    } catch (error) {
      console.error('❌ Error switching account:', error);
      alert('Failed to switch account: ' + error.message);
      setLoading(false);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setContract(null);
    setAvailableAccounts([]);
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
      console.log('🔥 Starting burn process...');
      console.log('Amount:', amount, 'REEF');

      const weiAmount = parseReef(amount);
      console.log('Wei amount:', weiAmount.toString());

      // Call burn function
      console.log('📤 Sending transaction to contract...');
      const tx = await contract.burn({
        value: weiAmount,
        gasLimit: 500000 // Adjust as needed
      });

      console.log('✅ Transaction sent! Hash:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed!', receipt);

      // Refresh data
      console.log('🔄 Refreshing contract data...');
      await Promise.all([
        fetchStatistics(),
        fetchParticipants(),
        fetchWinners(),
        fetchTimeRemaining()
      ]);

      console.log('🎉 Burn completed successfully!');
      return receipt;
    } catch (error) {
      console.error('❌ Error burning tokens:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data
      });
      throw error;
    }
  };

  // Trigger lottery manually (anyone can call if round ended)
  const triggerLottery = async () => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log('🎲 Triggering lottery...');

      // Call triggerRoundEnd function
      const tx = await contract.triggerRoundEnd({
        gasLimit: 800000 // Higher gas for lottery logic
      });

      console.log('Lottery trigger transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Lottery triggered!', receipt);

      // Refresh all data to show winner
      await Promise.all([
        fetchStatistics(),
        fetchParticipants(),
        fetchWinners(),
        fetchTimeRemaining()
      ]);

      return receipt;
    } catch (error) {
      console.error('Error triggering lottery:', error);

      // Check if it's "Round not finished yet" error
      if (error.message.includes('Round not finished')) {
        throw new Error('Lottery round is not finished yet. Wait for the timer to expire.');
      }

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

    // Refresh every 10 seconds (more frequent to catch round end quickly)
    const interval = setInterval(() => {
      fetchAllData();
    }, 10000);

    return () => clearInterval(interval);
  }, [contract, fetchAllData]);

  // Countdown timer - updates every second for smooth countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const countdown = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        // When countdown reaches 0, trigger a full data refresh
        if (newTime <= 0) {
          fetchAllData();
        }
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [timeRemaining, fetchAllData]);

  // Auto-trigger lottery when time expires (if connected)
  useEffect(() => {
    if (!contract || !account) return;
    if (timeRemaining !== 0) return;

    // Wait a bit after time expires to ensure blockchain is synced
    const autoTriggerTimer = setTimeout(async () => {
      try {
        console.log('⏰ Time expired! Auto-triggering lottery...');

        // Try to trigger the lottery automatically
        const tx = await contract.triggerRoundEnd({
          gasLimit: 800000
        });

        console.log('🎲 Auto-trigger transaction sent:', tx.hash);
        await tx.wait();
        console.log('✅ Lottery auto-triggered successfully!');

        // Refresh all data to show winner
        await fetchAllData();
      } catch (error) {
        console.log('⚠️ Auto-trigger failed (might be triggered by someone else):', error.message);
        // Refresh data anyway to see if someone else triggered it
        await fetchAllData();
      }
    }, 5000); // Wait 5 seconds after expiry to ensure time is truly up

    return () => clearTimeout(autoTriggerTimer);
  }, [timeRemaining, contract, account, fetchAllData]);

  // Note: Reef Provider doesn't support .on() for contract events
  // We use auto-refresh (every 10 seconds) + countdown timer (every 1 second) instead

  return {
    account,
    provider,
    contract,
    connectWallet,
    switchAccount,
    disconnectWallet,
    burnTokens,
    triggerLottery,
    statistics,
    participants,
    winners,
    timeRemaining,
    loading,
    availableAccounts
  };
};
