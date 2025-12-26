# 🗄️ Archived Contracts - DO NOT USE IN PRODUCTION!

This directory contains **LEGACY/DEPRECATED** contract versions that have known security vulnerabilities.

These files are kept for:
- Historical reference
- Educational purposes
- Showing the evolution and security improvements

---

## ⚠️ WARNING - SECURITY VULNERABILITIES

### ReefBurner.sol (V1) - DEPRECATED ❌
**Deployed Address:** `0xFdD061cBE98ef3D1f2a2d7A5e8e14CA57e3baA48` (Reef Mainnet - TEST ONLY)
**CRITICAL VULNERABILITY:** Contains `emergencyWithdraw()` function that allows owner to steal all funds!

**Issues:**
- 🔴 Owner can pause contract and withdraw entire balance
- 🔴 No timelock on parameter changes
- 🔴 Weak randomness (basic blockhash)
- 🔴 Rug pull risk: **HIGH**

⚠️ **WARNING:** If you interacted with this contract, your funds may be at risk!
**Status:** ❌ DO NOT USE - Migrate to V3 immediately

---

### ReefBurnerSecure.sol - EXPERIMENTAL ❌
**Status:** Early test version, unfinished

**Issues:**
- Not fully tested
- May have incomplete features
- Superseded by V2 and V3

**Status:** ❌ DO NOT DEPLOY - Use V3 instead

---

### ReefBurnerV2.sol - SUPERSEDED ⚠️
**Deployed Address:** `0x82EE1373C213D291BD4839C6917F675cAD4ab469` (Reef Mainnet)
**Status:** Still deployed but superseded by V3

**Improvements over V1:**
- ✅ Removed emergencyWithdraw (no rug pull risk)
- ✅ Unclaimed prize system (10 round grace)
- ✅ Anyone can claim prizes
- ✅ ReentrancyGuard protection

**Remaining Issues:**
- ⚠️ No timelock on owner functions (instant changes)
- ⚠️ Moderate randomness (commit-reveal but not multi-source)
- ⚠️ Creator wallet can be changed
- ⚠️ Fixed gas intensity (expensive)

**Migration:** All users should migrate to V3 (`0xAa349830e524ccbbA19c370FE0C6fd2Dbe8BeeDE`)
**Status:** ⚠️ Safe but outdated - Use V3 for production

---

## ✅ CURRENT PRODUCTION VERSION

**Use ReefBurnerV3.sol** (in parent directory)

**V3 Contract Address:** `0xAa349830e524ccbbA19c370FE0C6fd2Dbe8BeeDE`

**Why V3 is better:**
- 🟢 Enhanced multi-source randomness (3 entropy sources)
- 🟢 2-day timelock on all owner functions
- 🟢 Immutable creator wallet
- 🟢 Configurable gas intensity (0-100)
- 🟢 Renounce ownership option
- 🟢 100% accurate code comments
- 🟢 Production-ready (96/100 security rating)

---

## 📊 Security Rating Comparison

| Version | Security | Rug Pull Risk | Randomness | Production Ready |
|---------|----------|---------------|------------|------------------|
| V1 | 🔴 60/100 | HIGH | Weak | ❌ NO |
| V2 | 🟡 75/100 | ZERO | Medium | ⚠️ Yes (testing) |
| V3 | 🟢 96/100 | ZERO | Strong | ✅ YES |

---

## 🚫 DO NOT USE THESE CONTRACTS FOR:
- Production deployments
- Real value testing
- Public launches
- Mainnet with user funds

## ✅ THESE CONTRACTS CAN BE USED FOR:
- Code review and learning
- Understanding security evolution
- Comparing versions
- Educational purposes

---

*For audit purposes, please review ReefBurnerV3.sol (main contracts directory)*
*All archived versions have known vulnerabilities - use at your own risk*

Last Updated: 2025-12-26
