export type ContractKind = "policy" | "quorum";
export type RegistryEntry = { kind: ContractKind; address: `0x${string}`; label: string };
export type Snapshot = {
  address: `0x${string}`;
  kind: ContractKind;
  observedAt: string;
  fields: Record<string, string>;
};
export const MAX_ENTRIES = 12;
export const MAX_SNAPSHOTS = 24;
export const REGISTRY_KEY = "policysignal:v2:contracts";
export const SNAPSHOT_KEY = "policysignal:v2:snapshots";
export const INITIAL_CONTRACTS: RegistryEntry[] = [
  { kind: "policy", address: "0x83a171bDC6d39B5E3ad21D5D0a4d28A5EB3964e2", label: "PolicyGuard · GitHub Policy" },
  { kind: "quorum", address: "0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a", label: "SourceQuorum · Air Composition" }
];

export function normalizedAddress(value: string): `0x${string}` | null {
  const cleaned = value.trim();
  if (!/^0x[a-f\d]{40}$/i.test(cleaned)) return null;
  return cleaned as `0x${string}`;
}
export function parseEntries(raw: unknown): RegistryEntry[] {
  if (!Array.isArray(raw)) return [];
  const result: RegistryEntry[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const input = item as Record<string, unknown>;
    if (input.kind !== "policy" && input.kind !== "quorum") continue;
    if (typeof input.address !== "string") continue;
    const address = normalizedAddress(input.address);
    if (!address || seen.has(address.toLowerCase())) continue;
    const label = typeof input.label === "string" ? input.label.trim().slice(0, 80) : "";
    if (!label) continue;
    result.push({ address, kind: input.kind, label });
    seen.add(address.toLowerCase());
    if (result.length >= MAX_ENTRIES) break;
  }
  return result;
}
export function parseSnapshots(raw: unknown): Snapshot[] {
  if (!Array.isArray(raw)) return [];
  const items: Snapshot[] = [];
  for (const s of raw) {
    if (!s || typeof s !== "object") continue;
    const value = s as Record<string, unknown>;
    if (typeof value.address !== "string" || typeof value.observedAt !== "string") continue;
    const address = normalizedAddress(value.address);
    if (!address || !Number.isFinite(Date.parse(value.observedAt))) continue;
    if (value.kind !== "policy" && value.kind !== "quorum") continue;
    if (!value.fields || typeof value.fields !== "object" || Array.isArray(value.fields)) continue;
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(value.fields as object)) {
      if (/^[a-z_]{1,45}$/.test(k) && typeof v === "string" && v.length <= 30000) fields[k] = v;
    }
    if (!Object.keys(fields).length) continue;
    items.push({address,kind:value.kind,observedAt:value.observedAt,fields});
    if (items.length >= MAX_SNAPSHOTS) break;
  }
  return items;
}
export function findChangedFields(oldFields: Record<string, string>, newFields: Record<string, string>): string[] {
  const keys = new Set([...Object.keys(oldFields), ...Object.keys(newFields)]);
  return [...keys].filter(k => (oldFields[k] ?? "") !== (newFields[k] ?? "")).sort();
}
export function buildEvidenceBundle(entry: RegistryEntry, current: Record<string,string>, previous?: Snapshot) {
  return {
    application: "PolicySignal v2", network: "GenLayer Studionet",
    note: "This is a browser-generated read-only evidence report, not an on-chain transaction or a new validator decision. Saved comparisons are local-browser snapshots.",
    contract: entry,
    explorer: "https://explorer-studio.genlayer.com/address/" + entry.address,
    observedAt: new Date().toISOString(),
    current,
    prior: previous ?? null,
    changedFieldsSinceSavedSnapshot: previous ? findChangedFields(previous.fields, current) : null
  };
}
