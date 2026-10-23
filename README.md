# 香港教師生涯模擬器：1 in 80 Billion 終極教畜之路

模擬 [1in80b.life](https://1in80b.life) 風格的香港教師職場文字 RPG：百分位標籤、擲骰判定、黑色幽默、地獄面試三部曲與校園修羅場事件池。

## 本地運行

```bash
npm install
npm run dev
```

瀏覽器打開終端顯示的本地地址（通常 `http://localhost:5173`）。

### 像素場景（CSS 動畫）

主選單頂部會每四秒循環：**校舍 → 課室 → 運動會 → 游泳**。進入遊戲後，場景會依當前回合標題／敘事自動切換（例如出卷／SBA／試教 → 課室；帶比賽／運動會 → 運動會；敘事含游泳／泳池等 → 游泳）。

若要固定預覽某一場景，在 URL 加上 `pixelScene` 參數（可與 `seed` 並用）：

| 參數值 | 場景 |
| --- | --- |
| `school` 或 `school-yard` | 校舍（預設戶外） |
| `classroom` | 課室黑板授課 |
| `sports` 或 `sports-day` | 運動會執哨 |
| `swim` 或 `swimming-gala` | 游泳比賽池邊計時 |

例：`http://localhost:5173/?pixelScene=classroom`

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
3. **校園修羅場** → 隨機事件（出卷、SBA、執業牌照 CPD、數碼進修、AI 作弊疑雲、殺班寒冬、解約大逃殺、群組投訴、校本系統義工…）。
4. **結局**：SAN 歸零、不續約失業、常額位勝利、轉行等。

每回合頂部為即時狀態面板；行動後顯示 **【判定：成功／大成功／失敗／大失敗】**。進度自動存入 `localStorage`。可選 URL 參數 `?seed=12345` 固定 RNG 種子。

## 技術

- Vite + React + TypeScript + Tailwind CSS v4
- 純前端，無 API keys

## 學校資料來源

遊戲內可抽籤的學校僅包含香港**津貼／資助**及**直資（DSS）**中小學，不含官立、私立或國際學校。

中學參考組別（Band 1／2／3）及資助類別整理自 [StarSchools 全港中學 Banding 一覽](https://starschools.hk/admission/banding) 與 [香港中學一覽](https://starschools.hk/schools/directory/secondary)；小學名單參考 [香港小學一覽](https://starschools.hk/schools/directory/primary)。StarSchools 註明組別為參考性質，並非教育局官方學校標籤。完整欄位與引用見 `src/game/schools.ts`。

## 新聞情境來源（Sources）

校園修羅場部分事件改編自香港教育界公開報道與政策文件，僅作遊戲敘事，不代表任何真實學校或個人：

| 主題 | 參考 |
| --- | --- |
| 執業教師牌照續期、每三年約 150 小時 CPD、目標 2028/29 全面實施 | [RTHK 2026-01-30](https://news.rthk.hk/rthk/ch/component/k2/1842095-20260130.htm)、[RTHK 2026-02-12](https://news.rthk.hk/rthk/ch/component/k2/1843634-20260212.htm)、[LegCo CB(3)60/2026](https://www.legco.gov.hk/yr2026/english/panels/ed/papers/ed20260206cb3-60-1-e.pdf) |
| 強制數碼教育 CPD（150 小時中 30 小時為數碼）、每年 5 萬培訓位、每校一次性 $50 萬津貼 | RTHK 2026-06 相關報道（政策公布） |
| 小學生疑用 AI 作弊、校方與教育局跟進 | [RTHK 2026-02-12](https://news.rthk.hk/rthk/ch/component/k2/1843634-20260212.htm)（施俊輝跟進校方情況） |
| 津貼學校收生不足、殺班與編制壓力 | 星島／教育局學校規劃相關公布 |
| 合約教師不續約、學生數下降下爭奪常額 | 同上及教師編制／收生趨勢評論 |
| 家長 WhatsApp 群組投訴升級至教育局 | 校本投訴與社交媒體截圖外洩相關報道 |
| STEM／IT 教師被要求義務搭建校本系統 | 數碼校政撥款與教師非教學工作負擔討論 |

## 授權

MIT（遊戲內學校名稱取自公開目錄，僅供娛樂）
