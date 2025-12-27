# 🚀 REEF BURNER V4 - PRODUCTION DEPLOYMENT PLAN

**Date Created:** December 26, 2025
**Current Version:** V3 (Testing Phase)
**Target Version:** V4 (Production)
**Estimated Implementation Time:** 2-3 weeks

---

## 📊 EXECUTIVE SUMMARY

V4 will be the **production-ready deployment** with higher stakes (950-1500 REEF), 3-day rounds, and critical security/performance improvements identified during V3 testing phase.

**Key Changes:**
- 🔴 **5 Critical Security Fixes** (smart contract redeploy required)
- 🟡 **4 Medium Priority Improvements** (frontend + contract)
- 🟢 **6 Performance Optimizations** (frontend only)
- 🎯 **Production Constants Update** (950-1500 REEF, 3-day rounds)

---

## 🔴 CRITICAL FIXES (MUST IMPLEMENT)

### 1. Remove `block.difficulty` from Randomness Generation

**File:** `contracts/ReefBurnerV3.sol` (Line 428)

**Problem:**
- Reef Chain uses Proof-of-Stake (NPoS)
- `block.difficulty` is deprecated and returns **constant 0** on PoS chains
- Provides **zero entropy** to randomness generation
- Makes lottery outcome more predictable

**Current Code:**
```solidity
bytes32 blockEntropy = keccak256(abi.encodePacked(
    blockhash(randomCommitBlock + 3),
    blockhash(randomCommitBlock + 2),
    blockhash(randomCommitBlock + 1),
    block.difficulty,  // ❌ Returns 0 on PoS!
    block.timestamp
));
```

**Fix:**
```solidity
bytes32 blockEntropy = keccak256(abi.encodePacked(
    blockhash(randomCommitBlock + 3),
    blockhash(randomCommitBlock + 2),
    blockhash(randomCommitBlock + 1),
    // Removed block.difficulty - 3 blockhashes provide sufficient entropy
    block.timestamp
));
```

**Impact:** Improves randomness security for high-value prizes ($200+ USD in V4)

**Action Required:** Smart contract redeploy

---

### 2. Add Timelock for `gasIntensityLevel` Changes

**File:** `contracts/ReefBurnerV3.sol` (Lines 637-641)

**Problem:**
- Owner can instantly change gas intensity from 0 to 100 (10x cost increase!)
- No timelock protection (unlike `minBurnAmount` which has 2-day timelock)
- Could be used for griefing attack to block participation
- Users have no warning before sudden cost increase

**Current Code:**
```solidity
function setGasIntensity(uint256 _level) external onlyOwner {
    require(_level <= 100, "Max level is 100");
    gasIntensityLevel = _level;  // ❌ Instant change!
    emit GasIntensityUpdated(_level);
}
```

**Fix:**
```solidity
// Add state variables
uint256 public constant GAS_INTENSITY_TIMELOCK = 2 days;
uint256 public constant GAS_INTENSITY_THRESHOLD = 20; // Allow instant changes < 20
uint256 public pendingGasIntensity;
uint256 public gasIntensityUnlockTime;

function proposeGasIntensity(uint256 _level) external onlyOwner {
    require(_level <= 100, "Max level is 100");

    // If change is small, allow instant update
    if (_level <= gasIntensityLevel + GAS_INTENSITY_THRESHOLD &&
        _level >= gasIntensityLevel - GAS_INTENSITY_THRESHOLD) {
        gasIntensityLevel = _level;
        emit GasIntensityUpdated(_level);
        return;
    }

    // Large changes require timelock
    pendingGasIntensity = _level;
    gasIntensityUnlockTime = block.timestamp + GAS_INTENSITY_TIMELOCK;
    emit GasIntensityProposed(_level, gasIntensityUnlockTime);
}

function executeGasIntensityChange() external onlyOwner {
    require(block.timestamp >= gasIntensityUnlockTime, "Timelock not expired");
    require(pendingGasIntensity > 0, "No pending change");

    gasIntensityLevel = pendingGasIntensity;
    pendingGasIntensity = 0;
    gasIntensityUnlockTime = 0;

    emit GasIntensityUpdated(gasIntensityLevel);
}

// Add new event
event GasIntensityProposed(uint256 newLevel, uint256 unlockTime);
```

**Impact:** Protects users from sudden gas cost increases, maintains transparency

