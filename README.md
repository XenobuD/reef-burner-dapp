# 🔥 Reef Burner dApp

**Burn REEF. Create Deflation. Win Massive Prizes.**

A decentralized token burn mechanism with automated lottery on Reef Chain. Participants burn REEF tokens to create deflation while competing for prize pools every 3 days through a fair, weighted lottery system.

---

## 🎯 What is Reef Burner?

Reef Burner is a revolutionary dApp that gamifies token burning to create deflation on the Reef Chain ecosystem. Users burn REEF tokens, reducing the circulating supply, while automatically entering a lottery with chances to win massive prizes.

### Key Features:

- 🔥 **65% Burned Forever** - True deflation mechanism
- 💎 **27% Prize Pool** - Massive rewards every 3 days
- 👨‍💻 **8% Creator Fee** - Sustainable development
- 🎲 **Weighted Lottery** - Burn more for better odds
- ⚡ **100% Automated** - No manual intervention needed
- 🔒 **Fully Transparent** - All on-chain, verifiable

---

## 💡 How It Works

### For Participants:

1. **Connect Wallet** - Connect your Reef-compatible wallet
2. **Choose Amount** - Select 950-1,500 REEF to burn
3. **Burn & Enter** - Burn tokens and enter the lottery automatically
4. **Wait for Prize** - Winner selected automatically every 3 days
5. **Win Big** - Prize transferred instantly to winner's wallet

### Distribution:

Every burn transaction is split automatically:
- **65%** → Sent to dead address (burned forever)
- **27%** → Added to prize pool
- **8%** → Creator wallet

### Weighted Lottery:

Fair odds with bonus for higher burns:
- **950-1,049 REEF**: 100 tickets (base odds)
- **1,050-1,199 REEF**: 101 tickets (+1% bonus)
- **1,200-1,499 REEF**: 102 tickets (+2% bonus)
- **1,500 REEF**: 103 tickets (+3% bonus)

### Example with 100 Players:

If 100 players each burn 950 REEF:
- **Total burned**: 61,750 REEF (destroyed forever!)
- **Prize pool**: 25,650 REEF (winner takes all!)
- **Creator fee**: 7,600 REEF
- **Everyone has equal 1% chance** to win

If you burn 1,500 REEF instead:
- **Your odds**: ~1.03% (slightly better!)
- **Still fair** for all participants

---

## 🏗️ Project Structure

```
reef-burner-dapp/
├── contracts/
│   └── ReefBurner.sol          # Main smart contract
├── scripts/
│   └── deploy.js               # Deployment script
├── test/
│   └── ReefBurner.test.js      # Contract tests
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Utility functions
│   │   └── App.jsx             # Main app
│   └── README.md               # Frontend docs
├── hardhat.config.js           # Hardhat configuration
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites:

- Node.js >= 16
- Yarn package manager
- Reef-compatible wallet (MetaMask or Reef Extension)
- REEF tokens for testing

### 1. Clone & Install:

```bash
git clone <your-repo>
cd reef-burner-dapp
yarn install
```

### 2. Compile Contract:

```bash
yarn hardhat compile
```

### 3. Deploy to Testnet:

```bash
# Edit hardhat.config.js and add your seed phrase
yarn hardhat run scripts/deploy.js --network reef_testnet
```

### 4. Setup Frontend:

```bash
cd frontend
yarn install
yarn copy-abi

# Create .env file
cp .env.example .env
# Edit .env and add your contract address

yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📊 Smart Contract Details

### Contract: `ReefBurner.sol`

**Main Functions:**

- `burn()` - Burn REEF and enter lottery
- `triggerRoundEnd()` - Manually trigger round end (if 3 days passed)
- `getStatistics()` - Get all statistics
- `getCurrentRoundParticipants()` - View current participants
- `getWinner(index)` - Get winner details

**Admin Functions:**

- `pause()` / `unpause()` - Emergency pause
- `setMinBurnAmount()` - Adjust minimum (e.g., based on community poll)
- `setCreatorWallet()` - Update creator wallet
- `emergencyWithdraw()` - Recover stuck funds (only when paused)

**Security Features:**

- ✅ Reentrancy protection
- ✅ Access control (owner-only functions)
- ✅ Pause mechanism
- ✅ Amount validation (950-1,500 REEF)
- ✅ Zero address checks
- ✅ Emergency withdraw

### Gas Optimization:

The contract includes gas-intensive operations to maximize burn effect:
- Nested loops with calculations
- Memory array operations
- Consumes ~450,000 gas per burn transaction

---

## 🎨 Frontend

Beautiful, animated React frontend with:

- ✨ Framer Motion animations
- 🌊 Reef wallet integration
- 📊 Real-time statistics
- 🎰 Participant list with bonuses
- 🏆 Winner history
- 📱 Fully responsive design

See [frontend/README.md](frontend/README.md) for detailed documentation.

---

## 🧪 Testing

Run contract tests:

```bash
yarn hardhat test
```

Test coverage includes:
- Deployment
- Burn functionality
- Round management
- Prize distribution
- Security (reentrancy, access control)
- Admin functions
- Edge cases

