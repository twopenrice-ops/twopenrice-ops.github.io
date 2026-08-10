# OpenRice × Asia Miles｜金豬食堂專屬保留位

OpenRice 為 Asia Miles 會員設計的金豬食堂台北活動頁 Demo。

公開網站：<https://twopenrice-ops.github.io/>

## Demo 範圍

- 繁體中文／英文切換
- 固定日期與剩餘桌數
- 4 人桌、6 人桌及每單最多 2 桌
- Asia Miles 會員資格與信用卡／Apple Pay 示意
- 付款完成憑證
- 訂位綁定 OpenRice LINE 的查詢／取消流程示意

目前沒有正式金流、會員驗證、獨立訂位資料庫或 LINE bot 串接，不會實際扣款。

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

FTP 輸出位於 `2026-aml-or/`：首頁固定為 `index.html`，所有圖片位於 `images/`，JavaScript 與 CSS 位於 `static/`。整包可上傳到公司網域的任意子資料夾。
