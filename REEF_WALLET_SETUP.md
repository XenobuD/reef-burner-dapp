# 🌊 Reef Wallet Setup & Testnet Guide

Ghid complet pentru setup Reef Extension Wallet și testare pe testnet!

---

## 📦 **PASO 1: Instalează Reef Extension Wallet**

### **Download:**

**🌐 Link Oficial:** https://reef.io/wallet

**Sau direct:**
- **Chrome/Brave/Edge**: [Chrome Web Store](https://chrome.google.com/webstore/detail/reef-chain-wallet/mjgkpalnahacmhkikiommfiomhjipgjn)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/reef-chain-wallet/)

### **Instalare:**

1. Click pe link-ul de mai sus
2. Click **"Add to Chrome"** (sau Firefox)
3. Click **"Add Extension"**
4. ✅ Reef icon ar trebui să apară în toolbar!

---

## 🔐 **PASO 2: Creează Wallet Nou**

### **Opțiunea A: Create New Wallet**

1. **Click pe Reef icon** în toolbar
2. Click **"Create New Wallet"**
3. **Create Password** (folosește unul puternic!)
4. Click **"Next"**

### **⚠️ FOARTE IMPORTANT - Salvează Seed Phrase!**

```
Vei vedea 12 CUVINTE (seed phrase):

apple banana cherry dog elephant ...

🚨 CRITICAL:
✅ Scrie-le pe HÂRTIE (nu pe PC!)
✅ Păstrează în loc SIGUR (seif, dosar secret)
✅ NU face screenshot
✅ NU trimite pe email/WhatsApp/Telegram
✅ NU salvează în cloud

⚠️ Dacă pierzi seed phrase = pierzi TOTUL!
⚠️ Dacă cineva îl vede = îți poate fura TOTUL!
```

5. **Confirmă seed phrase** (selectează cuvintele în ordine)
6. Click **"Confirm"**
7. ✅ **Wallet creat!**

### **Opțiunea B: Import Existing Wallet (dacă ai deja)**

1. Click **"Import from Seed Phrase"**
2. Enter cele 12 cuvinte
3. Create password
4. ✅ Done!

---

## 🌊 **PASO 3: Obține REEF Testnet Tokens (FREE!)**

### **Metoda 1: Discord Faucet (OFICIAL - 2025)**

**Aceasta e metoda CORECTĂ și ACTIVĂ!**

1. **Join Reef Discord Server:**
   ```
   🔗 https://discord.gg/reef
   ```

2. **Verify Account:**
   - Discord va cere să verifici că ești human
   - Follow verification steps
   - ✅ Account verified!

3. **Select Builder Role:**
   - Mergi la canalul: **📋┊start-here**
   - Click pe **Builder** role
   - Acum ai acces la faucet! ✅

4. **Copiază Address-ul** din Reef Wallet:
   ```
   Click pe wallet → Copy address
   Exemplu: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4
   ```

5. **Request Testnet Tokens:**
   - Mergi la canalul: **🚰┊faucet**
   - Type în chat:
   ```
   /faucet 0xYourReefWalletAddress
   ```
   - Example:
   ```
   /faucet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4
   ```

6. **Wait ~30-60 seconds**
   - Vei primi **2,000 REEF testnet** (FREE!)
   - Bot va confirma în Discord ✅

7. **Verifică Balance:**
   - Deschide Reef Wallet
   - Ar trebui să vezi: **~2,000 REEF** 🎉

### **Metoda 2: ReefSwap Faucet (Alternativă)**

**Dacă Discord nu merge, încearcă ReefSwap:**

1. **Vizitează ReefSwap:**
   ```
   🔗 https://app.reefswap.com
   ```

2. **Click "Get Testnet Tokens"** button

3. **Type în message box:**
   ```
   /faucet YOUR_REEF_ADDRESS
   ```

4. **Primești tokens** instant!

### **Metoda 3: Telegram (Support Manual)**

**Dacă nimic nu merge:**

```
1. Join: https://t.me/reefchain
2. Contact @reef_support sau ask în group
3. Explică: "Need testnet REEF for development"
4. Provide address
5. Team trimite manual
```

---

## 🔍 **PASO 4: Verifică pe Reefscan Testnet**

1. **Vizitează Reefscan Testnet:**
   ```
   🔗 https://testnet.reefscan.com
   ```

2. **Caută Address-ul Tău:**
   - Paste în search bar: `0xYourAddress`
   - Click search

3. **Vezi Balance:**
   ```
   Balance: ~1,000 REEF
   Transactions: 1 (incoming from faucet)
   ```

✅ **Perfect! Ești ready pentru testnet!**

---

## 🚀 **PASO 5: Deploy Contract pe Testnet**

Acum că ai REEF testnet, hai să deploy contractul!

### **A. Update Hardhat Config:**

Editează `hardhat.config.js`:

```javascript
reef_testnet: {
  url: "wss://rpc-testnet.reefscan.com/ws",
  seeds: {
    testAccount: "YOUR_12_WORD_SEED_PHRASE_HERE"
  },
  scanUrl: "https://testnet.reefscan.com"
}
```

⚠️ **IMPORTANT**:
- Pune seed phrase-ul DOAR pentru testnet!
- NU pune seed-ul de mainnet aici!
- Creează un wallet SEPARAT pentru development!

### **B. Update Deployment Script:**

Editează `scripts/deploy.js`:

```javascript
// Set creator wallet address (din Reef Wallet)
const CREATOR_WALLET = "0xYourReefWalletAddress";
```

### **C. Compile Contract:**

```bash
cd "d:\Reef Chain Project\reef-burner-dapp"
yarn hardhat compile
```

Expected output:
```
✓ Compiled 1 Solidity file successfully
```

### **D. Deploy to Testnet:**

```bash
yarn hardhat run scripts/deploy.js --network reef_testnet
```

Expected output:
```
Deploying ReefBurner contract...
ReefBurner deployed to: 0xABC123...
Creator Wallet: 0xYourAddress
```

### **E. Save Contract Address:**

```
⚠️ IMPORTANT: Copy contract address!
Example: 0xABC123456789...

Vei avea nevoie de el pentru frontend!
```

### **F. Verify on Reefscan:**

1. Vizitează: https://testnet.reefscan.com
2. Caută contract address
3. Vezi contract deployed! ✅

---

## 🎨 **PASO 6: Connect Frontend to Testnet**

### **A. Copy Contract ABI:**

```bash
cd frontend
yarn copy-abi
```

### **B. Update .env File:**

Editează `frontend/.env`:

```env
VITE_CONTRACT_ADDRESS=0xYourContractAddressFromDeployment
VITE_NETWORK=testnet
```

### **C. Switch to REAL Mode:**

Editează `frontend/src/App.jsx`:

```javascript
// Change from:
const USE_MOCK = true;

// To:
const USE_MOCK = false;
```

### **D. Restart Frontend:**

```bash
# Stop current server (Ctrl+C)
yarn dev
```

---

## 🧪 **PASO 7: Test pe Testnet!**

### **Test Flow:**

1. **Deschide Browser:**
   ```
   http://localhost:3000
   ```

2. **Connect Reef Wallet:**
   - Click "Connect Wallet"
   - Reef Wallet popup → Approve
   - Vezi address-ul conectat ✅

3. **Test Burn (Prima Tranzacție):**
   - Alege **950 REEF** (minimum)
   - Click **"BURN 950 REEF"**
   - Reef Wallet popup → **Confirm transaction**
   - Wait ~10 seconds
   - ✅ Success!

4. **Verifică Rezultatul:**
   - Vezi-te în **Participants List**
   - Check **Stats** updated:
     - Total Burned +617.5 REEF
     - Prize Pool +256.5 REEF
   - Check **balance** în Reef Wallet (scăzut cu ~950 REEF)

5. **Test cu Mai Multe Sume:**
   - Try **1500 REEF** (maximum, +3% bonus)
   - Try **1200 REEF** (+2% bonus)
   - Try **1050 REEF** (+1% bonus)

6. **Check pe Reefscan:**
   ```
   https://testnet.reefscan.com/account/YOUR_ADDRESS
   ```
   - Vezi toate tranzacțiile
   - Verify contract calls
   - Check balance changes

7. **Verify Creator Fee:**
   - După burns, check **creator wallet balance**
   - Ar trebui să vezi **8% din fiecare burn**!
   - Example: 5 burns × 950 REEF × 8% = **380 REEF** în wallet-ul tău!

---

## ⏰ **PASO 8: Wait for Lottery (3 Days)**

### **Ce Se Întâmplă:**

```
Day 1 (Today):
├── Deploy contract ✅
├── Test burns ✅
├── Accumulate participants
└── Prize pool grows

Day 2:
├── More users test
├── Prize pool bigger
└── Countdown: 1 day left

Day 3:
├── Round ends automatically
├── Winner selected (weighted lottery)
├── Prize transferred instant!
└── New round starts

Day 4:
├── Check winner in Winner History
├── Verify prize received
└── Test new round
```

### **Cum Verifici Lottery:**

**Metoda 1: Call Contract Function**
```bash
yarn hardhat console --network reef_testnet

> const contract = await ethers.getContractAt("ReefBurner", "CONTRACT_ADDRESS")
> const timeLeft = await contract.getTimeRemainingInRound()
> console.log(timeLeft.toString()) // seconds until lottery
```

**Metoda 2: Frontend**
```
Deschide dApp-ul
Check "Time Remaining" în Stats Panel
```

**Metoda 3: Trigger Manual (dacă vrei să testezi imediat)**
```bash
# Only for testing - reduces round to 1 minute
# Edit contract, recompile, redeploy cu:
uint256 public constant ROUND_DURATION = 1 minutes;
```

---

## ✅ **Checklist Testnet Success**

### **Smart Contract:**
- [ ] Contract deployed pe testnet
- [ ] Address verificat pe Reefscan
- [ ] Creator wallet set corect
- [ ] Balance început: ~1,000 REEF

### **Frontend:**
- [ ] .env updated cu contract address
- [ ] USE_MOCK = false
- [ ] Reef Wallet connects
- [ ] Burn transactions work

### **Functionality:**
- [ ] Burn 950 REEF (minimum) ✅
- [ ] Burn 1500 REEF (maximum) ✅
- [ ] Vezi bonusuri (+1%, +2%, +3%)
- [ ] Stats update corect
- [ ] Participants list updates
- [ ] Creator primește 8%

### **Lottery (after 3 days):**
- [ ] Winner selected automatically
- [ ] Prize transferred to winner
- [ ] Winner appears în History
- [ ] New round starts
- [ ] Stats reset pentru new round

---

## 🐛 **Troubleshooting**

### **"Insufficient funds for gas"**
```
Problem: Nu ai destui REEF pentru gas
Solution: Get more de la faucet (faucet.reef.io)
```

### **"Transaction failed"**
```
Problem: Contract error sau invalid amount
Solution:
- Check amount: 950-1500 REEF
- Verify contract address corect
- Check Reefscan pentru error details
```

### **"Wallet not connecting"**
```
Problem: Reef Wallet nu se conectează
Solution:
- Refresh page
- Unlock Reef Wallet
- Try alt browser
- Check network: Reef Testnet
```

### **"Contract not found"**
```
Problem: Address greșit în .env
Solution:
- Verify contract address
- Re-deploy dacă e necesar
- Run yarn copy-abi din nou
```

---

## 📊 **Expected Results**

### **Testnet Stats After Testing:**

```
Your Wallet:
├── Started: ~1,000 REEF
├── After 5 burns: ~250 REEF (spent ~750)
├── Creator earnings: ~60 REEF (8% from burns)
└── Net: ~310 REEF (profit +60!)

Contract:
├── Total Burned: ~487.5 REEF (65%)
├── Prize Pool: ~202.5 REEF (27%)
├── Creator Sent: ~60 REEF (8%)
└── Participants: 1 (you)

After Lottery (3 days):
├── Winner: You (only participant)
├── Prize Won: ~202.5 REEF
├── Your Balance: ~510 REEF
└── Profit: +510 REEF! 🎉
```

---

## 🎯 **Next Steps After Testnet**

1. **Get Community Testers:**
   - Share testnet link
   - Get feedback
   - Fix orice bugs

2. **Wait for Reef Upgrade:**
   - Monitor Reef announcements
   - Când e ready pentru mainnet

3. **Deploy to Mainnet:**
   - Same process ca testnet
   - Dar cu REAL REEF!
   - Double-check totul

4. **Announce & Launch:**
   - Share pe Telegram
   - Celebrate! 🎉

---

## 🔗 **Useful Links**

- **Reef Wallet**: https://reef.io/wallet
- **Testnet Faucet**: https://faucet.reef.io
- **Testnet Explorer**: https://testnet.reefscan.com
- **Reef Discord**: https://discord.gg/reef
- **Reef Telegram**: https://t.me/reefchain
- **Reef Docs**: https://docs.reef.io

---

**Ready să testezi pe testnet? Urmează pașii și ai grijă să salvezi seed phrase-ul! 🌊🔥**
