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
        // Seed phrase removed for security after V2 redeploy
        // New contract deployed at: 0x840f4f3acFeC2Ff45F714994b05363F1fD037dB5
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
