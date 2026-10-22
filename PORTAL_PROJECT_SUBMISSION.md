# GenLayer Portal — Builder > Projects submission draft

**Status: Prepared locally, NOT submitted or approved.**

Title: PolicySignal — On-chain Semantic Policy & Evidence Console

Category: Builder > Projects

Short description:
An interactive GenLayer dApp that reads and explains validator-backed semantic policy-change decisions and independent-source corroboration from two deployed Intelligent Contracts. It uses actual GenLayer Studionet contract state, never placeholder consensus outputs.

Repository: https://github.com/cacx097/genlayer-policy-signal

Live app: https://policysignal-genlayer.pages.dev/ — successfully deployed to a separate Cloudflare Pages project. Remote Chrome tested HTTP 200, live PolicyGuard state in desktop and mobile, no page errors or mobile overflow.

Contract evidence:
- PolicyGuard: https://explorer-studio.genlayer.com/address/0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2
- SourceQuorum: https://explorer-studio.genlayer.com/address/0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a

## Submission description (English)

PolicySignal is a user-facing GenLayer application that combines two different types of LLM/consensus-based evidence evaluation in a single interactive dashboard. The PolicyGuard view displays a one-time immutable semantic baseline and the latest validator-backed material-change decision for a public policy URL. The SourceQuorum view retrieves the original claim, its two public source URLs, and the most recent GenLayer consensus assessment of whether those sources independently support the claim.

Both panels read actual Studionet contract methods using GenLayerJS, expose contract provenance and Explorer evidence, support user-initiated refresh, and distinguish live data from RPC failures. The application provides an explicit user-guided path to invoke write methods in GenLayer Studio without silent wallet connection or fee-incurring automation.

PolicyGuard methods used: get_policy_name, get_source_url, is_baseline_ready, get_baseline_profile, get_last_assessment; optional user-directed check_for_material_change() via Studio.

SourceQuorum methods used: get_claim, get_sources, is_evaluated, get_last_assessment; optional user-directed evaluate() via Studio.

The app does not automatically execute expensive consensus writes. The user sees transaction safety guidance and is instructed to confirm Result: SUCCESS rather than treating ACCEPTED alone as execution success.

## Test evidence

- Node 22 + TypeScript/Vite production build: PASS (2026-10-22)
- Actual Node Studionet RPC reads: PASS (PolicyGuard get_policy_name/is_baseline_ready; SourceQuorum is_evaluated)
- Actual desktop Chrome UI and navigation: PASS
- Mobile Chrome UI/navigation/no horizontal overflow: PASS
- Browser Studionet reads: at least one run displayed live contract content; a subsequent test encountered RPC failure, which was explicitly displayed. Reliability requires further verification.
- Local screenshots: artifacts/policysignal-desktop.png and artifacts/policysignal-mobile.png

## Before submitting

1. Verify remote RPC reliability and test public hosting (no guessed screenshots or statuses).
2. With user's one-time approval, publish only this app repository and deploy it on an existing no-extra-charge hosting plan.
3. Confirm actual PUBLIC URL can read both contracts and error handling works.
4. Submit in existing Portal Builder > Projects and attach repo, live URL and screenshots, once.
5. Await review; only AFTER Projects approval consider Milestones for substantial subsequent improvements.

**No Builder Points or GLP are guaranteed merely by creating or submitting this Project.**
