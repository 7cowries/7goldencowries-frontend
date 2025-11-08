# 7GoldenCowries – PRD (Single Source of Truth)

**Version:** v1.2  
**Canonical PDF:** [/docs/7goldencowries_Final_Full_PRD_v1.2.pdf](./docs/7goldencowries_Final_Full_PRD_v1.2.pdf)

This PDF is the **only** authoritative specification for 7GoldenCowries.
All features, APIs, schema, roadmap, and acceptance criteria must match the PRD.

### How to use (Devs / ChatGPT / Codex)
- Always open the PDF first and follow it exactly.
- Implement features in **phases** as defined in the PRD roadmap.
- Do not invent new endpoints or flows—extend the PRD first, then implement.

### Frontend Scope (per PRD)
- React app with TonConnect at root, one global “Connect Wallet” button.
- TON-only payments (no Stripe), Token Sale UI with live TON pricing.
- Quest engine (All, Daily, Social, Partner, Insider tabs).
- Staking UI (stake, view rewards, claim).
- Leaderboard, Profile, Subscription per PRD specs.

### Environment
- **PROD:** `REACT_APP_API_URL` must be **blank** (on-origin `/api` rewrites).
- `REACT_APP_TONCONNECT_MANIFEST_URL` must point to `/tonconnect-manifest.json` on production origin.
- See PRD §Environments & Secrets for complete list.

