# 我的提示词库

纯静态 AI 提示词与图片收藏管理工具，基于 GitHub Pages + Cloudflare Worker + GitHub data.json 同步。

---

## 功能概览

- 本地存储（localStorage），离线可用
- 图片画廊（瀑布流布局）
- 提示词一键复制
- 标签筛选与搜索
- 导入 / 导出 JSON
- 暗黑模式
- 跨设备同步（Cloudflare Worker + GitHub）

---

## 快速开始

1. 将 `index.html`、`styles.css`、`app.js`、`sync.js` 放在同一目录
2. 用浏览器直接打开 `index.html`
3. 首次打开自动生成示例数据

---

## 同步部署（Cloudflare Worker）

### 第一步：创建 GitHub Personal Access Token

1. 访问 [GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. 点击 **Generate new token**
3. Repository access：选择 `Only select repositories` → 选择你的仓库
4. Permissions → Contents：选择 **Read and write**
5. 生成后复制 token（只显示一次）

### 第二步：部署 Cloudflare Worker

1. 安装 Wrangler CLI：
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. 修改 `worker.js` 中的仓库地址：
   ```js
   const GITHUB_REPO = "你的用户名/你的仓库名";
   ```

3. 设置 GitHub Token 环境变量：
   ```bash
   wrangler secret put GITHUB_TOKEN
   # 粘贴第一步生成的 token
   ```

4. 部署：
   ```bash
   wrangler deploy
   ```

5. 记录部署后得到的 Worker 域名（如 `https://wanchen-sync.你的子域名.workers.dev`）

### 第三步：配置前端

打开 `sync.js`，修改第一行的 Worker URL：
```js
const WORKER_URL = "https://你的-worker域名/api/data";
```

### 第四步：部署前端

将项目推送到 GitHub，GitHub Pages 会自动构建部署。

---

## 同步逻辑

| 触发时机 | 行为 |
|---|---|
| 打开页面（已登录） | 从 Worker 拉取，按 id + lastModified 合并 |
| 本地数据变化（增/改/删） | 1.5 秒防抖后自动推送到 Worker |
| 删除操作 | 立即同步，不等防抖 |
| 点击下载按钮 | 手动从云端恢复 |

**合并策略**：按作品 id 匹配，以 `lastModified` 较新者为准，不会丢失任一端的修改。

---

## 文件说明

| 文件 | 用途 |
|---|---|
| `index.html` | 主页面结构 |
| `styles.css` | 全部样式（含暗黑模式） |
| `app.js` | 核心逻辑（数据管理、渲染、用户账户） |
| `sync.js` | Worker 同步接口调用 |
| `worker.js` | Cloudflare Worker 源码（读写 GitHub data.json） |
| `README.md` | 本文件 |

---

## 安全说明

- GitHub Token 仅存储在 Cloudflare Worker 的环境变量中，不出现在前端代码
- Worker 提供 CORS 支持，允许 GitHub Pages 跨域调用
- 用户登录凭据仅存储在浏览器 localStorage，不涉及服务端

---

## 注意事项

- Worker 免费层每天 10 万次请求，个人使用绰绰有余
- 图片本身不存储到 GitHub，仅存储图片 URL
- 清除浏览器 localStorage 会丢失本地数据，建议定期导出备份