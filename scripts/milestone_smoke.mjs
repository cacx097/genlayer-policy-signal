import { chromium } from "playwright";
import { createServer } from "vite";
const server=await createServer({configFile:"vite.config.ts",server:{host:"127.0.0.1",port:5192,strictPort:true}});
await server.listen();
const browser=await chromium.launch({channel:"chrome",headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto("http://127.0.0.1:5192/",{waitUntil:"domcontentloaded"});
 await page.getByRole("heading",{name:"계약 포트폴리오와 변경 이력"}).waitFor();
 await page.getByRole("button",{name:"계약 추가"}).click();
 await page.getByRole("status").getByText("정확한 0x + 40자리 계약 주소").waitFor();
 await page.getByRole("textbox",{name:"계약 이름"}).fill("Test Additional Quorum");
 await page.getByRole("textbox",{name:"GenLayer 계약 주소"}).fill("0xbd6E0466a7bF7e58c2384DF0096A24E9b6CEAb8a");
 await page.getByRole("button",{name:"계약 추가"}).click();
 await page.getByText("이미 등록된 계약 주소입니다.").waitFor();
 await page.getByRole("textbox",{name:"GenLayer 계약 주소"}).fill("0x0000000000000000000000000000000000000012");
 await page.getByRole("button",{name:"계약 추가"}).click();
 await page.getByRole("heading",{name:"Test Additional Quorum"}).waitFor();
 await page.reload();
 await page.getByRole("heading",{name:"Test Additional Quorum"}).waitFor();
 const card=page.locator(".portfolio-card").filter({has:page.getByRole("heading",{name:"PolicyGuard · GitHub Policy"})});
 let live=false;
 for(let attempt=0;attempt<3;attempt++){
  await card.getByRole("button",{name:"온체인 조회"}).click();
  await page.waitForTimeout(6000);
  if(await card.getByText("5개 실제 함수 조회 성공").count()){live=true;break;}
 }
 if(!live)throw Error("Live RPC did not pass after 3 attempts: "+(await card.innerText()).slice(-700));
 await card.getByRole("button",{name:"스냅샷 저장"}).click();
 await card.getByText("최근 저장:").waitFor();
 const downloadWait=page.waitForEvent("download");
 await card.getByRole("button",{name:"증빙 내보내기"}).click();
 const download=await downloadWait;
 if(!download.suggestedFilename().endsWith(".json"))throw Error("Evidence export did not create JSON");
 await page.reload();
 const restored=page.locator(".portfolio-card").filter({has:page.getByRole("heading",{name:"PolicyGuard · GitHub Policy"})});
 await restored.getByText("최근 저장:").waitFor();
 await page.setViewportSize({width:390,height:844});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error("Mobile overflow");
 console.log("PASS v2 portfolio: invalid/duplicate rejection, add, local persistence, live contract reads, snapshot, export readiness, mobile layout");
} finally {await browser.close();await server.close();}
