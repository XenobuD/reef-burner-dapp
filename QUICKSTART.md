# ⚡ Quick Start Guide

Get Reef Burner running in 5 minutes!

## 🎯 Prerequisites

✅ Node.js 16+ installed
✅ Yarn package manager
✅ MetaMask or Reef Extension Wallet
✅ REEF testnet tokens ([Get from faucet](https://faucet.reef.io))

---

## 📦 Step 1: Install Dependencies

```bash
cd reef-burner-dapp
yarn install
```

---

## 🔧 Step 2: Compile Smart Contract

```bash
yarn hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

---

## 🚀 Step 3: Deploy to Testnet

1. **Add your wallet seed phrase** to `hardhat.config.js`:

```javascript
reef_testnet: {
  url: "wss://rpc-testnet.reefscan.com/ws",
  seeds: {
    testAccount: "your twelve word seed phrase here"
  }
}
```

2. **Update creator wallet** in `scripts/deploy.js`:

```javascript
const CREATOR_WALLET = "0xYourWalletAddress";
```

3. **Deploy**:

```bash
yarn hardhat run scripts/deploy.js --network reef_testnet
```

4. **Save the contract address** from output!

---

## 🎨 Step 4: Setup Frontend

```bash
cd frontend
yarn install
```

### Copy Contract ABI:

```bash
yarn copy-abi
```

### Create .env file:

```bash
cp .env.example .env
```

### Edit `.env` and add your contract address:

```env
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
VITE_NETWORK=testnet
```

---

## 🌐 Step 5: Run Frontend

```bash
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## ✅ You're Done!

Now you can:
1. Connect your wallet
2. Burn REEF tokens (950-1500 REEF)
3. See live statistics
4. View participants
5. Wait for lottery (3 days)

---

## 🐛 Troubleshooting

### "Contract not compiled"
```bash
cd ..
yarn hardhat compile
cd frontend
yarn copy-abi
```

### "No wallet detected"
- Install MetaMask or Reef Extension
- Refresh page

### "Contract address not set"
- Make sure you edited `.env` file
- Restart dev server (`yarn dev`)

### "Transaction failed"
- Check you have enough REEF
- Amount must be 950-1500 REEF
- Make sure you're on Reef testnet

---

## 📊 Next Steps

1. **Test Everything**:
   - Burn tokens
   - Check statistics
   - Verify on Reefscan
   - Wait 3 days for lottery

2. **Get Community Testers**:
   - Share testnet link
   - Collect feedback
   - Fix bugs

3. **When Ready for Mainnet**:
   - Wait for Reef upgrade
   - Deploy to mainnet
   - Update frontend
   - Announce! 🎉

---

## 📞 Need Help?

Check the main [README.md](README.md) for detailed docs!