**Action Required:** Smart contract redeploy

---

### 3. Reorder `burn()` Function for Proper CEI Pattern

**File:** `contracts/ReefBurnerV3.sol` (Line 181)

**Problem:**
- `_checkAndBurnUnclaimedPrize()` is called at line 190 (BEFORE state updates)
- Violates Checks-Effects-Interactions pattern
- State changes happen at lines 204-218 (AFTER external call)
- Low risk now (burn address is safe), but poor practice

**Current Order:**
```solidity
function burn() external payable whenNotPaused nonReentrant {
    // 1. CHECKS (lines 182-188)
    require(msg.value >= minBurnAmount, "Amount below minimum");
    // ...

    // 2. INTERACTIONS (line 190) ❌ TOO EARLY!
    _checkAndBurnUnclaimedPrize();

    // 3. Calculate amounts (lines 192-197)
    uint256 burnAmount = (msg.value * BURN_PERCENTAGE) / 100;
    // ...

    // 4. View function (line 201)
    _performGasIntensiveOperations();

    // 5. EFFECTS (lines 204-218) ❌ SHOULD BE BEFORE INTERACTIONS!
    totalBurned += burnAmount;
    prizePool += prizeAmount;
    // ...

    // 6. More INTERACTIONS (lines 221-225)
    (bool creatorSuccess, ) = creatorWallet.call{value: creatorAmount}("");
    // ...
}
```

**Fix (Proper CEI Order):**
```solidity
function burn() external payable whenNotPaused nonReentrant {
    // 1. CHECKS
    require(msg.value >= minBurnAmount, "Amount below minimum");
    require(msg.value <= MAX_BURN_AMOUNT, "Amount exceeds maximum");
    require(
        roundParticipants[roundNumber].length < MAX_PARTICIPANTS_PER_ROUND,
        "Max participants reached"
    );

    // Auto-trigger if round ended
    if (block.timestamp >= roundStartTime + ROUND_DURATION && !randomCommitted) {
        _commitRandomness();
    }

    // 2. Calculate amounts (still in CHECKS phase)
    uint256 burnAmount = (msg.value * BURN_PERCENTAGE) / 100;
    uint256 prizeAmount = (msg.value * PRIZE_PERCENTAGE) / 100;
    uint256 creatorAmount = (msg.value * CREATOR_PERCENTAGE) / 100;

    // View function (read-only, safe anywhere)
    _performGasIntensiveOperations();

    // 3. EFFECTS - ALL state changes BEFORE any external calls
    totalBurned += burnAmount;
    prizePool += prizeAmount;
    totalReefBurned += burnAmount;

    if (userBurnedInRound[roundNumber][msg.sender] == 0) {
        roundParticipants[roundNumber].push(msg.sender);
    }

    if (!hasParticipated[msg.sender]) {
        hasParticipated[msg.sender] = true;
        totalParticipants++;
    }

    userBurnedInRound[roundNumber][msg.sender] += msg.value;
    totalUserBurned[msg.sender] += msg.value;

    // 4. INTERACTIONS - ALL external calls LAST
    _checkAndBurnUnclaimedPrize();  // ✅ Moved here

    (bool creatorSuccess, ) = creatorWallet.call{value: creatorAmount}("");
    require(creatorSuccess, "Creator transfer failed");

    (bool burnSuccess, ) = address(0x000000000000000000000000000000000000dEaD).call{value: burnAmount}("");
    require(burnSuccess, "Burn transfer failed");

    emit Burned(msg.sender, msg.value, burnAmount, prizeAmount, creatorAmount, roundNumber);
}
```

**Impact:** Follows best practices, prevents potential reentrancy if logic changes

**Action Required:** Smart contract redeploy

---

### 4. Improve Blockhash Validation

**File:** `contracts/ReefBurnerV3.sol` (Lines 389-392)

**Problem:**
- `blockhash()` returns `bytes32(0)` for blocks older than 256 blocks
- Current fallback (`blockhash(block.number - 1)`) is weak
- Rare edge case but critical for high-value prizes

**Current Code:**
```solidity
bytes32 futureBlockHash = blockhash(randomCommitBlock + 3);

if (futureBlockHash == bytes32(0)) {
    futureBlockHash = blockhash(block.number - 1);  // ⚠️ Weak fallback
}
```

