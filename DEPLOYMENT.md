# Vercel 部署完整指南

本指南將協助你將 GeminiGen AI 圖片工作室部署到 Vercel。

## 前置準備

1. ✅ 已安裝 Node.js (v18 或更高版本)
2. ✅ 擁有 Vercel 帳號 (可用 GitHub 登入)
3. ✅ 已安裝 Git (可選，用於版本控制)

## 部署方式

### 方式一：使用 Vercel CLI（推薦）

#### 步驟 1：安裝 Vercel CLI

\`\`\`bash
npm install -g vercel
\`\`\`

#### 步驟 2：登入 Vercel

\`\`\`bash
vercel login
\`\`\`

選擇你的登入方式（GitHub、GitLab、Bitbucket 或 Email）。

#### 步驟 3：進入專案目錄

\`\`\`bash
cd image-gen-site
\`\`\`

#### 步驟 4：部署

\`\`\`bash
vercel
\`\`\`

首次部署時，Vercel 會詢問幾個問題：

- **Set up and deploy?** → 選擇 `Y`
- **Which scope?** → 選擇你的帳號
- **Link to existing project?** → 選擇 `N`
- **What's your project's name?** → 輸入專案名稱（例如：`geminigen-studio`）
- **In which directory is your code located?** → 按 Enter（使用當前目錄）

Vercel 會自動檢測 Next.js 專案並開始部署。

#### 步驟 5：部署到生產環境

\`\`\`bash
vercel --prod
\`\`\`

完成後，你會獲得一個生產環境的 URL，例如：
\`https://geminigen-studio.vercel.app\`

---

### 方式二：使用 Vercel Dashboard

#### 步驟 1：準備 Git 倉庫

如果你的專案還沒有 Git 倉庫：

\`\`\`bash
cd image-gen-site
git init
git add .
git commit -m "Initial commit"
\`\`\`

將專案推送到 GitHub、GitLab 或 Bitbucket：

\`\`\`bash
# 建立遠端倉庫後
git remote add origin YOUR_REPO_URL
git branch -M main
git push -u origin main
\`\`\`

#### 步驟 2：連接 Vercel

1. 前往 [vercel.com](https://vercel.com)
2. 點擊「New Project」
3. 選擇「Import Git Repository」
4. 授權 Vercel 存取你的 Git 帳號
5. 選擇你的專案倉庫

#### 步驟 3：配置專案

Vercel 會自動檢測到 Next.js 專案，預設配置通常不需要修改：

- **Framework Preset**: Next.js
- **Root Directory**: `./` (或 `image-gen-site` 如果在子目錄)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### 步驟 4：部署

點擊「Deploy」按鈕，Vercel 會開始建置和部署你的專案。

部署完成後，你會獲得：
- 🌐 生產環境 URL
- 📊 部署狀態儀表板
- 📝 建置日誌

---

### 方式三：一鍵部署按鈕

如果你的專案已經在 GitHub 上，可以使用一鍵部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL)

將 `YOUR_GITHUB_REPO_URL` 替換為你的倉庫 URL。

---

## 部署後設定

### 1. 自訂網域（可選）

1. 在 Vercel Dashboard 中選擇你的專案
2. 前往「Settings」→「Domains」
3. 點擊「Add」輸入你的網域
4. 按照指示設定 DNS 記錄

### 2. 環境變數（本專案不需要）

本專案使用客戶端認證，不需要設定伺服器端環境變數。

### 3. 效能優化

Vercel 自動提供：
- ✅ 全球 CDN
- ✅ 自動 HTTPS
- ✅ 圖片優化
- ✅ 邊緣快取

---

## 更新部署

### 使用 Git（自動部署）

如果你使用 Git 連接 Vercel，每次推送到主分支都會自動觸發部署：

\`\`\`bash
git add .
git commit -m "Update features"
git push origin main
\`\`\`

### 使用 Vercel CLI

\`\`\`bash
cd image-gen-site
vercel --prod
\`\`\`

---

## 常見問題

### Q1: 部署失敗，顯示「Build Error」

**解決方案：**
1. 檢查 [`package.json`](package.json:1) 中的依賴是否正確
2. 確保本地可以成功執行 `npm run build`
3. 查看 Vercel 建置日誌找出具體錯誤

### Q2: 網站可以訪問，但 API 路由返回 404

**解決方案：**
1. 確認 API 路由檔案位於 [`app/api/generate/route.ts`](app/api/generate/route.ts:1)
2. 檢查 [`next.config.js`](next.config.js:1) 配置
3. 重新部署專案

### Q3: 圖片無法顯示

**解決方案：**
1. 檢查 [`next.config.js`](next.config.js:1) 中的 `images.remotePatterns` 配置
2. 確認 GeminiGen API 返回的圖片 URL 可以訪問
3. 查看瀏覽器控制台的錯誤訊息

### Q4: Token 認證失敗

**解決方案：**
1. 確認從 GeminiGen.ai 取得的 Token 是否正確
2. 檢查 Token 是否已過期
3. 嘗試重新登入 GeminiGen.ai 並取得新的 Token

---

## 監控和分析

### Vercel Analytics

1. 前往專案的「Analytics」頁面
2. 查看：
   - 頁面瀏覽量
   - 使用者地理分布
   - 效能指標
   - 錯誤率

### 建置日誌

1. 前往專案的「Deployments」頁面
2. 點擊任一部署查看詳細日誌
3. 檢查建置時間和錯誤訊息

---

## 效能優化建議

### 1. 圖片優化

專案已使用 Next.js Image 元件，自動提供：
- WebP 格式轉換
- 響應式圖片
- 延遲載入

### 2. 快取策略

在 [`app/api/generate/route.ts`](app/api/generate/route.ts:1) 中可以加入快取標頭：

\`\`\`typescript
export const runtime = 'edge'; // 使用 Edge Runtime
export const dynamic = 'force-dynamic'; // 強制動態渲染
\`\`\`

### 3. 程式碼分割

Next.js 自動進行程式碼分割，但你可以使用動態導入進一步優化：

\`\`\`typescript
const ImageGrid = dynamic(() => import('@/components/ImageGrid'), {
  loading: () => <LoadingSpinner />,
});
\`\`\`

---

## 安全性建議

1. ✅ **Token 安全**：Token 儲存在客戶端 localStorage，不會暴露在伺服器端
2. ✅ **HTTPS**：Vercel 自動提供 HTTPS
3. ✅ **API 代理**：使用 Next.js API Routes 作為代理，避免直接暴露 API 金鑰
4. ⚠️ **速率限制**：考慮加入 API 呼叫速率限制

---

## 成本估算

Vercel 提供免費方案，包含：
- ✅ 100 GB 頻寬/月
- ✅ 無限部署
- ✅ 自動 HTTPS
- ✅ 全球 CDN

對於個人專案和小型應用，免費方案通常足夠使用。

---

## 支援

- 📚 [Vercel 文件](https://vercel.com/docs)
- 💬 [Vercel 社群](https://github.com/vercel/vercel/discussions)
- 🐛 [回報問題](https://github.com/vercel/vercel/issues)

---

## 下一步

部署完成後，你可以：

1. 🎨 自訂網站樣式和品牌
2. 📊 加入分析追蹤
3. 🔔 設定部署通知
4. 🌐 連接自訂網域
5. 📱 優化移動端體驗

祝你部署順利！🚀
