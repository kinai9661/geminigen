# GeminiGen AI 圖片工作室

使用 GeminiGen AI API 建構的專業圖片生成網站，部署在 Vercel 上。

## 功能特色

- 🎨 AI 圖片生成 - 使用 GeminiGen AI 強大的圖片生成能力
- 🔐 安全認證 - 使用 access_token 和 refresh_token 進行身份驗證
- 📱 響應式設計 - 完美支援桌面和移動設備
- 💾 本地儲存 - 使用 Zustand 持久化儲存認證狀態
- 🖼️ 圖片畫廊 - 瀏覽和下載生成的圖片
- ⚡ 快速部署 - 一鍵部署到 Vercel

## 技術棧

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **狀態管理**: Zustand
- **部署**: Vercel

## 快速開始

### 1. 安裝依賴

\`\`\`bash
cd image-gen-site
npm install
\`\`\`

### 2. 本地開發

\`\`\`bash
npm run dev
\`\`\`

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 3. 取得 GeminiGen.ai Token

1. 前往 [geminigen.ai](https://geminigen.ai) 並用 Google 帳號登入
2. 按 `F12` 開啟開發者工具 → 點「Console」分頁
3. 複製並執行網站提供的 JavaScript 代碼
4. 或手動從 localStorage 中取得 `access_token` 和 `refresh_token`

### 4. 開始使用

1. 在彈出的認證視窗中輸入你的 Token
2. 輸入提示詞描述你想要的圖片
3. 點擊「生成圖片」按鈕
4. 等待 AI 生成完成
5. 查看、下載或分享你的作品

## 部署到 Vercel

### 方法一：使用 Vercel CLI

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### 方法二：使用 Vercel Dashboard

1. 前往 [vercel.com](https://vercel.com)
2. 點擊「New Project」
3. 導入你的 Git 倉庫
4. Vercel 會自動檢測 Next.js 專案並配置
5. 點擊「Deploy」

### 方法三：一鍵部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

## 專案結構

\`\`\`
image-gen-site/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # API 路由：處理圖片生成請求
│   ├── globals.css               # 全域樣式
│   ├── layout.tsx                # 根佈局
│   └── page.tsx                  # 首頁
├── components/
│   ├── AuthModal.tsx             # 認證彈窗元件
│   ├── ImageGrid.tsx             # 圖片網格元件
│   └── PromptInput.tsx           # 提示詞輸入元件
├── lib/
│   └── store.ts                  # Zustand 狀態管理
├── public/                       # 靜態資源
├── next.config.js                # Next.js 配置
├── tailwind.config.ts            # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
├── vercel.json                   # Vercel 部署配置
└── package.json                  # 專案依賴
\`\`\`

## API 端點

### POST /api/generate

生成圖片的 API 端點。

**請求體：**

\`\`\`json
{
  "prompt": "一隻可愛的貓咪在花園裡玩耍",
  "accessToken": "your_access_token"
}
\`\`\`

**回應：**

\`\`\`json
{
  "success": true,
  "imageUrl": "https://...",
  "data": { ... }
}
\`\`\`

## 環境變數

本專案不需要額外的環境變數，所有認證資訊都儲存在客戶端的 localStorage 中。

## 注意事項

- Token 儲存在瀏覽器的 localStorage 中，請勿在公共電腦上使用
- 生成的圖片 URL 可能有時效性，建議及時下載
- API 呼叫頻率可能有限制，請合理使用

## 授權

MIT License

## 支援

如有問題或建議，請開啟 Issue。
\`\`\`
