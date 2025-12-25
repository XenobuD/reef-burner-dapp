# 🚀 ReefBurner V2 - Deployment Guide

## Step 1: Configure Hardhat

### Add Your Seed Phrase

**⚠️ IMPORTANT: NEVER commit your seed phrase to Git!**

Edit `hardhat.config.js`:

```javascript
reef_mainnet: {
  url: "https://rpc.reefscan.com",
  seeds: {
    account1: "your twelve word seed phrase goes here"
  },
  scanUrl: "https://reefscan.com"
}
```

### Or Use Environment Variable (Safer):

Create `.env` file:
```
REEF_SEED_PHRASE="your twelve word seed phrase goes here"
```

Then update `hardhat.config.js`:
```javascript
require('dotenv').config();

reef_mainnet: {
  url: "https://rpc.reefscan.com",
  seeds: {
    account1: process.env.REEF_SEED_PHRASE
  },
  scanUrl: "https://reefscan.com"
}
```

**Make sure `.env` is in `.gitignore`!**

---

## Step 2: Set Creator Wallet

Edit `scripts/deploy-v2.js` line 17:

```javascript
// ⚠️ CHANGE THIS to your actual creator wallet address
const CREATOR_WALLET = "0xYourCreatorWalletAddress";
```

**IMPORTANT:**
- This address will receive 8% of all burns FOREVER
- It's IMMUTABLE - cannot be changed after deployment
- Double-check this address before deploying!

---

## Step 3: Deploy to Mainnet

```bash
cd "d:\Reef Chain Project\reef-burner-dapp"
npx hardhat run scripts/deploy-v2.js --network reef_mainnet
```

You'll see output like:
```
🚀 Starting ReefBurner V2 deployment...
Deploying with account: 0x...
Account balance: 1000 REEF

⚠️  Creator wallet (IMMUTABLE): 0x...
⚠️  This address will receive 8% of all burns FOREVER!

📦 Deploying ReefBurnerV2 contract...
⏳ Waiting for deployment transaction...
✅ ReefBurnerV2 deployed to: 0xNEW_CONTRACT_ADDRESS

=== Initial Contract State ===
...

💾 Deployment info saved to: ./deployments/reef_mainnet-v2.json
🎉 Deployment complete!
```

**SAVE THE CONTRACT ADDRESS!** You'll need it for frontend.

---

## Step 4: Verify on ReefScan

```bash
npx hardhat verify --network reef_mainnet <CONTRACT_ADDRESS> <CREATOR_WALLET>
```

Example:
```bash
npx hardhat verify --network reef_mainnet 0xYourContractAddress 0xYourCreatorWallet
```

---

## Step 5: Update Frontend

### 5.1 Update Contract Address

Edit `frontend/src/config.js` or wherever you store config:

```javascript
export const CONTRACT_ADDRESS = "0xYourNewV2ContractAddress";
```

### 5.2 Copy New ABI

```bash
cp contracts/artifacts/contracts/ReefBurnerV2.sol/ReefBurnerV2.json frontend/src/contracts/ReefBurnerABI.json
```

### 5.3 Update useReefContract Hook

Add new V2 functions to `frontend/src/hooks/useReefContract.js`:

```javascript
// Get unclaimed prize info
const getUnclaimedPrizeInfo = useCallback(async () => {
  if (!contract) return null;

  try {
    const info = await contract.getUnclaimedPrizeInfo();
    return {
      amount: ethers.utils.formatEther(info.amount),
      winner: info.winner,
      claimableUntilRound: info.claimableUntilRound.toNumber(),
      roundsRemaining: info.roundsRemaining.toNumber()
    };
  } catch (error) {
    console.error('Error getting unclaimed prize info:', error);
    return null;
  }
}, [contract]);

// Claim prize for winner
const claimPrize = useCallback(async () => {
  if (!contract) {
    throw new Error('Contract not initialized');
  }

  try {
    const tx = await contract.claimPrize({
      gasLimit: 300000
    });

    console.log('Claim transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Prize claimed successfully:', receipt);

    // Refresh data
    await fetchAllData();
    return receipt;
  } catch (error) {
    console.error('Error claiming prize:', error);
    throw error;
  }
}, [contract, fetchAllData]);

// Return new functions
return {
  // ... existing returns
  getUnclaimedPrizeInfo,
  claimPrize
};
```

### 5.4 Add Unclaimed Prize UI

