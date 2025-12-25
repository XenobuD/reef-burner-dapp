# Reef Burner dApp - Next Steps

## Status
Project initialized with Hardhat and Reef tools installed.

## Next Session Tasks:

### 1. Initialize Hardhat
```bash
cd "d:\Reef Chain Project\reef-burner-dapp"
npx hardhat init
# Choose: "Create a basic sample project"
```

### 2. Configure for Reef Chain
Create `hardhat.config.js`:
```javascript
require("@reef-defi/hardhat-reef");

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "reef_testnet",
  networks: {
    reef_testnet: {
      url: "wss://rpc-testnet.reefscan.com/ws",
      seeds: {
        // Add your seed phrase here (NEVER commit this!)
      },
    },
  },
};
```

### 3. Write Smart Contract
Create `contracts/ReefBurner.sol`:
- Gas-intensive burn mechanism
- Lottery/raffle functionality
- Prize pool management
- Events for tracking

### 4. Write Tests
Create `test/ReefBurner.test.js`

### 5. Build Frontend
- React app with Web3
- Connect to Reef wallet
- UI for burning & playing

## Remember:
- Test on Reef TESTNET first
- Wait for chain upgrade before mainnet deployment
- Never commit private keys or seed phrases!

## Resources:
- Reef Docs: https://docs.reef.io/
- Hardhat Reef: https://github.com/reef-defi/hardhat-reef
- Reefscan Testnet: https://testnet.reefscan.com/
