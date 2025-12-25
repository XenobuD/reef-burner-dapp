# 🚀 Deploy ReefBurnerV2 cu Remix IDE

## Pas 1: Pregătește contractul

Contractul e gata: `contracts/ReefBurnerV2.sol`

## Pas 2: Deschide Remix

1. Du-te la: https://remix.ethereum.org
2. Click pe "File Explorer" (icon folder)
3. Click pe "+" pentru fișier nou
4. Numele: `ReefBurnerV2.sol`

## Pas 3: Copiază contractul

Copiază TOT conținutul din `d:\Reef Chain Project\reef-burner-dapp\contracts\ReefBurnerV2.sol` în Remix.

## Pas 4: Compilează

1. Click pe "Solidity Compiler" (icon-ul S)
2. Selectează Compiler: `0.8.4`
3. Click "Compile ReefBurnerV2.sol"
4. Așteaptă să vezi ✅ verde

## Pas 5: Connect Reef Wallet

1. Deschide Reef Extension Wallet
2. Asigură-te că ești pe **REEF MAINNET**
3. Asigură-te că ai suficient REEF (50-100 REEF)

## Pas 6: Deploy în Remix

1. Click pe "Deploy & Run Transactions" (icon Ethereum)
2. În "ENVIRONMENT" selectează **"Injected Provider - MetaMask"**
   - Reef Extension va apărea (e compatibil cu MetaMask API)
3. Verifică că apare adresa ta și REEF balance
4. În "CONTRACT" selectează **"ReefBurnerV2"**
5. În câmpul lângă "Deploy" introduce:
   ```
   "0x609b6AC8b8E8e721d913790b6c2c3a1238Ee8543"
   ```
   (Asta e CREATOR WALLET - va primi 8% FOREVER!)

## Pas 7: Deploy!

1. Click butonul portocaliu "**transact**" (sau "Deploy")
2. Reef Wallet va deschide popup
3. Verifică:
   - Gas fee e rezonabil
   - Network: Reef Mainnet
4. Click "**Sign**"
5. Așteaptă confirmarea

## Pas 8: Salvează Contract Address

După deploy vei vedea:
- Contract deployed la: `0x...` (adresa nouă)
- Copiază această adresă!

## Pas 9: Verifică pe ReefScan

1. Du-te la: https://reefscan.com
2. Caută contract address-ul
3. Verifică că e deployed corect

## Pas 10: Verify Contract pe ReefScan

### Opțiunea A: Manual pe ReefScan

1. Du-te la contract pe ReefScan
2. Click "Contract" tab
3. Click "Verify & Publish"
4. Selectează:
   - Compiler: `v0.8.4+commit.c7e474f2`
   - Optimization: `Yes` cu `200` runs
5. Copiază TOT codul din `ReefBurnerV2.sol`
6. Click "Verify & Publish"

### Opțiunea B: Cu Hardhat

```bash
npx hardhat verify --network reef_mainnet <CONTRACT_ADDRESS> "0x609b6AC8b8E8e721d913790b6c2c3a1238Ee8543"
```

## Pas 11: Update Frontend

Edit `frontend/src/config.js` (sau unde ai config):

```javascript
export const CONTRACT_ADDRESS = "0xNouaAdresaContractV2";
```

## Pas 12: Copiază ABI

```bash
cp contracts/artifacts/contracts/ReefBurnerV2.sol/ReefBurnerV2.json frontend/src/contracts/ReefBurnerABI.json
```

Sau manual:
1. În Remix, după compilare, click pe "Compilation Details"
2. Copiază ABI
3. Pune-l în `frontend/src/contracts/ReefBurnerABI.json`

## Gata! ✅

V2 e deployed și gata de folosit!

**Contract Address V2:** (salvează aici după deploy)
```
0x_____________________
```

**Deployed by:** 0x609b6AC8b8E8e721d913790b6c2c3a1238Ee8543
**Creator Wallet:** 0x609b6AC8b8E8e721d913790b6c2c3a1238Ee8543 (IMMUTABLE)
**Network:** Reef Mainnet

---

Created by XenobuD
