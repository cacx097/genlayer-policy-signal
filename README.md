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


## Reviewer correction — bundled Intelligent Contract sources

Both **exact deployed contract source files** are now included in this project repository, rather than being linked only as separate projects:

| Contract | Bundled source | GenLayer Studionet address | Source matching |
| --- | --- | --- | --- |
| PolicyGuard | [contracts/policy_guard.py](contracts/policy_guard.py) | `0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2` | Identical Git blob `d08737e0fb3aef3e3a05f13fce3e6e7f77b411ef` to [origin](https://github.com/cacx097/genlayer-policy-guard/blob/main/contracts/policy_guard.py) |
| SourceQuorum | [contracts/source_quorum.py](contracts/source_quorum.py) | `0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a` | Identical Git blob `bcea6be20e3efd807a59da570e044fb80193bfc6` to [origin](https://github.com/cacx097/genlayer-source-quorum/blob/main/contracts/source_quorum.py) |

`src/App.tsx` directly invokes the public read methods that exist in those bundled contracts:

- PolicyGuard: `get_policy_name`, `get_source_url`, `is_baseline_ready`, `get_baseline_profile`, `get_last_assessment`.
- SourceQuorum: `get_claim`, `get_sources`, `is_evaluated`, `get_last_assessment`.

`src/TransactionPanel.tsx` names the contracts' actual `check_for_material_change` and `evaluate` public write methods and links the user to Studio for fee-reviewed manual execution. The UI **does not directly send write transactions** or run validator consensus within the dashboard; all actual live displayed assessments came from deployed GenLayer contract methods, not simulated local reasoning.

Reviewer correction dated 2026-10-24: this same repository now includes the relevant GenLayer Python code alongside the client. The existing deployed contracts and live app were not altered by this documentation/source bundling.