**Fix:**
```solidity
bytes32 blockHash1 = blockhash(randomCommitBlock + 3);
bytes32 blockHash2 = blockhash(randomCommitBlock + 2);
bytes32 blockHash3 = blockhash(randomCommitBlock + 1);

// Require at least one valid blockhash
require(
    blockHash1 != bytes32(0) ||
    blockHash2 != bytes32(0) ||
    blockHash3 != bytes32(0),
    "Blockhashes expired - retry reveal within 256 blocks"
);

// Use all available blockhashes
bytes32 blockEntropy = keccak256(abi.encodePacked(
    blockHash1,
    blockHash2,
    blockHash3,
    block.timestamp
));
```

**Impact:** Prevents weak randomness in edge cases, requires timely reveal

**Action Required:** Smart contract redeploy

---

### 5. Add Missing Constructor Event

**File:** `contracts/ReefBurnerV3.sol` (Lines 165-174)

**Problem:**
- Initial `gasIntensityLevel = 50` is not emitted in constructor
- Off-chain indexers won't know initial value
- Analytics tools miss initial state

**Current Code:**
```solidity
constructor(address _creatorWallet) {
    require(_creatorWallet != address(0), "Invalid creator wallet");
    owner = msg.sender;
    creatorWallet = _creatorWallet;
    roundNumber = 1;
    roundStartTime = block.timestamp;
    _status = NOT_ENTERED;

    emit RoundStarted(roundNumber, roundStartTime);
    // ⚠️ Missing: emit GasIntensityUpdated(50);
}
```

**Fix:**
```solidity
constructor(address _creatorWallet) {
    require(_creatorWallet != address(0), "Invalid creator wallet");
    owner = msg.sender;
    creatorWallet = _creatorWallet;
    roundNumber = 1;
    roundStartTime = block.timestamp;
    _status = NOT_ENTERED;

    emit RoundStarted(roundNumber, roundStartTime);
    emit GasIntensityUpdated(gasIntensityLevel);  // ✅ Add this
}
```

**Impact:** Better transparency, complete event logging

**Action Required:** Smart contract redeploy

---

## 🟡 MEDIUM PRIORITY IMPROVEMENTS

### 6. Implement Dynamic Gas Estimation

**File:** `frontend/src/hooks/useReefContract.js` (Lines 455, 495, 550, 749)

**Problem:**
- All transactions use hardcoded gas limits
- May fail with high gas intensity or many participants

**Current Code:**
```javascript
const tx = await contract.burn({
    value: weiAmount,
    gasLimit: 500000  // ⚠️ Hardcoded
});
```

**Fix:**
```javascript
// Estimate gas dynamically
const estimatedGas = await contract.estimateGas.burn({
    value: weiAmount
});

const tx = await contract.burn({
    value: weiAmount,
    gasLimit: estimatedGas.mul(120).div(100)  // 20% buffer
});
```

**Apply to:**
- `burn()` (currently 500,000)
- `triggerRoundEnd()` (currently 500,000)
- `revealWinner()` (currently 800,000)
- `claimPrize()` (currently 500,000)

**Impact:** Prevents transaction failures, optimizes gas costs

**Action Required:** Frontend update only

---

### 7. Add Zero Participants Check Before Trigger

**File:** `contracts/ReefBurnerV3.sol` (Line 476)

**Problem:**
- Can trigger lottery with zero participants (wastes gas)
- Emits confusing events for empty rounds

**Current Code:**
```solidity
function triggerRoundEnd() external whenNotPaused {
    require(
        block.timestamp >= roundStartTime + ROUND_DURATION,
        "Round not finished"
    );
    require(!randomCommitted, "Already committed");
    // ⚠️ No check for participants

    _commitRandomness();
}
```

**Fix:**
```solidity
function triggerRoundEnd() external whenNotPaused {
    require(
        block.timestamp >= roundStartTime + ROUND_DURATION,
        "Round not finished"
    );
    require(!randomCommitted, "Already committed");
    require(
        roundParticipants[roundNumber].length > 0,
        "No participants in round"  // ✅ Add this
    );

    _commitRandomness();
}
```

**Impact:** Prevents wasted gas, cleaner event logs

**Action Required:** Smart contract redeploy

---

### 8. Optimize Polling Frequency

**File:** `frontend/src/hooks/useReefContract.js` (Lines 598-605)

