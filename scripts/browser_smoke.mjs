import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { createServer } from "vite";

const server = await createServer({ configFile: "vite.config.ts", server: { host: "127.0.0.1", port: 5187, strictPort: true } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5187/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.getByRole("heading", { name: "정책이 바뀌었나요?" }).waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: "출처 독립성 검증" }).click();
  await page.getByRole("heading", { name: "이 정보는 독립적으로 검증됐나요?" }).waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: "정책 변경 판정" }).click();
  await page.getByRole("button", { name: "온체인 새로고침" }).waitFor({ timeout: 20000 });
  // Reads can fail depending on RPC CORS/availability; errors must be visible, not silently hidden.
  await page.waitForTimeout(5500);
  const body = await page.locator("body").innerText();
  if (errors.length) throw new Error("Browser errors: " + errors.join(" | "));
  if (!body.includes("GenLayer Studionet") || !body.includes("정책 변경 판정 다시 실행하기")) throw new Error("Required UI not rendered");
  console.log("PASS Browser UI: navigation, refresh, contract labels and transaction guard rendered");
  console.log("Browser network state:", body.includes("일부 온체인 데이터를 가져오지 못했습니다.") ? "RPC READ ERROR SHOWN" : body.includes("GitHub Acceptable Use Policies") ? "LIVE CONTRACT CONTENT SHOWN" : "UNCONFIRMED");
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/policysignal-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/policysignal-mobile.png", fullPage: true });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  if (mobileOverflow) throw new Error("Mobile horizontal overflow detected");
  await page.getByRole("button", { name: "출처 독립성 검증" }).click();
  await page.getByRole("heading", { name: "이 정보는 독립적으로 검증됐나요?" }).waitFor();
  console.log("PASS Mobile: viewport layout, navigation and no horizontal overflow");
} finally {
  if (browser) await browser.close();
  await server.close();
}
