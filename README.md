# 我的提示词库 — 部署与同步配置说明

纯本地、基于 localStorage 的 AI 提示词与图片收藏管理工具，支持跨设备同步（Supabase）。

---

## 功能概览

- 本地存储（localStorage），离线可用
- 图片画廊（瀑布流布局）
- 提示词一键复制
- 标签筛选与搜索
- 导入 / 导出 JSON
- 暗黑模式
- **跨设备同步**（需配置 Supabase）

---

## 快速开始

1. 将 `index.html`、`styles.css`、`app.js`、`sync.js` 放在同一目录
2. 用浏览器直接打开 `index.html`
3. 首次打开自动生成示例数据

---

## Supabase 同步配置步骤

### 第一步：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 注册并登录
2. 点击 **New Project** 创建新项目
3. 等待项目创建完成（约 1-2 分钟）

### 第二步：创建 `works` 数据表

进入项目控制台 → **SQL Editor** → 新建查询，执行以下 SQL：

```sql
create table if not exists public.works (
  id bigint primary key,
  "userId" text not null,
  "imageUrl" text,
  prompt text,
  tags jsonb,
  note text,
  "createdAt" timestamptz,
  "lastModified" timestamptz,
  unique(id, "userId")
);

-- 启用行级安全（可选，建议开启）
alter table public.works enable row level security;

-- 允许所有已认证/未认证用户按 userId 读写自己的数据
-- 简单方案：不做 RLS 限制，依赖 userId 字段隔离
-- 如需 RLS，可在此添加策略
```

> **注意**：字段名使用双引号包裹，以保留大小写，与 JS 对象字段一致。

### 第三步：获取 API 密钥

1. 进入项目控制台 → **Settings** → **API**
2. 复制 **Project URL**（格式：`https://xxxxx.supabase.co`）
3. 复制 **anon public key**（格式：`eyJ...`）

### 第四步：在网站中填入配置

有两种方式：

**方式 A — 直接在 `index.html` 中填写（推荐开发用）**

打开 `index.html`，找到：

```html
<script>
  window.SUPABASE_CONFIG = {
    url: '',       // 在此填入 Project URL
    anonKey: ''    // 在此填入 anon public key
  };
</script>
```

填入后保存，刷新页面。

**方式 B — 在网站设置面板中填写（推荐生产用）**

1. 打开网站 → 点击齿轮图标（数据管理）
2. 找到 **Supabase 配置** → 点击"配置"
3. 填入 Project URL 和 Anon Key → 保存
4. 配置会自动保存到浏览器 localStorage

---

## 用户账户说明

- 账户信息存储在浏览器 localStorage（`promptLibraryUser`）
- 密码经 base64 编码后存储，**非加密存储，请勿使用重要密码**
- 同步以 `userId`（UUID）标识数据归属
- 多设备使用同一用户名 + 密码登录，即可共享同一份云端数据

---

## 同步逻辑

| 触发时机 | 行为 |
|---|---|
| 打开页面（已登录 + 已配置） | 自动从云端拉取，合并本地 |
| 本地数据变化（增/改/删） | 1.5 秒防抖后自动推送到云端 |
| 点击同步图标 | 立即双向同步 |
| 网络恢复 | 自动更新同步状态 |

**冲突解决**：以 `lastModified` 较新者为准。

---

## 文件说明

| 文件 | 用途 |
|---|---|
| `index.html` | 主页面结构 |
| `styles.css` | 全部样式（含暗黑模式） |
| `app.js` | 核心逻辑（数据管理、渲染、用户账户） |
| `sync.js` | Supabase 同步逻辑 |
| `README.md` | 本文件 |

---

## 注意事项

- Supabase 免费层有行数和存储空间限制，请合理使用
- 图片本身不存储到 Supabase，仅存储图片 URL
- 如不使用同步功能，无需配置 Supabase，所有功能可离线使用
- 清除浏览器 localStorage 会丢失本地数据，建议定期导出备份

---

## 故障排查

**同步图标一直转圈**
→ 检查 Supabase URL 和 Key 是否正确，检查网络连接。

**同步失败：relation "works" does not exist**
→ 未在 Supabase 中执行建表 SQL，请按第二步操作。

**配置后刷新页面配置丢失**
→ 方式 A 配置会持久保存；方式 B 配置存于 localStorage，清除浏览器数据后会丢失，需重新填写。
