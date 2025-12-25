import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Provider, Signer } from '@reef-defi/evm-provider';
import { WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { formatReef, parseReef, calculateBonus, calculateTickets } from '../utils/helpers';

// Import contract ABI V2
import ReefBurnerABI from '../contracts/ReefBurnerABI.json';

// Contract address - V2 MAINNET
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x44392f3FCeb4bd22d8b4DDc4569aDBed3ec7d472';
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
  const [randomnessStatus, setRandomnessStatus] = useState({
    committed: false,
    commitBlock: 0,
    blocksUntilReveal: 0
  });

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

      // Store all available accounts
      setAvailableAccounts(allAccounts);

      // Select the first account by default
      const selectedAccount = allAccounts[0];
      console.log('👤 Selected account:', selectedAccount);
      console.log(`📊 Total accounts available: ${allAccounts.length}`);

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

  // Switch to different account
  const switchAccount = async (accountAddress) => {
    try {
      console.log('🔄 Switching to account:', accountAddress);
      setLoading(true);

      if (!provider) {
        throw new Error('Provider not initialized');
      }

      // Find the selected account
      const selectedAccount = availableAccounts.find(acc => acc.address === accountAddress);
      if (!selectedAccount) {
        throw new Error('Account not found');
      }

      // Get injector for the new account
      const injector = await web3FromAddress(selectedAccount.address);

      // Create new signer
      const signer = new Signer(
        provider,
        selectedAccount.address,
        injector.signer
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
      console.log('📋 Fetching participants for round:', roundNumber.toString());

      const participantAddresses = await contract.getRoundParticipants(roundNumber);
      console.log('👥 Participant addresses:', participantAddresses);

      const participantsData = await Promise.all(
        participantAddresses.map(async (address) => {
          const burnedAmount = await contract.userBurnedInRound(roundNumber, address);
          const amount = parseFloat(formatReef(burnedAmount));
          const bonus = calculateBonus(amount);
          const tickets = calculateTickets(amount);

          console.log(`💰 ${address}: ${amount} REEF, ${tickets} tickets`);

          return {
            address,
            amount: amount.toFixed(2),
            bonus,
            tickets
          };
        })
      );

      console.log('✅ Total participants found:', participantsData.length);
      setParticipants(participantsData);
    } catch (error) {
      console.error('❌ Error fetching participants:', error);
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

  // Fetch randomness status
  const fetchRandomnessStatus = useCallback(async () => {
    if (!contract) return;

    try {
      const status = await contract.getRandomnessStatus();
      setRandomnessStatus({
        committed: status.committed,
        commitBlock: status.commitBlock.toNumber(),
        blocksUntilReveal: status.blocksUntilReveal.toNumber()
      });
    } catch (error) {
      console.error('Error fetching randomness status:', error);
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

  // Trigger lottery manually (anyone can call if round ended)
  const triggerLottery = async () => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log('🎲 Starting 2-step lottery trigger process...');

      // STEP 1: Commit randomness
      try {
        console.log('📝 Step 1/2: Committing randomness...');
        const tx1 = await contract.triggerRoundEnd({
          gasLimit: 500000
        });
        console.log('Transaction 1 sent:', tx1.hash);
        await tx1.wait();
        console.log('✅ Randomness committed!');
      } catch (error) {
        console.log('⚠️ Randomness already committed:', error.message);
      }

      // STEP 2: Wait 3 blocks then reveal winner
      console.log('⏳ Waiting 3 blocks for randomness to mature...');
      console.log('(This will take ~50 seconds - please wait!)');

      // Wait ~50 seconds (Reef has ~15 second block time, 3 blocks = ~45 seconds + buffer)
      await new Promise(resolve => setTimeout(resolve, 50000));

      console.log('🎲 Step 2/2: Revealing winner...');
      const tx2 = await contract.revealWinner({
        gasLimit: 800000
      });
      console.log('Transaction 2 sent:', tx2.hash);
      const receipt = await tx2.wait();
      console.log('✅ Winner revealed!', receipt);

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
        fetchTimeRemaining(),
        fetchRandomnessStatus()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [contract, fetchStatistics, fetchParticipants, fetchWinners, fetchTimeRemaining, fetchRandomnessStatus]);

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

        // STEP 1: Commit randomness (if not already committed)
        try {
          const tx1 = await contract.triggerRoundEnd({
            gasLimit: 500000
          });
          console.log('📝 Step 1: Randomness committed:', tx1.hash);
          await tx1.wait();
          console.log('✅ Randomness committed successfully!');
        } catch (error) {
          console.log('⚠️ Randomness already committed or failed:', error.message);
        }

        // STEP 2: Wait 3 blocks then reveal winner
        console.log('⏳ Waiting 3 blocks for randomness reveal...');

        // Wait ~45 seconds (Reef has ~15 second block time, so 3 blocks = ~45 seconds)
        await new Promise(resolve => setTimeout(resolve, 50000));

        console.log('🎲 Step 2: Revealing winner...');
        const tx2 = await contract.revealWinner({
          gasLimit: 800000
        });
        console.log('🎲 Winner reveal transaction sent:', tx2.hash);
        await tx2.wait();
        console.log('✅ Winner revealed successfully!');

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

  // Manual reveal winner (for when randomness is committed but winner not revealed)
  const revealWinner = async () => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log('🎲 Revealing winner manually...');

      const tx = await contract.revealWinner({
        gasLimit: 800000
      });

      console.log('Reveal transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ Winner revealed!', receipt);

      // Refresh all data
      await fetchAllData();

      return receipt;
    } catch (error) {
      console.error('Error revealing winner:', error);
      throw error;
    }
  };

  return {
    account,
    provider,
    contract,
    connectWallet,
    switchAccount,
    disconnectWallet,
    burnTokens,
    triggerLottery,
    revealWinner,
    statistics,
    participants,
    winners,
    timeRemaining,
    randomnessStatus,
    loading,
    availableAccounts
  };
};
