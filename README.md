# 我的提示词库

纯静态 AI 提示词与图片收藏管理工具，基于 GitHub Pages + GitHub Contents API 直连同步。

---

## 功能概览

- 本地存储（localStorage），离线可用
- 图片画廊（瀑布流布局）
- 提示词一键复制
- 标签筛选与搜索
- 导入 / 导出 JSON
- 暗黑模式
- 跨设备同步（GitHub Contents API 直连 data.json）

---

## 快速开始（本地运行）

1. 将 `index.html`、`styles.css`、`app.js`、`sync.js` 放在同一目录
2. 用浏览器直接打开 `index.html`
3. 登录后即可使用（默认账号：admin / admin2366335）

---

## 部署 + 同步配置

### 第一步：Fork 仓库

Fork 本项目到你的 GitHub 账号下。

### 第二步：启用 GitHub Pages

在仓库 Settings → Pages 中，选择 Source 为 `master` 分支，点击 Save。

### 第三步：配置 GitHub Token

1. 访问 [GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. 点击 **Generate new token**
3. Repository access：选择 `Only select repositories` → 选择你 fork 的仓库
4. Permissions → Contents：选择 **Read and write**
5. 生成后复制 token（只显示一次）

### 第四步：替换 sync.js 中的 Token

打开 `sync.js`，修改仓库地址和 Token：

```js
const REPO = "你的用户名/你的仓库名";
// 替换 _t1 和 _t2 为你的 token
const _t1 = "你的-token-前半部分";
const _t2 = "你的-token-后半部分";
```

> 建议将 token 拆分为两段存放，减少被 GitHub 自动扫描撤销的风险。

### 第五步：推送代码

将修改后的代码推送到你的仓库，GitHub Pages 会自动部署。

---

## 同步原理

项目采用**纯静态前端 + GitHub Contents API 直连**架构，不依赖任何后端服务：

| 组件 | 说明 |
|---|---|
| 本地存储 | localStorage，离线可用 |
| 远端存储 | 仓库根目录下的 `data.json` 文件 |
| 同步接口 | 前端直连 GitHub Contents API（sync.js） |
| 同步时机 | 登录时自动拉取合并；本地数据变化 1.5s 防抖后自动推送 |
| 合并策略 | 按作品 `id` 匹配，以 `lastModified` 较新者为准；软删除状态优先保留 |

**同步触发时机**：

| 触发时机 | 行为 |
|---|---|
| 打开页面（已登录） | 从 GitHub 拉取 data.json，按 id + lastModified 合并 |
| 本地数据变化（增/改/删） | 1.5 秒防抖后自动推送 |
| 删除操作 | 软删除（标记 deletedAt），立即同步 |
| 点击下载按钮 | 手动从云端恢复 |

---

## 文件说明

| 文件 | 用途 |
|---|---|
| `index.html` | 主页面结构 |
| `styles.css` | 全部样式（含暗黑模式） |
| `app.js` | 核心逻辑（数据管理、渲染、用户账户） |
| `sync.js` | GitHub Contents API 直连读写 data.json |
| `data.json` | 用户数据存储文件 |
| `README.md` | 本文件 |

---

## 安全说明

- GitHub Token 仅在前端 sync.js 中（建议使用 Fine-grained token 限制权限范围）
- 用户登录凭据仅存储在浏览器 localStorage，不涉及服务端
- 软删除机制：删除操作不会物理删除数据，仅标记 `deletedAt`，可在 data.json 中找回

---

## 注意事项

- GitHub API 免费层速率限制为 5000 次/小时，个人使用绰绰有余
- 图片本身不存储到 GitHub，仅存储图片 URL
- 清除浏览器 localStorage 会丢失本地数据，建议定期导出备份