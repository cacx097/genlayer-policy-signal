# PolicySignal v2 Milestone — verifier-ready change record

## Approved baseline
Original PolicySignal Projects accepted on Oct 25, 2026, awarded 260 Builder Points.
Live v1: https://policysignal-genlayer.pages.dev/
Source v1: https://github.com/cacx097/genlayer-policy-signal
Do not overwrite v1; Milestones must introduce genuinely new functionality.

## New independent v2 functionality (local only)
1. Add and remove multiple GenLayer PolicyGuard and SourceQuorum instances by contract address, with input validation and case-insensitive duplicate prevention.
2. Query five PolicyGuard or four SourceQuorum public methods through GenLayerJS.
3. Save browser-local snapshots and compare actual saved contract responses.
4. Export a structured JSON provenance and changed-fields report.
5. Responsive mobile interface, privacy-friendly no wallet auto-connect or fee-incurring transactions.

## RPC browser failure and fix
Direct browser calls to `https://studio.genlayer.com/api` are blocked by the upstream server's CORS configuration, confirmed from browser console.
v2 routes its read-only `gen_call` via `/api/studionet`:
- Vite development: fixed-target proxy in `vite.config.ts`.
- Cloudflare Pages: `functions/api/studionet.ts` with fixed upstream URL, JSON-RPC method allowlist (`gen_call` only), size limits, and rejection of non-POST calls. No user-supplied proxy destination, keys, wallet operations, or write methods.

## Test evidence
- Node real GenLayer reads from PolicyGuard and SourceQuorum: PASS.
- v2 TypeScript and Vite production build: PASS.
- Browser v2 end-to-end: PASS once: invalid input/duplicates, additional address persistence, real PolicyGuard RPC read, snapshot capture, export readiness, mobile layout.
- Subsequent extended browser test failed with **RPC rate limit exceeded: 30 requests/minute** after repeated runs. Real JSON file download verification has **not** passed yet; export object logic passed offline.
- Offline address validation, deduplication, snapshot parsing, changed field comparison and evidence bundle: PASS.
- Cloudflare Pages Function has **not yet been deployed or tested publicly**. The approved v1 remains untouched.
- No new contract deployment, paid writes, award, or Portal Milestone submission.

## Next permission-bounded action
Publish v2 code on a separate GitHub branch, deploy a separate preview/new Pages target without changing the approved v1, verify public read-only proxy, report export, and compare screenshots. Submit one Builder Milestones contribution only after those tests pass. Public deployment, branch publication, and Portal submission have not been authorized in this turn.
