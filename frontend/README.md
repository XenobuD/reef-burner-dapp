# 🔥 Reef Burner Frontend

Beautiful, animated React frontend for the Reef Burner dApp - burn REEF tokens and win massive prizes!

## 🎨 Features

- ✨ **Beautiful Animations** - Powered by Framer Motion
- 🌊 **Reef Wallet Integration** - Connect with MetaMask/Reef Extension
- 📊 **Real-time Statistics** - Live updates of burns, prizes, and participants
- 🎰 **Weighted Lottery Display** - See your bonus chances
- 🏆 **Winner History** - Track all past winners
- 📱 **Fully Responsive** - Works on all devices

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
yarn install
```

### 2. Copy Contract ABI

After compiling the smart contract, copy the ABI:

```bash
yarn copy-abi
```

This will copy the contract ABI from `../artifacts/contracts/ReefBurner.sol/ReefBurner.json` to `src/contracts/ReefBurner.json`.

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your deployed contract address:

```env
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
VITE_NETWORK=testnet
```

### 4. Run Development Server

```bash
yarn dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
yarn build
```

The production build will be in the `dist/` folder.

To preview the production build:

```bash
yarn preview
```

## 🎯 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Header.jsx
│   │   ├── StatsPanel.jsx
│   │   ├── BurnCard.jsx
│   │   ├── ParticipantsList.jsx
│   │   ├── WinnerHistory.jsx
│   │   └── AnimatedBackground.jsx
│   ├── hooks/           # Custom React hooks
│   │   └── useReefContract.js
│   ├── utils/           # Utility functions
│   │   └── helpers.js
│   ├── styles/          # CSS files
│   │   └── index.css
│   ├── contracts/       # Contract ABIs
│   │   └── ReefBurner.json
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── scripts/
│   └── copy-abi.js      # Script to copy contract ABI
├── .env.example         # Example environment variables
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Key Technologies

- **React 19** - Latest React version
- **Vite** - Lightning-fast build tool
- **Framer Motion** - Smooth animations
- **ethers.js v5** - Ethereum library
- **@reef-defi/evm-provider** - Reef Chain provider

## 🎨 Design Features

### Color Scheme
- Reef Purple: `#7043ff`
- Reef Pink: `#ff43b9`
- Reef Blue: `#43b6ff`
- Fire Orange: `#ff6b35`

### Animations
- Floating particles background
- Burn effect animations
- Smooth transitions
- Pulsing indicators
- Glow effects

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop (1400px+)
- Tablet (768px - 1400px)
- Mobile (< 768px)

## 🔌 Wallet Connection

Supports:
- MetaMask
- Reef Extension Wallet
- Any EVM-compatible wallet

## 🎯 Features Overview

### Stats Panel
- Total REEF Burned
- Current Prize Pool
- Total Participants
- Total Winners
- Time Remaining in Round

### Burn Card
- Amount input with validation (950-1500 REEF)
- Quick amount buttons
- Bonus percentage indicator
- Distribution preview (65% burn, 27% prize, 8% creator)
- Burn button with loading state

### Participants List
- Real-time participant addresses
- Amount burned per participant
- Bonus percentage for each
- Highlight current user
- Auto-scroll with custom scrollbar

### Winner History
- Latest winners displayed first
- Prize amounts
- Round numbers
- Timestamps
- Animated table with glow effects

## 🚨 Important Notes

1. **Contract Address**: Make sure to set `VITE_CONTRACT_ADDRESS` in `.env` after deploying the contract
2. **Network**: Set `VITE_NETWORK` to either `testnet` or `mainnet`
3. **Wallet**: Users need a Reef-compatible wallet installed
4. **REEF Tokens**: Users need REEF tokens in their wallet to participate

## 🐛 Troubleshooting

### "No wallet detected"
- Install MetaMask or Reef Extension Wallet
- Refresh the page after installation

### "Contract not initialized"
- Make sure `VITE_CONTRACT_ADDRESS` is set in `.env`
- Verify the contract is deployed on the correct network

### "Transaction failed"
- Check if you have enough REEF in your wallet
- Ensure amount is between 950-1500 REEF
- Check if the round hasn't ended

### ABI not found
- Run `yarn copy-abi` after compiling the contract
- Make sure the contract is compiled first: `cd .. && yarn hardhat compile`

## 📝 Development Workflow

1. Deploy contract to testnet
2. Copy contract address
3. Update `.env` file
4. Run `yarn copy-abi`
5. Start development server: `yarn dev`
6. Test all features
7. Build for production: `yarn build`

## 🎉 Ready to Launch!

Once everything is working on testnet:
1. Deploy to mainnet
2. Update `.env` with mainnet contract address
3. Build production version
4. Deploy to hosting (Vercel, Netlify, etc.)
5. Announce to the community! 🚀

---

Built with ❤️ for the Reef Chain ecosystem 🌊