**Problem:**
- Polls every 30 seconds regardless of activity
- With 100 users = 600 RPC calls per 30s = 1200/minute
- Risk of rate limiting

**Current Code:**
```javascript
// Refresh every 30 seconds
const interval = setInterval(() => {
    fetchAllData();  // 6 contract methods
}, 30000);
```

**Fix (Adaptive Polling):**
```javascript
// Adaptive polling based on round state
const interval = setInterval(() => {
    // Poll frequently when round ending or winner pending
    if (timeRemaining < 300 || randomnessStatus.committed) {
        fetchAllData();  // All 6 methods
    } else {
        // Only update stats during quiet periods
        fetchStatistics();  // Just 1 method
    }
}, timeRemaining < 300 || randomnessStatus.committed ? 10000 : 60000);
```

**Impact:** 80% reduction in RPC calls during quiet periods

**Action Required:** Frontend update only

---

### 9. Validate Creator Wallet in Constructor

**File:** `contracts/ReefBurnerV3.sol` (Line 165)

**Problem:**
- No check that `_creatorWallet != msg.sender`
- If same address, gets 73% of funds (8% creator + 65% burn via dead address)
- Defeats deflationary mechanism

**Current Code:**
```solidity
constructor(address _creatorWallet) {
    require(_creatorWallet != address(0), "Invalid creator wallet");
    // ⚠️ Missing: check != msg.sender
    owner = msg.sender;
    creatorWallet = _creatorWallet;
}
```

**Fix:**
```solidity
constructor(address _creatorWallet) {
    require(_creatorWallet != address(0), "Invalid creator wallet");
    require(_creatorWallet != msg.sender, "Creator cannot be owner");  // ✅ Add
    owner = msg.sender;
    creatorWallet = _creatorWallet;
}
```

**Impact:** Prevents accidental misconfiguration

**Action Required:** Smart contract redeploy

---

## 🟢 PERFORMANCE OPTIMIZATIONS (Frontend)

### 10. Code Splitting (Bundle Size Reduction)

**File:** `frontend/vite.config.js`

**Problem:**
- Single bundle: 1,014 KB (1 MB!)
- All libraries in one file
- Slow initial load (5.9s FCP, 6.1s LCP)

**Fix:**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-polkadot': [
            '@polkadot/api',
            '@polkadot/util',
            '@polkadot/util-crypto'
          ],
          'vendor-reef': ['@reef-defi/evm-provider'],
          'vendor-motion': ['framer-motion'],
          'vendor-ethers': ['ethers']
        }
      }
    }
  }
});
```

**Expected Outcome:**
- Bundle: 1,014 KB → 5 chunks of ~200 KB each
- Parallel loading (much faster!)
- Better caching (vendor chunks don't change)

**Impact:**
- FCP: 5.9s → 2-3s
- LCP: 6.1s → 3-4s
- Performance score: 47 → 75-80

**Action Required:** Frontend config update

---

### 11. Lazy Loading for Large Components

**File:** `frontend/src/App.jsx`

**Problem:**
- All components load immediately
- WinnerHistory and AboutModal are large but not always needed

**Fix:**
```javascript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const WinnerHistory = lazy(() => import('./components/WinnerHistory'));
const AboutModal = lazy(() => import('./components/AboutModal'));

