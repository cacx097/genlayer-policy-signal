import { chromium } from "playwright";
const url = "https://policysignal-genlayer.pages.dev/";
const browser = await chromium.launch({channel:"chrome",headless:true});
try {
 for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  const page=await browser.newPage({viewport});
  const errors=[];
  page.on("pageerror", e=>errors.push(e.message));
  const resp=await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  await page.getByRole("heading",{name:"정책이 바뀌었나요?"}).waitFor({timeout:30000});
  await page.waitForTimeout(8500);
  const body=await page.locator("body").innerText();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
  console.log(JSON.stringify({viewport:viewport.width,http:resp?.status(),heading:true,livePolicy:body.includes("GitHub Acceptable Use Policies"),errorVisible:body.includes("일부 온체인 데이터를 가져오지 못했습니다."),horizontalOverflow:overflow,pageErrors:errors}));
  if(resp?.status()!==200||errors.length||overflow) process.exitCode=1;
  await page.getByRole("button",{name:"출처 독립성 검증"}).click();
  await page.getByRole("heading",{name:"이 정보는 독립적으로 검증됐나요?"}).waitFor({timeout:10000});
  await page.close();
 }
} finally {await browser.close();}
