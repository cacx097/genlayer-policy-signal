# PolicySignal — 2026-10-22 verified status

**Project scope:** only GenLayer Builder > Projects candidate PolicySignal. Do not mix other workstreams or claim an approved Milestone.

**Local root:** `C:\AI-Workspace\genlayer-policy-signal`

## Completed

- Real GenLayerJS read-only integration of PolicyGuard and SourceQuorum's deployed Studionet contracts.
- Responsive user interface with policy vs corroboration navigation, refresh, baseline/assessment/claim/source presentation, Explorer and code links.
- No signing key is generated for read-only calls, no credential or wallet auto-connection, no automated or fee-incurring write.
- Transaction safety panel lists exact contract address and write method, with explicit Studio and fee/result warning. SDK transaction write integration withheld because locally installed `genlayer-js@1.1.8` does not implement newer documented fee-profile APIs; do not claim unsupported wallet integration.
- `npm install` successful; `npm run build` PASS.
- `node scripts/smoke_read.mjs` PASS for actual Studionet read calls.
- `node scripts/browser_smoke.mjs` desktop and mobile UI/navigation PASS; mobile horizontal overflow absent; screenshots generated.
- Browser RPC occasionally succeeds with visible contract data and occasionally returns an error, correctly displayed instead of fabricated results.
- Local documentation prepared for Portal Projects evidence.

## Not done / requires separate authorization

- Stable **public** browser endpoint and real public-hosting test.
- Publish code to a new GitHub repository or grant new repo permissions.
- Public Cloudflare Pages deployment: COMPLETED with user approval, separate project `policysignal-genlayer`, public URL https://policysignal-genlayer.pages.dev/; no other Pages project modified. Verified remote Chrome HTTP 200 and live on-chain PolicyGuard content in both desktop/mobile.
- Actual Portal Projects submission.
- Approval / awarded Builder Points / GLP (zero new confirmed).
- Milestones: blocked until an actual Projects submission is approved and a genuine subsequent enhancement exists.

## Known limitations

- The app displays preexisting validated instances, not arbitrary user-controlled addresses.
- Read-only integration is real; actual Studio writes are performed outside the app by the user after reviewing costs.
- RPC responsiveness is not guaranteed; intermittent failures are reported and the UI supports retry.
- Release bundle is relatively large; non-blocking Vite chunk-size warning.
- Do not spend GEN/GLP or make additional on-chain calls solely to generate points.
