# OpenRice × Asia Miles｜金豬食堂專屬保留位

OpenRice 為 Asia Miles 會員設計的金豬食堂台北活動頁 Demo。

公開網站：<https://twopenrice-ops.github.io/>

## Demo 範圍

- 繁體中文／英文切換
- 固定日期與剩餘桌數
- 4 人桌、6 人桌及每單最多 2 桌
- Asia Miles 會員資格與信用卡／Apple Pay 示意
- 付款完成憑證
- 付款完成後產生一次性 LINE 綁定連結
- 綁定至既有 OpenRice LINE CRM 後，可由 Bot 查詢訂位與提出取消申請

目前付款與 Asia Miles 會員檢核仍為 Demo，不會實際扣款。Demo 訂位會以 `is_demo` 標記寫入既有 LINE CRM 的 Supabase；正式金流上線時，應由付款成功 webhook 呼叫受 API Key 保護的正式訂位端點，並關閉 CRM 的 `GOLD_PIG_DEMO_MODE`。

## Local development

```bash
npm install
npm run dev
```

## GitHub Pages

```bash
npm run build:pages
```

推送至 `main` 後，GitHub Actions 會將 `pages-dist/` 的靜態版本發布至 GitHub Pages。

## FTP package

```bash
npm run build:ftp
```

FTP 輸出位於 `2026-aml-or/`：活動首頁固定為 `index.html`，LINE 訂位綁定頁位於 `line/index.html`，所有圖片位於 `images/`，JavaScript 與 CSS 位於 `static/`。整包上傳至公司網域後，金豬食堂 LIFF Endpoint URL 應設定為 `https://tw.openrice.com/info/event/2026-aml-or/line/`。