---

## 🚀 Deployment Guide

### Testnet Deployment:

1. **Prepare Wallet:**
   - Get Reef testnet tokens from [faucet](https://faucet.reef.io)
   - Add seed phrase to `hardhat.config.js`

2. **Update Configuration:**
   ```javascript
   // In deploy.js, set your creator wallet
   const CREATOR_WALLET = "your_wallet_address";
   ```

3. **Deploy:**
   ```bash
   yarn hardhat run scripts/deploy.js --network reef_testnet
   ```

4. **Save Contract Address:**
   - Copy address from deployment output
   - Add to frontend `.env` file

5. **Verify on Reefscan:**
   - Visit https://testnet.reefscan.com
   - Search for your contract address

### Mainnet Deployment:

⚠️ **IMPORTANT**: Do NOT deploy to mainnet until:
1. ✅ All testnet testing is complete
2. ✅ Community testers have verified
3. ✅ All bugs are fixed
4. ✅ Security audit is done (if possible)
5. ✅ Reef Chain mainnet upgrade is complete

When ready:
```bash
yarn hardhat run scripts/deploy.js --network reef_mainnet
```

---

## 📋 Deployment Checklist

### Before Testnet:
- [x] Contract compiled successfully
- [x] Weighted lottery implemented
- [x] MIN: 950 REEF, MAX: 1,500 REEF
- [x] Distribution: 65% burn, 27% prize, 8% creator
- [x] Frontend built with animations
- [ ] Local testing complete

### Before Mainnet:
- [ ] Testnet deployment successful
- [ ] All functions tested on testnet
- [ ] Multiple test transactions executed
- [ ] Prize distribution verified (wait 3+ days)
- [ ] Community testing completed
- [ ] All bugs fixed
- [ ] Security review done
- [ ] Reef Chain upgrade confirmed
- [ ] Frontend deployed
- [ ] Final code review

---

## ⚙️ Configuration

### Adjustable Parameters:

- **Minimum Burn Amount**: Currently 950 REEF (can be changed via `setMinBurnAmount()`)
- **Maximum Burn Amount**: 1,500 REEF (hardcoded constant)
- **Round Duration**: 3 days (hardcoded constant)
- **Distribution**: 65/27/8 (hardcoded constants)

### Why These Numbers?

- **950 REEF minimum**: Based on community poll results
- **1,500 REEF maximum**: Prevents whale dominance, ensures fairness
- **3-day rounds**: Builds larger prize pools, more attractive
- **Weighted system**: Small bonuses encourage higher burns without being unfair

---

## 🔐 Security

### Audits:
- [ ] Internal testing
- [ ] Community review
- [ ] Professional audit (recommended before mainnet)

### Known Limitations:

1. **Randomness**: Uses block data for randomness (not cryptographically secure)
   - For production, consider Chainlink VRF integration
   - Current implementation is sufficient for fair lottery

2. **Admin Control**: Owner has significant control
   - Can pause contract
   - Can adjust minimum amount
   - Can change creator wallet
   - Can withdraw in emergencies (only when paused)

3. **Gas Costs**: Intentionally high gas consumption
   - ~450,000 gas per transaction
   - This is by design to maximize burn

---

## 🎯 Roadmap

### Phase 1: Development ✅
- [x] Smart contract development
- [x] Weighted lottery system
- [x] Frontend with animations
- [x] Testing suite

### Phase 2: Testnet 🔄
- [ ] Deploy to testnet
- [ ] Community testing
- [ ] Bug fixes
- [ ] Performance optimization

### Phase 3: Mainnet 🔜
- [ ] Wait for Reef Chain upgrade
- [ ] Final security review
- [ ] Mainnet deployment
- [ ] Public announcement

### Phase 4: Future Enhancements 💡
- [ ] Chainlink VRF integration
- [ ] Mobile app
- [ ] NFT rewards
- [ ] Governance token
- [ ] Multi-chain expansion

---

## 📊 Statistics

Track live statistics:
- Total REEF burned (lifetime)
- Total participants (unique wallets)
- Total winners
- Current prize pool
- Current round participants

All data is on-chain and publicly verifiable!

---

## 🤝 Contributing

This is a community project! Contributions welcome:

1. Fork the repository
2. Create your feature branch
3. Test thoroughly
4. Submit a pull request

---

## 📞 Support

- **Telegram**: [Your Telegram Link]
- **Discord**: [Your Discord Link]
- **Twitter**: [Your Twitter Link]

---

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always:
- Test on testnet first
- Start with small amounts
- Understand that burned tokens are GONE FOREVER
- No guarantee of winning prizes
- Smart contracts are immutable once deployed

**Lottery Disclaimer**: This is a burn mechanism with lottery rewards. Not financial advice. Participation is entirely voluntary. Prizes are not guaranteed.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🌊 Built on Reef Chain

Reef Chain - Fast, scalable, and low-cost DeFi platform.

Learn more: [reef.io](https://reef.io)

---

**Ready to burn some REEF? Let's create deflation together! 🔥**

---

*Built by XenobuD for the Reef Community* 💜
