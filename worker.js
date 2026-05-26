/**
 * Cloudflare Worker — 为「我的提示词库」提供 data.json 读写接口
 *
 * 部署步骤：
 *   1. npm install -g wrangler
 *   2. wrangler login
 *   3. wrangler secret put GITHUB_TOKEN （填入你的 GitHub Personal Access Token）
 *   4. 修改下方 GITHUB_REPO 为你的仓库 owner/repo
 *   5. wrangler deploy
 *
 * API：
 *   GET  /api/data   → 返回 data.json 内容（JSON array）
 *   POST /api/data   → 接收 JSON array，按 id+lastModified 合并后写回
 */

const GITHUB_REPO = "shixiongbuzai/wanchen-design";
const DATA_PATH = "data.json";
const BRANCH = "master";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Cache-Control",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function textResponse(text, status = 200) {
  return new Response(text, { status, headers: corsHeaders });
}

/** 读取 GitHub 上的 data.json */
async function getDataJson() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}?ref=${BRANCH}`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "wanchen-worker",
    },
  });
  if (resp.status === 404) return { content: [], sha: null };
  if (!resp.ok) throw new Error(`GitHub GET failed: ${resp.status}`);
  const info = await resp.json();
  // GitHub API 返回 base64，需要解码（UTF-8 安全）
  const bytes = Uint8Array.from(atob(info.content.replace(/\n/g, "")), c => c.charCodeAt(0));
  const text = new TextDecoder("utf-8").decode(bytes);
  const content = JSON.parse(text);
  return { content, sha: info.sha };
}

/** 写入 data.json 到 GitHub */
async function putDataJson(content, sha) {
  const text = JSON.stringify(content, null, 2);
  // UTF-8 安全 Base64 编码
  const bytes = new TextEncoder().encode(text);
  const base64 = btoa(String.fromCharCode(...bytes));

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}`;
  const body = JSON.stringify({
    message: "同步 data.json",
    content: base64,
    sha,
    branch: BRANCH,
  });

  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "wanchen-worker",
    },
    body,
  });
  if (!resp.ok) throw new Error(`GitHub PUT failed: ${resp.status}`);
}

/** 按 id + lastModified 合并，取最新版本 */
function mergeByIdAndTime(local, remote) {
  const map = new Map();
  for (const item of remote) map.set(String(item.id), item);
  for (const item of local) {
    const key = String(item.id);
    const existing = map.get(key);
    if (!existing || (item.lastModified && (!existing.lastModified || item.lastModified > existing.lastModified))) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS 预检
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 注入环境变量（替代全局引用）
    const GITHUB_TOKEN = env.GITHUB_TOKEN;

    if (url.pathname === "/api/data") {
      try {
        if (request.method === "GET") {
          const { content } = await getDataJsonWithToken(GITHUB_TOKEN);
          return jsonResponse(content);
        }

        if (request.method === "POST") {
          const incoming = await request.json();
          if (!Array.isArray(incoming)) {
            return jsonResponse({ error: "请求体必须为 JSON 数组" }, 400);
          }
          const { content: remote, sha } = await getDataJsonWithToken(GITHUB_TOKEN);
          const merged = mergeByIdAndTime(incoming, remote);
          await putDataJsonWithToken(merged, sha, GITHUB_TOKEN);
          return jsonResponse({ success: true, count: merged.length });
        }

        return textResponse("Method Not Allowed", 405);
      } catch (e) {
        console.error("Worker error:", e);
        return jsonResponse({ error: e.message }, 500);
      }
    }

    return textResponse("Not Found", 404);
  },
};

// 辅助函数（避免在 fetch handler 中重复代码）

async function getDataJsonWithToken(token) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}?ref=${BRANCH}`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "wanchen-worker",
    },
  });
  if (resp.status === 404) return { content: [], sha: null };
  if (!resp.ok) throw new Error(`GitHub GET failed: ${resp.status}`);
  const info = await resp.json();
  const bytes = Uint8Array.from(atob(info.content.replace(/\n/g, "")), c => c.charCodeAt(0));
  const text = new TextDecoder("utf-8").decode(bytes);
  const content = JSON.parse(text);
  return { content, sha: info.sha };
}

async function putDataJsonWithToken(content, sha, token) {
  const text = JSON.stringify(content, null, 2);
  const bytes = new TextEncoder().encode(text);
  const base64 = btoa(String.fromCharCode(...bytes));

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}`;
  const body = JSON.stringify({
    message: "同步 data.json",
    content: base64,
    sha,
    branch: BRANCH,
  });

  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "wanchen-worker",
    },
    body,
  });
  if (!resp.ok) throw new Error(`GitHub PUT failed: ${resp.status}`);
}