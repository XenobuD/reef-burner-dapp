# 🔥 REEF BURNER - Public Testing Announcement

## 📢 Official Testing Phase Launch

We're excited to announce the **REEF BURNER** dApp is now live on **Reef Mainnet** for community testing!

---

## 🎯 What is REEF BURNER?

REEF Burner is a **deflationary lottery protocol** that permanently burns REEF tokens while rewarding participants:

- **65% Burned Forever** → Sent to `0x000...dEaD` (verifiable on-chain)
- **27% Prize Pool** → Winner selected via weighted lottery
- **8% Development** → Sustainable project funding

**Every burn makes REEF more scarce. Every participant has a chance to win big.**

---

## ⚠️ TESTING PARAMETERS (1 Week Only)

**For safety during testing, we've adjusted the parameters:**

| Parameter | Testing Value | Production Value |
|-----------|--------------|------------------|
| Min Burn | **5 REEF** | 950 REEF |
| Max Burn | **8 REEF** | 1,500 REEF |
| Lottery Duration | **1 Hour** | 3 Days |

**Testing Period:** 1-2 weeks (based on community feedback and testing results)
**After successful testing:** We'll switch to production parameters and launch officially

---

## 🔐 CRITICAL SECURITY NOTICE

### ⚠️ USE A TEST WALLET - DO NOT USE YOUR MAIN WALLET!

**Before participating:**

1. **Create a NEW wallet** in Reef Wallet extension
2. **Transfer only 50-100 REEF** to this test wallet
3. **NEVER use your main wallet** with significant funds
4. **Test with small amounts** during this phase

### How to Create a Test Wallet:

1. Open **Reef Wallet** extension
2. Click **"+"** → **"Create New Account"**
3. Name it **"REEF BURNER TEST"**
4. **Save the seed phrase** securely
5. Transfer **50-100 REEF** from your main wallet
6. Use **ONLY this wallet** for testing

---

## ✅ How to Verify Legitimacy

### Official Links (Bookmark These!)

**🌐 dApp:** https://reef-burner-dapp.vercel.app/

**📜 Smart Contract:** `0xFdD061cBE98ef3D1f2a2d7A5e8e14CA57e3baA48`

**🔍 Verify on ReefScan:**
https://reefscan.com/contract/0xFdD061cBE98ef3D1f2a2d7A5e8e14CA57e3baA48

**💾 GitHub (Open Source):**
https://github.com/XenobuD/reef-burner-dapp

### 🚨 Beware of Scams!

- ❌ **NEVER** enter your seed phrase on ANY website
- ❌ **DO NOT** trust clone sites or fake contracts
- ❌ **VERIFY** the contract address before connecting
- ✅ **ALWAYS** check the URL: `reef-burner-dapp.vercel.app`
- ✅ **Reef Wallet** will show transaction details - READ them carefully!

---

## 📖 How to Participate

### Step 1: Connect Wallet
1. Go to: https://reef-burner-dapp.vercel.app/
2. Click **"🌊 Connect Wallet"**
3. Approve connection in **Reef Wallet**
4. Your address appears in top-right corner

### Step 2: Switch to Test Wallet (If Needed)
- If you have multiple accounts, click your address
- Select your **TEST wallet** from dropdown
- Verify the correct address is connected

### Step 3: Burn REEF
1. Enter amount: **5-8 REEF** (testing limits)
2. Click quick buttons: **[5] [6] [7] [8]**
3. Click **"🔥 BURN X REEF 🔥"**
4. **Review transaction** in Reef Wallet popup
5. Click **"Approve"** to confirm

### Step 4: Verify Burn
- Check **ReefScan** for your transaction
- View **0x000...dEaD** address to see burned REEF
- See your entry in **"Current Participants"** list

---

## 🎲 How the Lottery Works

### Weighted Probability System

**The more you burn, the better your odds:**

| Burn Amount | Bonus | Total Multiplier |
|-------------|-------|------------------|
| 5 REEF | 0% | 1x tickets |
| 6 REEF | +1% | 1.01x tickets |
| 7 REEF | +2% | 1.02x tickets |
| 8 REEF | +3% | 1.03x tickets |

### Winner Selection

- **Every 1 hour** (testing) / **3 days** (production)
- **Fully automated** by smart contract
- **Provably fair** - weighted random selection
- **Winner gets entire prize pool** (27% of all burns)

