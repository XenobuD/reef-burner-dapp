# 🧪 Local Testing - Ghid Complet

Test TOTUL local cu fake coins și lottery la 15 minute!

---

## ✅ **Ce AI Acum:**

```
Contract modificat pentru TESTING:
├── ✅ Lottery: 15 MINUTE (nu 3 zile!)
├── ✅ Range: 950-1500 REEF
├── ✅ Distribution: 65% burn, 27% prize, 8% creator
└── ✅ Compiled successful!

Hardhat Local Network:
├── ✅ 20 accounts cu 10,000 ETH fiecare (FAKE, FREE!)
├── ✅ Instant mining
├── ✅ Reset oricând vrei
└── ✅ Zero cost!
```

---

## 🚀 **PASO 1: Start Local Blockchain**

### **Terminal 1 - Hardhat Network:**

```bash
cd "d:\Reef Chain Project\reef-burner-dapp"
yarn hardhat node
```

**Output (IMPORTANT - save this!):**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

... (total 20 accounts)
```

✅ **Blockchain local RUNNING!** (lasă terminal-ul deschis!)

---

## 🚀 **PASO 2: Deploy Contract Local**

### **Terminal NOU (2) - Deploy:**

```bash
cd "d:\Reef Chain Project\reef-burner-dapp"
yarn hardhat run scripts/deploy.js --network localhost
```

**Output:**
```
Deploying with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0 REEF

Creator wallet address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

Deploying ReefBurner contract...
ReefBurner deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

=== Initial Contract State ===
Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Creator Wallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Round Number: 1
Min Burn Amount: 950.0 REEF
Prize Pool: 0.0 REEF
Total Burned: 0.0 REEF
```

⚠️ **SAVE CONTRACT ADDRESS:**
```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

✅ **Contract deployed LOCAL!**

---

## 🎨 **PASO 3: Setup Frontend pentru Local**

### **A. Update `.env`:**

File: `frontend/.env`

```env
# Contract address de la deployment
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Network local
VITE_NETWORK=localhost

# Local RPC
VITE_LOCAL_RPC=http://127.0.0.1:8545
```

### **B. Switch to REAL Mode:**

File: `frontend/src/App.jsx`

```javascript
// Change from:
const USE_MOCK = true;

// To:
const USE_MOCK = false;  // ✅ Use REAL contract
```

### **C. Copy Contract ABI:**

```bash
cd frontend
yarn copy-abi
```

---

## 🔌 **PASO 4: Connect Wallet la Local Network**

### **Opțiunea A: MetaMask (Recommended)**

**1. Add Local Network:**

MetaMask → Settings → Networks → Add Network → Add Manually

```
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
Block Explorer URL: (leave empty)
```

Click **Save** ✅

**2. Import Test Account:**

MetaMask → Account icon → Import Account → Private Key

```
Paste private key:
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

✅ **Acum ai 10,000 ETH în wallet!**

**3. Switch Network:**

MetaMask → Click network dropdown → Select "Hardhat Local"

✅ **Connected to local blockchain!**

### **Opțiunea B: Reef Wallet**

Similar, dar e mai simplu cu MetaMask pentru local testing!

---

## 🌐 **PASO 5: Start Frontend**

### **Terminal NOU (3) - Frontend:**

```bash
cd frontend
yarn dev
```

**Output:**
```
VITE v7.3.0  ready in 190 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

✅ **Deschide browser:** http://localhost:3000

---

## 🧪 **PASO 6: TEST COMPLET!**

### **Test 1: Connect Wallet** 🔌

1. Click **"Connect Wallet"**
2. MetaMask popup → **Connect**
3. Vezi address-ul: `0xf39F...2266`
4. Vezi balance: ~10,000 ETH

✅ **Connected!**

### **Test 2: First Burn** 🔥

1. Alege **950 REEF** (minimum)
2. Click **"BURN 950 REEF"**
3. MetaMask popup → **Confirm**
4. Wait ~2 seconds
5. ✅ **Success!**

**Verifică:**
- Stats updated (Total Burned: +617.5)
- Prize Pool: +256.5
- Te vezi în Participants List
- Balance scăzut cu ~950

### **Test 3: Multiple Burns cu Accounts Diferite** 👥

**Import mai multe accounts:**

