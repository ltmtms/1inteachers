# 香港教師生涯模擬器：1 in 80K 終極教師之路

模擬 [1in80b.life](https://1in80b.life) 風格的香港教師職場文字 RPG：**1 in 80K**、百分位標籤、擲骰判定、黑色幽默、地獄面試三部曲與校園修羅場事件池。

**免責聲明：** 本遊戲內容純屬虛構，如有雷同，實屬巧合。遊戲內所有畫面底部均會顯示此聲明。

## 本地運行

```bash
npm install
npm run dev
```

瀏覽器打開終端顯示的本地地址（通常 `http://localhost:5173`）。

### 像素場景（CSS 動畫）

主選單頂部會每四秒循環多個像素場景（畢業、跳跳網、課室、TA、教員室夜戰、運動會、晉升、退休等）。進入遊戲後，場景會依**階段、職級、事件標題**自動切換，例如：

| 情境 | 像素場景 |
| --- | --- |
| 出身／PGDE 報名 | 大學畢業 |
| 跳跳網、等 second in | 跳跳網瀏覽 |
| 面試／出卷／SBA | 課室（主修學科色調） |
| TA 職級 | 影印／校務 |
| 通宵改卷 | 教員室夜戰 |
| 功能組事件 | 訓導／課外／輔導／IT／行政 |
| 拍拖／結婚／生兒育女／家人離世 | 對應家庭場景（離世為靜默悼念，無血腥） |
| 晉升 SGM／PGM／校長 | 晉升徽章 |
| 60 歲退休結局 | 黃昏長椅 |

仍支援敘事關鍵字觸發運動會、游泳等原有場景。

若要固定預覽某一場景，在 URL 加上 `pixelScene` 參數（可與 `seed` 並用）：

| 參數值 | 場景 |
| --- | --- |
| `school` 或 `school-yard` | 校舍（預設戶外） |
| `classroom` | 課室黑板授課 |
| `graduation` | 畢業禮 |
| `jump` 或 `jump-net` | 跳跳網 |
| `ta` 或 `ta-desk` | TA 影印 |
| `staff` 或 `staff-room` | 教員室改卷 |
| `promo` 或 `promotion` | 晉升 |
| `retire` 或 `retirement` | 退休 |
| `dating` / `wedding` / `family` | 家庭場景 |
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

1. **開始** → 本地大學畢業生（22 歲）、JUPAS 非醫科課程隨機主修、香港居住區、**未有 PGDE**；可選困難的 PGDE 報名（會扣精神健康值）。
2. **睇跳跳網** → 選小學或中學 → **從廣告列表揀一個職位**投書 → 等回覆 → 面試志願（含學科專題題）→ 三部曲或下一間；全敗則做 **TA（$17k）**。**TA 必須轉校**才可再任教席，不可原校直升。
3. **狀態面板** → 年齡（至 60 歲退休）、精神健康值、家庭負擔度、主修、居住等；不再顯示續約／轉 Perm 百分比。
4. **家庭生活** → 拍拖、結婚、生兒育女、家人離世（影響家庭負擔度）；婚後可搬家。
5. **晉升管理線** → 符合年資門檻時，SGM 約 40%、PGM 8%、校長 2%（遊戲設定）。
6. **校園修羅場** → 出卷、SBA、CPD、功能組專屬事件等。
7. **結局** → 精神健康值歸零、不續約、常額位、轉行、**60 歲退休**等。

### 學校功能組別

| 組別 | 玩法重點 |
| --- | --- |
| **行政組** | 行政會議、校政決策、危機應變；**僅可在同一學校任教滿 5 年後**接受邀請加入（非入職時選項）。 |
| **資訊科技組** | Wi‑Fi／帳號／eLearning 突發、深夜支援；主修 ICT／資訊科技者入職時會被強烈推薦，亦有機會被校務預設編入。 |
| **學務組** | 升留班、分班、成績表與考評政策。 |
| **訓導組** | 紀律調查、見家長、好夜走。 |
| **課外活動組** | 比賽、交流團、周末外出與學會行政。 |
| **輔導組** | 長談、通報與協調社工、情緒勞動。 |

入職後首個職場回合會出現組別分配；亦可選「暫不加入」。在校年資每完成一個一般職場回合 +1（選組當回合不計）。

每回合頂部為即時狀態面板；行動後顯示 **【判定：成功／大成功／失敗／大失敗】**。進度自動存入 `localStorage`。可選 URL 參數 `?seed=12345` 固定 RNG 種子。

## 技術

- Vite + React + TypeScript + Tailwind CSS v4
- 純前端，無 API keys

## 學校資料來源

遊戲內可抽籤的學校僅包含香港**津貼／資助**、**按位津貼**及**直資（DSS）**中小學，不含官立、私立或國際學校。

資料自 [教育局 — 學校資料](https://www.edb.gov.hk/tc/student-parents/sch-info/about-sch-info/index.html) 所連結的 **CHSC 學校概覽**匯入：

| 學段 | CHSC 來源 | 匯入日期 |
| --- | --- | --- |
| 中學 | [SSP 2025 學校概覽](https://www.chsc.hk/ssp2025/) | 2026-10-24 |
| 小學 | [PSP 2026 學校概覽](https://www.chsc.hk/psp2026/) | 2026-10-24 |

已提交於 `src/game/data/secondary-schools.json`、`src/game/data/primary-schools.json`（由 `npm run import:schools` 可重新產生）。欄位包括校名、地區、資助類別、中學派位組別（Band 1–3，遊戲用）、以及辦學宗旨／校訓摘錄（`profileNote`）。遊戲內教師招聘平台名稱為 **跳跳網**；流程設計受現實 **Jobs for Teachers（jump.hk）** 啟發，廣告為靜態樣本，**不會**在運行時抓取外部網站。見 `src/game/jumpAds.ts`、`src/game/interviewQuestions.ts`。

## 教師薪級（MPS）資料來源

合約教席／常額位月薪依 [教聯會教師薪級表（2026年4月1日生效）](https://hkfew.org.hk/en/%E6%AC%8A%E7%9B%8A/%E8%96%AA%E6%B4%A5-%E5%85%AC%E7%A9%8D%E9%87%91/item/12540-%E6%95%99%E5%B8%AB%E8%96%AA%E7%B4%9A%E8%A1%A8-2026%E5%B9%B44%E6%9C%881%E6%97%A5%E7%94%9F%E6%95%88) 編碼於 `src/game/salaryScale.ts`。遊戲簡化：小學路線為 APSM、中學為 GM，PGDE 起薪點 +2；在校年資每兩年遞增一 MPS 點直至合約上限。TA 月薪 $17,000（非 MPS，遊戲設定）。

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

## 免責聲明

本遊戲內容純屬虛構，如有雷同，實屬巧合。遊戲內學校、人物與事件均為模擬，不代表任何真實機構或個人。

## 授權

MIT（遊戲內學校名稱取自公開目錄，僅供娛樂）
