import { chromium } from "playwright";
const root="https://policysignal-genlayer-v2.pages.dev";
const browser=await chromium.launch({channel:"chrome",headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const response=await page.goto(root,{waitUntil:"domcontentloaded",timeout:30000});
 await page.getByRole("heading",{name:"계약 포트폴리오와 변경 이력"}).waitFor({timeout:10000});
 console.log("PUBLIC",response.status(),"v2 heading visible");
 const guard=await page.request.post(root+"/api/studionet",{data:{jsonrpc:"2.0",id:1,method:"eth_sendRawTransaction",params:["0xab"]}});
 console.log("WRITE_RPC_STATUS",guard.status());
 const get=await page.request.get(root+"/api/studionet");
 console.log("GET_RPC_STATUS",get.status());
 const card=page.locator(".portfolio-card").filter({has:page.getByRole("heading",{name:"PolicyGuard · GitHub Policy"})});
 await card.getByRole("button",{name:"온체인 조회"}).click();
 await page.waitForTimeout(10000);
 const text=await card.innerText();
 const live=text.includes("5개 실제 함수 조회 성공");
 console.log("LIVE_READ",live,"ERROR",text.match(/조회 실패:.{0,160}/)?.[0]||"none");
 if(live){
   await card.getByRole("button",{name:"스냅샷 저장"}).click();
   await card.getByText("최근 저장:").waitFor();
   const pending=page.waitForEvent("download");
   await card.getByRole("button",{name:"증빙 내보내기"}).click();
   const dl=await pending;
   console.log("JSON_DOWNLOAD",dl.suggestedFilename());
   await page.reload();
   await page.locator(".portfolio-card").filter({has:page.getByRole("heading",{name:"PolicyGuard · GitHub Policy"})}).getByText("최근 저장:").waitFor();
   console.log("SNAPSHOT_PERSISTENCE","PASS");
 }
 await page.setViewportSize({width:390,height:844});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
 console.log("MOBILE_OVERFLOW",overflow);
 if(response.status()!==200||guard.status()!==403||get.status()!==405||overflow)process.exitCode=1;
}finally{await browser.close()}