function App() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {winners.length > 0 && <WinnerHistory winners={winners} />}
      </Suspense>

      <Suspense fallback={null}>
        {showAboutModal && <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />}
      </Suspense>
    </>
  );
}
```

**Impact:**
- Initial bundle: -15%
- Faster initial render
- Components load only when needed

**Action Required:** Frontend component update

---

### 12. Tree Shaking for ethers/polkadot

**File:** Throughout frontend

**Problem:**
- Importing entire libraries when only using specific functions

**Current:**
```javascript
import { ethers } from 'ethers';
// Includes entire ethers library (~500 KB)
```

**Fix:**
```javascript
// Import only what's needed
import { parseEther, formatEther } from 'ethers/lib/utils';
import { Contract } from 'ethers/lib/contract';
import { JsonRpcProvider } from 'ethers/lib/providers';
```

**Impact:** -20-30% from ethers bundle size

**Action Required:** Refactor imports throughout frontend

---

### 13. Remove Console Logs in Production

**File:** `frontend/vite.config.js`

**Problem:**
- Hundreds of `console.log()` statements in production
- Increases bundle size (~5-10 KB)
- Slower execution

**Fix:**
```javascript
// vite.config.js
export default defineConfig({
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
});
```

**Impact:**
- Bundle: -5-10 KB
- Faster execution
- No information leakage

**Action Required:** Config update

---

### 14. Optimize Block Polling

**File:** `frontend/src/hooks/useReefContract.js` (Lines 534-545, 702-717)

**Problem:**
- Tight polling loops every 3-5 seconds
- Multiple RPC calls during waiting

**Current:**
```javascript
while (true) {
    const latestBlock = await provider.getBlockNumber();
    if (latestBlock >= targetBlock) break;
    await new Promise(resolve => setTimeout(resolve, 3000));  // Poll every 3s
}
```

**Fix (Exponential Backoff):**
```javascript
const blocksNeeded = targetBlock - currentBlock;
const estimatedWaitTime = blocksNeeded * 15000; // 15s per block

// Wait 90% of estimated time, then start polling
await new Promise(resolve => setTimeout(resolve, estimatedWaitTime * 0.9));

// Then verify with single check
const finalBlock = await provider.getBlockNumber();
if (finalBlock >= targetBlock) {
    // Proceed
} else {
    // Wait one more block time and check again
    await new Promise(resolve => setTimeout(resolve, 15000));
}
```

**Impact:** 80% reduction in RPC calls during block waiting

**Action Required:** Frontend hook update

---

### 15. Add Service Worker for Caching

**File:** Create `frontend/src/sw.js`

**Problem:**
- No caching strategy
- Static assets re-downloaded every visit

**Fix:**
```javascript
// Install Vite PWA plugin
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/rpc\.reefscan\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'reef-rpc-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300 // 5 minutes
              }
            }
          }
        ]
      }
    })
  ]
});
```

**Impact:**
- Repeat visits: instant load
- Offline capability (read-only)
- Better UX for frequent users

**Action Required:** Add PWA plugin

---

## 🎯 PRODUCTION CONSTANTS UPDATE

### Constants to Change in Smart Contract

**File:** `contracts/ReefBurnerV4.sol`

**Current (V3 Testing):**
```solidity
uint256 public constant ROUND_DURATION = 5 minutes;
uint256 public minBurnAmount = 5 ether;      // 5 REEF
uint256 public constant MAX_BURN_AMOUNT = 8 ether;  // 8 REEF
```

**New (V4 Production):**
```solidity
uint256 public constant ROUND_DURATION = 3 days;
uint256 public minBurnAmount = 950 ether;      // 950 REEF
uint256 public constant MAX_BURN_AMOUNT = 1500 ether;  // 1500 REEF
```

---

### Frontend Constants to Update

**File:** `frontend/src/utils/helpers.js`

**Bonus Calculation:**
```javascript
// Update from testing (5-8 REEF) to production (950-1500 REEF)
export const calculateBonus = (amount) => {
  // V4 PRODUCTION VALUES
  if (amount >= 1500) return 3;  // 1500+ REEF = 103 tickets
  if (amount >= 1200) return 2;  // 1200+ REEF = 102 tickets
  if (amount >= 1050) return 1;  // 1050+ REEF = 101 tickets
  return 0;                      // 950-1049 REEF = 100 tickets
};
```

**File:** `frontend/src/App.jsx`

**UI Text Updates:**
```javascript
// Line 12: Comment
const USE_MOCK = false; // ✅ PRODUCTION - Reef Mainnet (950-1500 REEF, 3 days)

// Line 706: Footer text
<p>
  🎯 PRODUCTION: Range: 950-1500 REEF per transaction • Lottery every 3 days
</p>
```

**File:** `frontend/src/components/BurnCard.jsx`

**Validation & Bonus Logic:**
```javascript
// Line 47: Update validation
const isValid = parseFloat(burnAmount) >= 950 && parseFloat(burnAmount) <= 1500;

// Lines 36-44: Update bonus thresholds
if (amount >= 1500) {
  setBonusPercent(3);
} else if (amount >= 1200) {
  setBonusPercent(2);
} else if (amount >= 1050) {
  setBonusPercent(1);
} else {
  setBonusPercent(0);
}
```

**File:** `frontend/.env`

```bash
# Update title
# Reef Burner V4 Frontend Configuration - MAINNET PRODUCTION

