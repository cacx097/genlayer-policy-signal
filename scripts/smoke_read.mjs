import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const client = createClient({ chain: studionet, account: createAccount() });
const cases = [
  ["PolicyGuard", "0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2", "get_policy_name"],
  ["PolicyGuard", "0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2", "is_baseline_ready"],
  ["SourceQuorum", "0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a", "is_evaluated"],
];
let failures = 0;
for (const [contract, address, functionName] of cases) {
  try {
    const result = await client.readContract({ address, functionName, args: [] });
    const display = String(result ?? "").slice(0,100);
    console.log("PASS", contract, functionName, display);
  } catch (error) {
    failures += 1;
    console.error("FAIL", contract, functionName, String(error).slice(0,500));
  }
}
process.exitCode = failures ? 1 : 0;