```
Account #1 Private Key:
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2 Private Key:
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

**Pentru fiecare account:**
1. Import în MetaMask
2. Switch la account
3. Refresh dApp
4. Connect wallet
5. Burn diferite sume:
   - Account #0: 950 REEF (base)
   - Account #1: 1200 REEF (+2% bonus)
   - Account #2: 1500 REEF (+3% bonus)

✅ **Vezi 3 participants în listă!**

### **Test 4: Wait for Lottery (15 MIN!)** ⏰

**După 15 minute:**

1. Refresh dApp
2. Vezi Time Remaining: 0 minutes
3. Cineva face un nou burn
4. **LOTTERY TRIGGERED!**
5. Winner selected automat
6. Prize transferred instant
7. New round starts

**Check Winner:**
- Mergi la **Winner History**
- Vezi câștigătorul
- Check winner balance (crescut!)

✅ **Lottery funcționează!**

---

## 🔄 **Reset & Re-test**

### **Dacă Vrei să Resetezi Tot:**

**Terminal 1 (Hardhat):**
```bash
Ctrl+C (stop)
yarn hardhat node  (restart)
```

**Terminal 2 (Deploy):**
```bash
yarn hardhat run scripts/deploy.js --network localhost
```

**Update .env cu noul address!**

✅ **Fresh start!**

---

## 📊 **Test Scenarios**

### **Scenario 1: Basic Flow**

```
1. Deploy contract ✅
2. Account #0 burns 1000 REEF ✅
3. Wait 15 minutes ⏰
4. Account #0 burns again (triggers lottery) ✅
5. Account #0 wins (only participant) 🏆
6. Prize received ✅
```

### **Scenario 2: Multiple Participants**

```
1. Deploy contract ✅
2. Account #0 burns 950 REEF ✅
3. Account #1 burns 1200 REEF ✅
4. Account #2 burns 1500 REEF ✅
5. Wait 15 minutes ⏰
6. Account #3 burns 1000 (triggers) ✅
7. Random winner selected 🎲
8. Prize sent to winner ✅
```

### **Scenario 3: Edge Cases**

```
1. Try burn 949 REEF (should fail) ❌
2. Try burn 1501 REEF (should fail) ❌
3. Pause contract (admin) ⏸️
4. Try burn (should fail when paused) ❌
5. Unpause ▶️
6. Burn works again ✅
```

---

## 🐛 **Debugging Tips**

### **Check Contract State:**

```bash
# În Hardhat console:
yarn hardhat console --network localhost

> const contract = await ethers.getContractAt("ReefBurner", "CONTRACT_ADDRESS")
> const stats = await contract.getStatistics()
> console.log(stats)
> const timeLeft = await contract.getTimeRemainingInRound()
> console.log(timeLeft.toString(), "seconds")
```

### **Check Balance:**

```bash
> const balance = await ethers.provider.getBalance("0xYourAddress")
> console.log(ethers.formatEther(balance))
```

### **Manually Trigger Round End:**

```bash
> await contract.triggerRoundEnd()
```

---

## ⚠️ **IMPORTANT: Before Mainnet**

### **Change Back to 3 Days:**

File: `contracts/ReefBurner.sol`

```solidity
// Change from:
uint256 public constant ROUND_DURATION = 15 minutes;

// To:
uint256 public constant ROUND_DURATION = 3 days;
```

**Recompile:**
```bash
yarn hardhat compile
```

✅ **Production ready!**

---

## 📋 **Quick Reference**

```
Terminal 1 - Blockchain:
$ yarn hardhat node

Terminal 2 - Deploy:
$ yarn hardhat run scripts/deploy.js --network localhost

Terminal 3 - Frontend:
$ cd frontend && yarn dev

Browser:
http://localhost:3000

MetaMask Network:
Name: Hardhat Local
RPC: http://127.0.0.1:8545
Chain ID: 31337

Test Account:
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Balance: 10,000 ETH (fake!)

Lottery Duration: 15 MINUTES ⏰
```

---

## ✅ **Success Checklist**

```bash
Setup:
├── [ ] Hardhat node running
├── [ ] Contract deployed local
├── [ ] MetaMask configured
├── [ ] Test account imported
├── [ ] Frontend running
└── [ ] Contract address updated in .env

Testing:
├── [ ] Wallet connects
├── [ ] Burn 950 REEF works
├── [ ] Burn 1500 REEF works
├── [ ] Burn 949 fails
├── [ ] Burn 1501 fails
├── [ ] Stats update correctly
├── [ ] Multiple accounts work
├── [ ] 15 min lottery triggers
├── [ ] Winner selected
└── [ ] Prize transferred

Ready for Mainnet:
├── [ ] All tests passed
├── [ ] No bugs found
├── [ ] Change to 3 days
├── [ ] Recompile
└── [ ] Deploy mainnet! 🚀
```

---

**Acum ai TOTUL pentru testare completă local! 15 minute lottery, fake coins, ZERO risc! 🧪🔥**
