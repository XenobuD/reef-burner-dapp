# 🧪 Local Demo Testing Guide

Test Reef Burner frontend **locally** without blockchain!

## ✨ Ce Face DEMO Mode?

- ✅ Arată toate animațiile și UI
- ✅ Poți "conecta wallet" (mock address)
- ✅ Poți "burn" tokens (simulat)
- ✅ Vezi statistici fake (dar realiste)
- ✅ Vezi participanți și câștigători mock
- ❌ **NU face tranzacții reale**
- ❌ **NU se conectează la blockchain**
- ❌ **NU costă REEF**

## 🔐 Securitate Wallet

### Cum Funcționează Conectarea:

1. **Browser Extension** (MetaMask/Reef):
   - Wallet-ul rămâne în extensie
   - **NU trimite private key nicăieri**
   - Frontend primește doar **adresa publică** (0x...)

2. **Ce Primește dApp-ul:**
   ```javascript
   // Doar address public
   account = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4"
   ```

3. **Ce NU Primește dApp-ul:**
   - ❌ Private key
   - ❌ Seed phrase
   - ❌ Password

### Unde Se Salvează Date:

- **Browser Memory** (temporar):
  - Adresa wallet-ului (până închizi tab-ul)
  - Session data

- **Blockchain** (permanent - doar când nu e DEMO):
  - Transactions
  - Burns
  - Winners

- **Nicăieri altundeva**:
  - ❌ Nu există backend server
  - ❌ Nu există bază de date
  - ❌ Nu se salvează local pe PC

## 🚀 Start DEMO Mode

### 1. Instalează Dependencies:

```bash
cd frontend
yarn install
```

### 2. Start Development Server:

```bash
yarn dev
```

### 3. Deschide Browser:

Mergi la [http://localhost:3000](http://localhost:3000)

## 🎮 Testează Funcțiile

### Test 1: UI și Animații ✅
- Vezi background-ul animat cu particule
- Vezi statisticile (mock data)
- Vezi lista de participanți
- Vezi tabelul cu câștigători

### Test 2: Connect Wallet 🔌

**Dacă AI MetaMask instalat:**
- Click "Connect Wallet"
- Va apărea popup MetaMask
- Approve connection
- Vezi adresa ta reală

**Dacă NU AI MetaMask:**
- Click "Connect Wallet"
- Va folosi mock address automat
- `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4`

### Test 3: Burn Tokens 🔥

1. Alege suma (950-1500 REEF)
2. Vezi preview-ul:
   - 65% burned
   - 27% prize
   - 8% creator
3. Click "BURN"
4. Va apărea alert: "MOCK TRANSACTION SUCCESSFUL"
5. Te adaugi în lista de participanți

### Test 4: Vezi Bonus +3% ⭐

1. Setează amount la **1500 REEF**
2. Vezi indicator: "⭐ +3% Better Odds! ⭐"
3. Vezi în preview bonus-ul

## 🔄 Switch la REAL Mode

**Când ești gata să testezi pe blockchain:**

1. **Editează** [src/App.jsx](src/App.jsx):
```javascript
// Schimbă de la true la false
const USE_MOCK = false;
```

2. **Asigură-te că ai:**
   - ✅ Contract deployed
   - ✅ ABI copiat (`yarn copy-abi`)
   - ✅ `.env` configurat cu contract address
   - ✅ REEF tokens în wallet

3. **Restart server:**
```bash
# Ctrl+C să oprești
yarn dev
```

## 📊 Mock Data Explicat

### Statistics:
- **Total Participants**: 156 (fake)
- **Total Winners**: 12 (fake)
- **Total REEF Burned**: 245,678.50 (fake)
- **Prize Pool**: 45,234.20 (fake)
- **Time Remaining**: ~2 days, 5h (countdown real)

### Participants:
- 5 participanți mock cu diverse sume
- Dacă te conectezi, TE adaugi în listă când "burni"

### Winners:
- 3 câștigători mock cu prize-uri
- Unul de ieri, unul de acum 3 zile, etc.

## ⚠️ Importante

### În DEMO Mode:

1. **Wallet Connection:**
   - Dacă ai MetaMask → folosește adresa ta reală (SAFE)
   - Dacă nu → folosește mock address
   - **Nimic nu se trimite pe blockchain!**

2. **Burn Transactions:**
   - Nu consumă gas
   - Nu costă REEF
   - Nu face tranzacții reale
   - Doar simulare pentru UI testing

3. **Date:**
   - Totul e fake/mock
   - Se resetează când refreshezi pagina
   - Nu se salvează nicăieri

### În REAL Mode:

1. **Ai nevoie de:**
   - Reef testnet/mainnet
   - REEF tokens în wallet
   - Contract deployed
   - Gas pentru tranzacții

2. **Tranzacțiile sunt REALE:**
   - Consumă gas
   - Costă REEF
   - Sunt permanente pe blockchain
   - **NU SE POT ANULA!**

## 🎨 Ce Poți Testa

✅ **Design și Animații:**
- Background particles
- Card animations
- Hover effects
- Transitions
- Responsive design (resize browser)

✅ **Funcționalitate UI:**
- Input validation (950-1500)
- Quick amount buttons
- Bonus indicator
- Distribution preview
- Loading states

✅ **Wallet Integration (superficial):**
- Connect button
- Address display
- Disconnect button
- Your address highlighting în participants

✅ **Data Display:**
- Statistics panel
- Participants list
- Winner history
- Time countdown

❌ **NU Poți Testa (doar în REAL mode):**
- Actual blockchain transactions
- Real winner selection
- Smart contract functions
- Gas consumption
- Actual burns

## 🐛 Troubleshooting

### "Cannot find module..."
```bash
yarn install
```

### Animațiile nu merg smooth
- Verifică că browser-ul e updated
- Dezactivează ad-blockers
- Try incognito mode

### "MetaMask not detected" dar AI MetaMask
- Refresh pagina
- Check că MetaMask e unlocked
- Try alt browser

### Vrei să resetezi mock data
- Refresh pagina (F5)
- Sau restart dev server

## 📝 Testing Checklist

Înainte de deploy pe testnet, verifică:

- [ ] Toate animațiile funcționează
- [ ] UI arată bine pe desktop
- [ ] UI arată bine pe mobile (resize)
- [ ] Connect wallet funcționează
- [ ] Disconnect wallet funcționează
- [ ] Input validation funcționează (950-1500)
- [ ] Bonus indicator apare corect
- [ ] Distribution math e corect (65/27/8)
- [ ] Loading states funcționează
- [ ] Burn button disabled când invalid
- [ ] Time countdown se actualizează
- [ ] Participants list scroll funcționează
- [ ] Winner table se afișează bine

## 🚀 Next Steps

1. ✅ Testează în DEMO mode
2. ✅ Fix orice probleme UI
3. ✅ Deploy contract pe testnet
4. ✅ Switch la REAL mode
5. ✅ Testează cu REEF testnet
6. ✅ Deploy când totul merge

---

**Distracție plăcută testând! 🎮🔥**
