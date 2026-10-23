# 香港教師生涯模擬器：1 in 80 Billion 終極教畜之路

模擬 [1in80b.life](https://1in80b.life) 風格的香港教師職場文字 RPG：百分位標籤、擲骰判定、黑色幽默、地獄面試三部曲與校園修羅場事件池。

## 本地運行

```bash
npm install
npm run dev
```

瀏覽器打開終端顯示的本地地址（通常 `http://localhost:5173`）。

## 建置

```bash
npm run build
npm run preview
```

`npm run build` 產出靜態檔於 `dist/`，可部署至 GitHub Pages 或任何靜態主機。

## GitHub Pages

本專案 `vite.config.ts` 已設定 `base: '/1inteachers/'`（對應 repo 名稱 `ltmtms/1inteachers`）。

1. 在 GitHub repo **Settings → Pages** 選擇 **GitHub Actions** 或 **Deploy from branch**。
2. 若用 branch：將 `dist` 內容推至 `gh-pages` 分支，或使用下方 workflow。

可新增 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

遊戲網址：`https://ltmtms.github.io/1inteachers/`

## 玩法摘要

1. **開始** → 自動出身抽取（大學、公開試百分位、主修、未有 PGDE）。
2. **睇 JUMP** → 選小學或中學 → 抽三間學校 → 面試三部曲或轉下一間；全敗則 TA（$17k）。
3. **校園修羅場** → 隨機事件（出卷、SBA、ESR、IT 雜務、PGDE、家長投訴、爭 Perm…）。
4. **結局**：SAN 歸零、不續約失業、常額位勝利、轉行等。

每回合頂部為即時狀態面板；行動後顯示 **【判定：成功／大成功／失敗／大失敗】**。進度自動存入 `localStorage`。可選 URL 參數 `?seed=12345` 固定 RNG 種子。

## 技術

- Vite + React + TypeScript + Tailwind CSS v4
- 純前端，無 API keys

## 學校資料來源

遊戲內可抽籤的學校僅包含香港**津貼／資助**、**直資（DSS）**及**官立**中小學，不含私立或國際學校。

中學參考組別（Band 1／2／3）及資助類別整理自 [StarSchools 全港中學 Banding 一覽](https://starschools.hk/admission/banding) 與 [香港中學一覽](https://starschools.hk/schools/directory/secondary)；小學名單參考 [香港小學一覽](https://starschools.hk/schools/directory/primary)。StarSchools 註明組別為參考性質，並非教育局官方學校標籤。完整欄位與引用見 `src/game/schools.ts`。

## 授權

MIT（遊戲內學校名稱取自公開目錄，僅供娛樂）
