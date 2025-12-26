// Reef Burner V2 Configuration
// This file is committed to git and contains public contract addresses

export const config = {
  // Contract address - V3 ULTRA SECURE (5 minute rounds, enhanced security)
  CONTRACT_ADDRESS: '0xAa349830e524ccbbA19c370FE0C6fd2Dbe8BeeDE',

  // Network
  NETWORK: 'reef_mainnet',

  // RPC URLs
  TESTNET_RPC: 'wss://rpc-testnet.reefscan.com/ws',
  MAINNET_RPC: 'wss://rpc.reefscan.com/ws',

  // Block explorers
  TESTNET_EXPLORER: 'https://testnet.reefscan.com',
  MAINNET_EXPLORER: 'https://reefscan.com',
};

// Get config value with fallback to .env
export const getConfig = (key) => {
  // Priority: 1. hardcoded config, 2. env variable, 3. default
  const envKey = `VITE_${key}`;
  return config[key] || import.meta.env[envKey] || null;
};