---

## 🔥 How REEF is Burned

### Transparent On-Chain Proof

When you burn REEF, the smart contract automatically:

```solidity
// 65% sent to dead address (line 166 in contract)
address(0x000000000000000000000000000000000000dEaD).call{value: burnAmount}
```

**Verify burns yourself:**
1. Go to: https://reefscan.com/account/0x000000000000000000000000000000000000dEaD
2. See **all burned REEF** from the protocol
3. **No one** can access this address - REEF is gone forever!

---

## 📊 Current Statistics

Check real-time stats on the dApp:

- **Total REEF Burned** (all-time)
- **Current Prize Pool** (next winner gets this)
- **Total Participants** (unique addresses)
- **Time Until Lottery** (countdown)
- **Current Round Participants** (this round)

---

## 🛡️ Security Features

### Smart Contract Security

✅ **Open Source** - Verify code on GitHub
✅ **No Admin Keys** - Owner cannot withdraw funds
✅ **No Upgradability** - Contract is immutable
✅ **Automated** - No human intervention needed
✅ **Verifiable Burns** - All burns visible on-chain

### dApp Security

✅ **No Seed Storage** - Never asks for seed phrase
✅ **Wallet Approval** - Every transaction needs your confirmation
✅ **Read-Only Access** - Can only request signatures
✅ **No Permissions** - Cannot move funds without approval

---

## ❓ FAQ

### Q: Can I lose all my REEF?
**A:** Only what you choose to burn. Use a test wallet with limited funds.

### Q: How is the winner selected?
**A:** Smart contract uses block hash + weighted random selection. More burned = better odds.

### Q: What happens if I'm the only participant?
**A:** You'll win the entire prize pool! (But it will be small)

### Q: Can the owner rug pull?
**A:** No. The contract is immutable. Funds go to: 65% burn, 27% prize, 8% dev. No admin withdrawal function.

### Q: How do I know REEF is actually burned?
**A:** Check the dead address on ReefScan: https://reefscan.com/account/0x000000000000000000000000000000000000dEaD

### Q: What if I see a different contract address?
**A:** DO NOT USE IT! Only trust: `0xFdD061cBE98ef3D1f2a2d7A5e8e14CA57e3baA48`

---

## 🚀 Testing Roadmap

### Phase 1: Community Testing (Current - 1 Week)
- ✅ Deploy to Reef Mainnet
- ✅ Testing parameters: 5-8 REEF, 1 hour lottery
- 🔄 Gather community feedback
- 🔄 Monitor for bugs/issues
- 🔄 Multiple lottery rounds for validation

### Phase 2: Production Launch (After Testing)
- Switch to production parameters: 950-1,500 REEF
- Lottery duration: 3 days
- Full marketing push
- Partnership announcements

---

## 💬 Feedback & Support

**We need YOUR feedback to make this better!**

- 🐛 **Report bugs** on GitHub Issues
- 💡 **Suggest features** in Telegram
- ⭐ **Star the repo** if you like the project
- 🔄 **Share your experience** with the community

**Official Telegram:** [https://t.me/reefchain]
**GitHub Issues:** https://github.com/XenobuD/reef-burner-dapp/issues

---

## ⚠️ Final Reminder

1. **USE A TEST WALLET** - Create a new one!
2. **VERIFY CONTRACT ADDRESS** - `0xFdD061cBE98ef3D1f2a2d7A5e8e14CA57e3baA48`
3. **CHECK URL** - Only use `reef-burner-dapp.vercel.app`
4. **NEVER SHARE SEED PHRASE** - Not even with "support"
5. **START SMALL** - Test with 5 REEF first

---

## 🔥 Let's Make REEF More Scarce Together!

**Join the testing phase now:**
👉 https://reef-burner-dapp.vercel.app/

**Questions? Ask in comments below! 👇**

---

*Built with ❤️ for the Reef Community*
*Open Source • Transparent • Verifiable*

---

## 📝 Technical Details (For Developers)

**Contract:** ReefBurner.sol
**Network:** Reef Mainnet
**Solidity:** ^0.8.4
**Framework:** Hardhat + Vite + React
**Wallet Integration:** Polkadot Extension API

**Audit Status:** Community review in progress
**License:** MIT

---

#ReefChain #DeFi #Crypto #Lottery #TokenBurn #REEF
