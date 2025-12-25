require("@reef-defi/hardhat-reef");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "reef_mainnet",
  networks: {
    reef_testnet: {
      url: "wss://rpc-testnet.reefscan.com/ws",
      seeds: {
        // Add your seed phrase here when ready to deploy
        // NEVER commit this to version control!
        // Example:
        // testAccount: "your twelve word seed phrase goes here"
      },
      scanUrl: "https://testnet.reefscan.com"
    },
    reef_mainnet: {
      url: "https://rpc.reefscan.com",
      seeds: {
        // Seed phrase removed for security
        // V2 SECURE contract: 0xeD978A516e6f1aABbd4395307A7B7d0C1B422dC6
      },
      scanUrl: "https://reefscan.com"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
