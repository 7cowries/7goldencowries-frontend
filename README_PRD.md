# 7GoldenCowries – PRD (Single Source of Truth)

**Version:** v1.3
**Canonical spec:** [/mnt/data/7GoldenCowries-PRD-v1.3-final.md](/mnt/data/7GoldenCowries-PRD-v1.3-final.md)

This markdown is the **only** authoritative specification for 7GoldenCowries. All UI, routing, theming, and flows must match the PRD v1.3 scope (blue/gold oceanic gradients, glassmorphism controls, expanded routes including Staking and Theme Settings, and the unified API_BASE contract).

## Frontend Scope (per PRD v1.3)
- React app with TonConnect (global “Connect Wallet”).
- Oceanic theme with toggleable overlays, particles, and animation preferences.
- TON-only payments UI (token sale with live TON pricing).
- Quest engine (All / Daily / Social / Partner / Insider).
- Staking UI (stake, rewards, claim) plus Isles progression map and theme controls.

## Usage
- Always read the v1.3 document first.
- Implement by PRD phases; don’t invent endpoints—extend PRD first, then code.
