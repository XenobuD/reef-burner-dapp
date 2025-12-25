// Reef Burner V2 Configuration
// This file is committed to git and contains public contract addresses

export const config = {
  // Contract address - V2 FAST TEST (5 minute rounds for quick testing)
  CONTRACT_ADDRESS: '0x82EE1373C213D291BD4839C6917F675cAD4ab469',

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
