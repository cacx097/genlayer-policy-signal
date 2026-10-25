import assert from "node:assert/strict";
import { createServer } from "vite";
const server=await createServer({server:{middlewareMode:true},appType:"custom"});
try {
 const m=await server.ssrLoadModule("/src/portfolioModel.ts");
 const a=m.normalizedAddress(" 0x83A171BDC6D39B5E3AD21D5D0A4D28A5EB3964E2 ");
 assert.equal(a,"0x83A171BDC6D39B5E3AD21D5D0A4D28A5EB3964E2");
 assert.equal(m.normalizedAddress("not an address"),null);
 assert.equal(m.parseEntries([...m.INITIAL_CONTRACTS,{...m.INITIAL_CONTRACTS[0],address:a}]).length,2);
 const old={baseline:"A",assessment:"OLD"},recent={baseline:"A",assessment:"NEW"};
 assert.deepEqual(m.findChangedFields(old,recent),["assessment"]);
 const snap={address:a,kind:"policy",observedAt:new Date().toISOString(),fields:old};
 assert.equal(m.parseSnapshots([snap])[0].fields.assessment,"OLD");
 const report=m.buildEvidenceBundle({...m.INITIAL_CONTRACTS[0],address:a},recent,snap);
 assert.deepEqual(report.changedFieldsSinceSavedSnapshot,["assessment"]);
 assert.equal(report.note.includes("not an on-chain transaction"),true);
 console.log("PASS offline milestone logic: addresses, duplicates, immutable snapshots, field differences, evidence bundle");
} finally{await server.close();}
