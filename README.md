# PolicySignal — GenLayer Evidence Console

Live application: https://policysignal-genlayer.pages.dev/

**Status:** Publicly deployed Builder > Projects submission candidate. Not yet submitted or approved. This application does not guarantee GLP or Builder Points.

## What it does

PolicySignal is a React/TypeScript application that reads live on-chain state from two GenLayer Studionet Intelligent Contracts rather than displaying simulated AI decisions.

- **PolicyGuard**: retrieves an immutable semantic policy baseline, source URL and latest validator-backed material-change assessment.
- **SourceQuorum**: retrieves a factual claim, two source URLs and the validator-backed independent corroboration verdict.
- Clearly distinguishes successful contract reads from RPC errors, supports refresh, displays provenance links and works on mobile.
- Shows the method/address for optional *user-initiated* GenLayer Studio write transactions, without automatically connecting wallets or spending GEN.

## Deployed contracts

PolicyGuard:
- Address: `0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2`
- Explorer: https://explorer-studio.genlayer.com/address/0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2
- Source: https://github.com/cacx097/genlayer-policy-guard

SourceQuorum:
- Address: `0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a`
- Explorer: https://explorer-studio.genlayer.com/address/0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a
- Source: https://github.com/cacx097/genlayer-source-quorum

## Run and test

Requires Node.js 20+.

```sh
npm ci
npm run dev
npm run build
node scripts/smoke_read.mjs
node scripts/browser_smoke.mjs
node scripts/public_site_smoke.mjs
```

The browser smoke scripts expect a local Chrome installation. They use read-only contract calls and do not initiate transactions.

## Verified evidence

- TypeScript and Vite production build passed.
- Live Studionet read calls passed for both contracts.
- Local desktop/mobile Chrome navigation and rendering checks passed.
- Public Cloudflare Pages endpoint returned HTTP 200, displayed live PolicyGuard state on desktop and mobile Chrome, with no page errors or mobile horizontal overflow.
- Intermittent RPC failures may occur and are visibly reported, not treated as successful validations.

## Security, scope and limitations

No API keys, wallet private keys, server secrets or paid services are required for this read-only app. The fixed demo contracts monitor their own predetermined policy and claim; users cannot yet deploy arbitrary claim monitors from this interface. Actual contract writes must be initiated explicitly in GenLayer Studio, where users check fees and transaction Result: SUCCESS.

See [Projects submission evidence](PORTAL_PROJECT_SUBMISSION.md) for the review summary. Submitting this app does not imply acceptance or an award. Subsequent Builder Milestones would require a separately approved Project and meaningful new functionality.
