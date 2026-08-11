import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Gold Pig booking experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Asia Miles 會員限定｜金豬食堂 OpenRice 專屬保留位<\/title>/);
  assert.match(html, /不用飛首爾，台北就能吃到金豬經典。/);
  assert.doesNotMatch(html, /首爾一位難求，今晚為你留位。/);
  assert.match(html, /把想吃的這一晚，先留給自己/);
  assert.match(html, /專人桌邊代烤・五款肉品完整套餐/);
  assert.match(html, /每位 NT\$2,280｜已含 10% 服務費/);
  assert.match(html, /class="sessionGrid"/);
  assert.match(html, /選這一晚/);
  assert.match(html, /gold-pig-grilled-pork-highres\.jpg/);
  assert.match(html, /asia-miles-logo-transparent\.png/);
  assert.match(html, /openrice-logo\.svg/);
  assert.match(html, /openrice-favicon\.svg/);
  assert.doesNotMatch(html, /codex-preview|Building your site|Your site is taking shape/i);
});

test("keeps food imagery, responsive session cards and FTP assets in source", async () => {
  const [page, css, packageJson, linePage] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../public/line/index.html", import.meta.url), "utf8"),
    access(new URL("../public/assets/gold-pig-grilled-pork-highres.jpg", import.meta.url)),
    access(new URL("../public/assets/gold-pig-grill-overhead.jpg", import.meta.url)),
    access(new URL("../public/assets/gold-pig-grill-action.jpg", import.meta.url)),
    access(new URL("../public/assets/gold-pig-raw-cuts.jpg", import.meta.url)),
    access(new URL("../public/assets/openrice-ambassador.jpg", import.meta.url)),
    access(new URL("../public/assets/asia-miles-gold-pig-guests.jpg", import.meta.url)),
    access(new URL("../public/assets/asia-miles-logo-transparent.png", import.meta.url)),
    access(new URL("../public/assets/openrice-logo.svg", import.meta.url)),
    access(new URL("../public/openrice-favicon.svg", import.meta.url)),
  ]);

  assert.match(page, /className="sessionFeaturePhoto"/);
  assert.match(page, /className="sessionCard"/);
  assert.match(page, /重新產生 LINE 綁定連結/);
  assert.match(page, /const retryLineSetup = async/);
  assert.doesNotMatch(page, /請保留訂位編號並聯絡 OpenRice 客服/);
  assert.match(css, /\.sessionGrid\s*\{[^}]*grid-template-columns:\s*1fr 1fr/s);
  assert.match(css, /@media \(max-width:\s*560px\)[\s\S]*\.sessionCard button\s*\{[^}]*width:\s*100%/);
  const photoReferences = [...page.matchAll(/["'](\.\/assets\/(?:gold-pig[^"']*|openrice-ambassador|asia-miles-gold-pig-guests)\.(?:jpe?g|png))["']/g)].map((match) => match[1]);
  const repeatedPhotos = photoReferences.filter((photo, index) => photoReferences.indexOf(photo) !== index);
  assert.equal(photoReferences.length, 11, "all campaign photo placements should be covered by the uniqueness check");
  assert.deepEqual(repeatedPhotos, [], "each photography asset should appear only once in the page source");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(linePage, /var liffId = '2007974193-o0E3h1J4'/);
  assert.match(linePage, /https:\/\/openrice-line-crm\.netlify\.app\/api\/gold-pig\/bind/);
  assert.match(linePage, /https:\/\/lin\.ee\/XCzdUC6/);
  assert.match(linePage, /await initLiff\(\)[\s\S]*token = readBookingTokenAfterInit\(\)/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