# Update parameters
# 🚀 PRODUCTION: 950-1500 REEF, 3-day lottery
```

---

## 📅 IMPLEMENTATION TIMELINE

### Phase 1: Smart Contract Development (Week 1)
**Days 1-3:**
- [ ] Create `ReefBurnerV4.sol` from V3 base
- [ ] Implement Fix #1: Remove block.difficulty
- [ ] Implement Fix #2: Add gasIntensity timelock
- [ ] Implement Fix #3: Reorder burn() for CEI
- [ ] Implement Fix #4: Improve blockhash validation
- [ ] Implement Fix #5: Add constructor events
- [ ] Implement Fix #7: Zero participants check
- [ ] Implement Fix #9: Validate creator wallet
- [ ] Update production constants (950-1500 REEF, 3 days)

**Days 4-5:**
- [ ] Write comprehensive test suite for V4
- [ ] Test all edge cases (zero participants, expired blockhashes, etc.)
- [ ] Gas optimization review
- [ ] Security audit preparation

**Days 6-7:**
- [ ] Deploy to Reef testnet
- [ ] Integration testing with frontend
- [ ] Community testing round

---

### Phase 2: Frontend Optimizations (Week 2)
**Days 8-10:**
- [ ] Implement Fix #6: Dynamic gas estimation
- [ ] Implement Fix #8: Adaptive polling
- [ ] Implement Fix #10: Code splitting (vite.config.js)
- [ ] Implement Fix #11: Lazy loading components
- [ ] Implement Fix #12: Tree shaking imports
- [ ] Implement Fix #13: Remove console logs
- [ ] Implement Fix #14: Optimize block polling

**Days 11-12:**
- [ ] Update production constants in frontend
- [ ] Update bonus calculation (950-1500 thresholds)
- [ ] Update UI text (3 days, production values)
- [ ] Update validation ranges
- [ ] Performance testing (target: 80+ score)

**Days 13-14:**
- [ ] Implement Fix #15: Service Worker / PWA (optional)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness check
- [ ] Final UX review

---

### Phase 3: Deployment & Launch (Week 3)
**Days 15-17:**
- [ ] Deploy V4 contract to Reef mainnet
- [ ] Update frontend config with new contract address
- [ ] Deploy frontend to Vercel
- [ ] Smoke testing on production

**Days 18-19:**
- [ ] Soft launch announcement
- [ ] Monitor first 5 rounds closely
- [ ] Collect community feedback
- [ ] Fix any critical issues

**Days 20-21:**
- [ ] Public launch announcement
- [ ] Marketing push
- [ ] Documentation update
- [ ] Analytics setup

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Smart Contract
- [ ] All 5 critical fixes implemented
- [ ] All medium priority fixes implemented
- [ ] Production constants updated (950-1500 REEF, 3 days)
- [ ] Test coverage > 90%
- [ ] Gas optimization complete
- [ ] Security audit completed (recommended if TVL > $10k)
- [ ] Deployed to testnet and tested
- [ ] Creator wallet configured correctly
- [ ] Owner multisig ready (optional but recommended)

### Frontend
- [ ] All performance fixes implemented
- [ ] Code splitting working (bundle < 500 KB)
- [ ] Lazy loading functional
- [ ] Dynamic gas estimation active
- [ ] Production constants updated
- [ ] Bonus calculation matches contract
- [ ] UI text updated (3 days, production values)
- [ ] Console logs removed
- [ ] Performance score > 80
- [ ] Mobile responsive
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Brave)

### Infrastructure
- [ ] Contract address updated in .env
- [ ] Vercel deployment configured
- [ ] Environment variables set
- [ ] Analytics configured (Google Analytics / Plausible)
- [ ] Error monitoring setup (Sentry / LogRocket)
- [ ] RPC endpoint stable and reliable
- [ ] Backup RPC endpoints configured

### Documentation
- [ ] README.md updated with V4 info
- [ ] CONTRACTS_OVERVIEW.md updated
- [ ] API documentation updated
- [ ] User guide updated
- [ ] Troubleshooting guide created
- [ ] FAQ updated

### Marketing
- [ ] Announcement blog post drafted
- [ ] Social media posts prepared
- [ ] Community Discord/Telegram announcement ready
- [ ] ReefScan verification submitted
- [ ] CoinGecko/CoinMarketCap listing prepared (if applicable)

---

## 🎯 SUCCESS METRICS (V4 Goals)

### Technical Metrics
- **Performance Score:** 80+ (current: 47)
- **Bundle Size:** < 500 KB (current: 1,014 KB)
- **FCP:** < 2s (current: 5.9s)
- **LCP:** < 3s (current: 6.1s)
- **TBT:** < 200ms (current: 650ms)
- **Test Coverage:** > 90%
- **Gas Optimization:** < 300k gas per burn

### Business Metrics
- **Total Burned:** 100,000+ REEF in first month
- **Active Participants:** 500+ unique addresses
- **Rounds Completed:** 10+ (30 days)
- **Prize Pool:** 50,000+ REEF
- **Community Size:** 1,000+ members
- **Uptime:** 99.9%

---

## 🚨 RISK MITIGATION

### High-Risk Areas
1. **Smart Contract Bugs**
   - Mitigation: Comprehensive testing + professional audit
   - Backup: Pause function available, can stop new burns

2. **Randomness Manipulation**
   - Mitigation: Multi-source entropy, commit-reveal, blockhash validation
   - Acceptable: Attack cost >> prize value ($200)

3. **Gas Price Spikes**
   - Mitigation: Dynamic gas estimation, adaptive limits
   - Backup: gasIntensity can be lowered (with timelock)

4. **RPC Rate Limiting**
   - Mitigation: Adaptive polling, exponential backoff
   - Backup: Multiple RPC endpoints configured

5. **Frontend Bugs**
   - Mitigation: Extensive testing, gradual rollout
   - Backup: Quick redeploy possible (frontend only)

---

## 📞 POST-DEPLOYMENT SUPPORT

### Monitoring (First 30 Days)
- [ ] Daily contract state checks
- [ ] Daily participant count tracking
- [ ] Weekly gas cost analysis
- [ ] Weekly performance metrics review
- [ ] Community feedback collection
- [ ] Error log monitoring

### Maintenance Schedule
- **Week 1:** Check every 4 hours
- **Week 2:** Check every 8 hours
- **Week 3-4:** Check daily
- **Month 2+:** Check every 3 days

---

## 📝 NOTES & REMINDERS

### From V3 Testing Learnings
1. ✅ Community loves fast rounds (5 min in testing)
   - **Decision:** Keep automated reveal, but 3 days is good for production

2. ✅ Error messages are critical
   - **Decision:** Keep all user-friendly error improvements from V3

3. ✅ Bonus system works well
   - **Decision:** Keep weighted tickets (100 + bonus), just update thresholds

4. ✅ ReefScan links were problematic (slow/blank)
   - **Decision:** Skip explorer links for now, add in future update

5. ✅ Auto-refresh at 30s is good balance
   - **Decision:** Keep 30s but make adaptive (10s when action needed)

### Questions to Resolve Before V4
- [ ] Should we implement multi-sig ownership? (Recommended for $200+ prizes)
- [ ] What should minBurnAmount be initially? (950 or higher?)
- [ ] Should we add a "beta" period with reduced max burn (e.g., 950-1200)?
- [ ] Do we want emergency pause duration limit? (Currently unlimited)
- [ ] Should creator wallet be immutable or updatable with timelock?

---

## 🔗 REFERENCES

### Technical Documentation
- Solidity Style Guide: https://docs.soliditylang.org/en/latest/style-guide.html
- Checks-Effects-Interactions Pattern: https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html
- Vite Performance: https://vitejs.dev/guide/performance.html
- React Code Splitting: https://react.dev/reference/react/lazy

### Security Resources
- ConsenSys Smart Contract Best Practices: https://consensys.github.io/smart-contract-best-practices/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/
- Reef Chain Documentation: https://docs.reef.io/

### Audit Firms (If Needed)
- OpenZeppelin: https://openzeppelin.com/security-audits
- ConsenSys Diligence: https://consensys.net/diligence/
- Trail of Bits: https://www.trailofbits.com/
- Hacken: https://hacken.io/

---

**Last Updated:** December 26, 2025
**Version:** 1.0
**Status:** Planning Phase
**Next Review:** Before V4 implementation starts

---

*This document is a living plan and will be updated as implementation progresses.*