Create `frontend/src/components/UnclaimedPrizeCard.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const UnclaimedPrizeCard = ({
  unclaimedPrizeInfo,
  onClaimPrize,
  account
}) => {
  const [isClaiming, setIsClaiming] = useState(false);

  if (!unclaimedPrizeInfo || parseFloat(unclaimedPrizeInfo.amount) === 0) {
    return null;
  }

  const handleClaim = async () => {
    if (!account) {
      alert('⚠️ Please connect your wallet first!');
      return;
    }

    try {
      setIsClaiming(true);
      await onClaimPrize();
      alert('✅ Prize claimed successfully for winner!');
    } catch (error) {
      console.error('Claim failed:', error);
      alert(`❌ Failed to claim prize: ${error.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  const isUrgent = unclaimedPrizeInfo.roundsRemaining <= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        background: isUrgent
          ? 'linear-gradient(135deg, rgba(255, 67, 54, 0.1), rgba(255, 165, 0, 0.1))'
          : 'linear-gradient(135deg, rgba(112, 67, 255, 0.1), rgba(255, 67, 185, 0.1))',
        border: isUrgent ? '2px solid #ff4336' : '2px solid var(--reef-purple)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem'
      }}
    >
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: isUrgent ? '#ff4336' : 'var(--reef-purple)'
      }}>
        {isUrgent ? '⚠️ URGENT: ' : '🎁 '} Unclaimed Prize!
      </h3>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Winner:</strong> {unclaimedPrizeInfo.winner}
        </div>
        <div style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--reef-pink)',
          margin: '1rem 0'
        }}>
          {unclaimedPrizeInfo.amount} REEF
        </div>
        <div style={{
          fontSize: '1.1rem',
          color: isUrgent ? '#ff4336' : 'var(--text-secondary)'
        }}>
          Rounds Remaining: <strong>{unclaimedPrizeInfo.roundsRemaining}</strong> / 10
        </div>
      </div>

      {isUrgent && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            padding: '1rem',
            background: 'rgba(255, 67, 54, 0.2)',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}
        >
          <p style={{ color: '#ff4336', fontWeight: '600', margin: 0 }}>
            ⚠️ Will BURN in {unclaimedPrizeInfo.roundsRemaining} round{unclaimedPrizeInfo.roundsRemaining === 1 ? '' : 's'}!
          </p>
        </motion.div>
      )}

      <motion.button
        className="btn btn-primary"
        onClick={handleClaim}
        disabled={isClaiming}
        whileHover={!isClaiming ? { scale: 1.05 } : {}}
        whileTap={!isClaiming ? { scale: 0.95 } : {}}
        style={{
          width: '100%',
          padding: '1rem',
          fontSize: '1.1rem',
          fontWeight: '600',
          background: isUrgent
            ? 'linear-gradient(135deg, #ff4336, #ff6b35)'
            : 'linear-gradient(135deg, var(--reef-purple), var(--reef-pink))',
          cursor: isClaiming ? 'not-allowed' : 'pointer',
          opacity: isClaiming ? 0.6 : 1
        }}
      >
        {isClaiming ? '🔄 Claiming...' : '🎁 Claim Prize for Winner'}
      </motion.button>

      <p style={{
        marginTop: '1rem',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        Anyone can trigger this to help the winner receive their prize!
      </p>
    </motion.div>
  );
};

export default UnclaimedPrizeCard;
```

### 5.5 Add to App.jsx

```javascript
import UnclaimedPrizeCard from './components/UnclaimedPrizeCard';

function App() {
  const [unclaimedPrizeInfo, setUnclaimedPrizeInfo] = useState(null);

  const {
    // ... existing
    getUnclaimedPrizeInfo,
    claimPrize
  } = useReefContract();

  // Fetch unclaimed prize info
  useEffect(() => {
    const fetchUnclaimed = async () => {
      const info = await getUnclaimedPrizeInfo();
      setUnclaimedPrizeInfo(info);
    };

    if (contract) {
      fetchUnclaimed();
      const interval = setInterval(fetchUnclaimed, 10000); // Every 10s
      return () => clearInterval(interval);
    }
  }, [contract, getUnclaimedPrizeInfo]);

  return (
    <div className="App">
      {/* ... existing code ... */}

      {/* Add UnclaimedPrizeCard */}
      <UnclaimedPrizeCard
        unclaimedPrizeInfo={unclaimedPrizeInfo}
        onClaimPrize={claimPrize}
        account={account}
      />

      {/* ... rest of app ... */}
    </div>
  );
}
```

---

## Step 6: Test Everything

### Test Checklist:

- [ ] Connect wallet
- [ ] Burn 5-8 REEF
- [ ] Wait for round to end
- [ ] See winner selected
- [ ] See unclaimed prize appear
- [ ] Click "Claim Prize" button
- [ ] Verify winner received prize
- [ ] Test with invalid amounts (should reject)
- [ ] Test with >500 participants (should reject when full)

---

## Step 7: Deploy Frontend

```bash
cd frontend
npm run build
vercel --prod
```

Update your domain to point to new deployment.

---

## Step 8: Announce to Community

**What to say:**

> 🚀 **ReefBurner V2 is LIVE!**
>
> **New Features:**
> ✅ Anyone can help winners claim prizes
> ✅ 10 round grace period (10 hours)
> ✅ Unclaimed prizes auto-burn (no stuck prizes!)
> ✅ Enhanced security (ReentrancyGuard, immutable creator)
>
> **Contract:** `0xYourNewContractAddress`
> **Verified:** https://reefscan.com/contract/0x...
> **dApp:** https://reef-burner-dapp.vercel.app
>
> Help make REEF more scarce! 🔥

---

## Troubleshooting

### "Cannot read properties of undefined (reading 'address')"
- Make sure you added seed phrase to `hardhat.config.js`
- Check that `seeds.account1` is defined

### "Insufficient funds"
- Make sure deployer account has enough REEF (recommend 100+ REEF)

### "Transaction reverted"
- Check that creator wallet address is valid
- Make sure not using burn address (0x...dEaD) as creator

### Frontend not showing unclaimed prize
- Check that you copied the correct ABI
- Verify `getUnclaimedPrizeInfo()` function exists in contract
- Check console for errors

---

## Important Notes

1. **Creator Wallet is IMMUTABLE** - Cannot be changed after deployment!
2. **No EmergencyWithdraw** - Owner cannot extract funds (by design)
3. **Max 500 participants per round** - Prevents gas limit issues
4. **10 round grace period** - Testing: 10 hours, Production: 30 days

---

## Next Steps After Deployment

1. **Monitor Contract**
   - Watch for bugs
   - Monitor prize claims
   - Check unclaimed burns

2. **Gather Feedback**
   - Ask community for improvements
   - Fix any UX issues

3. **Plan Future Upgrades**
   - Consider Chainlink VRF for better randomness
   - Multi-sig for owner functions
   - DAO governance

---

**Created by XenobuD**
**ReefBurner V2 - Production Ready!**
