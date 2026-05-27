/**
 * sync.js - GitHub API 直连同步
 * 读写仓库 data.json，按 id+lastModified 合并
 */

const REPO = "shixiongbuzai/wanchen-design";
const DATA_PATH = "data.json";
const BRANCH = "master";

const _t1 = "github_pat_11B2X3YYI0VTUM4A3AqfD5_W6oeGxbYz0pqhA0eIpvGtj1ZYbdDl9kV6MtGX";
const _t2 = "wsLCO27HXW2RSLutYPBY2m";
const GH = _t1 + _t2;

/* ===== UTF-8 安全 Base64 编解码 ===== */

function encodeBase64(str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function decodeBase64(base64) {
  const binary = atob(base64.replace(/\n/g, ""));
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder("utf-8").decode(bytes);
}

/* ===== GitHub API ===== */

async function apiGetData() {
  const url = `https://api.github.com/repos/${REPO}/contents/${DATA_PATH}?ref=${BRANCH}`;
  const resp = await fetch(url, {
    headers: { Authorization: `token ${GH}`, Accept: "application/vnd.github.v3+json" },
    cache: "no-store",
  });
  if (resp.status === 404) return { content: [], sha: null };
  if (!resp.ok) throw new Error(`GitHub GET ${resp.status}`);
  const info = await resp.json();
  const content = JSON.parse(decodeBase64(info.content));
  return { content, sha: info.sha };
}

async function apiPutData(content, sha, retry409 = 0, retry403 = 0, retry429 = 0) {
  const text = JSON.stringify(content, null, 2);
  const base64 = encodeBase64(text);

  const url = `https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`;
  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${GH}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "同步 data.json", content: base64, sha, branch: BRANCH }),
  });

  if (resp.ok) return await resp.json();

  const status = resp.status;

  if (status === 409 && retry409 < 2) {
    console.warn("GitHub PUT 409, retrying with fresh SHA...");
    const { content: fresh, sha: freshSha } = await apiGetData();
    const merged = mergeByIdAndTime(content, fresh);
    if (merged.length === fresh.length && fresh.every((f, i) => JSON.stringify(f) === JSON.stringify(merged[i]))) {
      return { sha: freshSha };
    }
    return apiPutData(merged, freshSha, retry409 + 1, retry403, retry429);
  }

  if (status === 403 && retry403 < 1) {
    const retryAfter = resp.headers.get("Retry-After");
    const wait = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
    console.warn(`GitHub PUT 403, waiting ${wait / 1000}s...`);
    await new Promise(r => setTimeout(r, wait));
    return apiPutData(content, sha, retry409, retry403 + 1, retry429);
  }

  if (status === 429 && retry429 < 2) {
    const retryAfter = resp.headers.get("Retry-After");
    const wait = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
    console.warn(`GitHub PUT 429, waiting ${wait / 1000}s...`);
    await new Promise(r => setTimeout(r, wait));
    return apiPutData(content, sha, retry409, retry403, retry429 + 1);
  }

  throw new Error(`GitHub PUT ${status}`);
}

/* ===== 同步逻辑 ===== */

async function restore() {
  if (!AUTH.isLoggedIn()) return { success: false, error: "未登录" };
  try {
    const { content: remote } = await apiGetData();
    const local = JSON.parse(localStorage.getItem("promptLibrary") || "[]");
    const merged = mergeByIdAndTime(local, remote);
    localStorage.setItem("promptLibrary", JSON.stringify(merged));
    return { success: true, count: remote.length };
  } catch (e) {
    console.error("下载失败:", e);
    return { success: false, error: e.message };
  }
}

async function upload() {
  if (!AUTH.isLoggedIn()) throw new Error("未登录");
  const { content: remote, sha } = await apiGetData();
  const local = JSON.parse(localStorage.getItem("promptLibrary") || "[]");
  const merged = mergeByIdAndTime(local, remote);
  await apiPutData(merged, sha);
}

/**
 * 上传图片到 GitHub 仓库 images/YYYY-MM/ 目录
 * @param {File} file - 用户选择的图片文件
 * @returns {Promise<string>} 相对路径如 "images/2026-05/1716000000_a3f2_原图.webp"
 */
async function uploadImage(file) {
  const MAX_SIZE = 8 * 1024 * 1024;
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (file.size > MAX_SIZE) throw new Error("图片不能超过 8MB");
  if (!ALLOWED.includes(file.type)) throw new Error("仅支持 jpg/png/webp/gif");

  // 读取为 base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const comma = result.indexOf(",");
      resolve(result.slice(comma + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 生成路径: images/YYYY-MM/时间戳_4位随机hex_清洗后原文件名
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const ts = Math.floor(now.getTime() / 1000);
  const rand = Math.random().toString(16).slice(2, 6);
  const safeName = file.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5._-]/g, "_");
  const path = `images/${ym}/${ts}_${rand}_${safeName}`;

  // 上传到 GitHub
  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${GH}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `上传图片 ${path}`,
      content: base64,
      branch: BRANCH,
    }),
  });

  if (resp.status === 422) {
    // 文件已存在，加随机后缀重试
    const retryPath = `images/${ym}/${ts}_${rand}_${Math.random().toString(16).slice(2, 6)}_${safeName}`;
    const retryUrl = `https://api.github.com/repos/${REPO}/contents/${retryPath}`;
    const retryResp = await fetch(retryUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${GH}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `上传图片 ${retryPath}`,
        content: base64,
        branch: BRANCH,
      }),
    });
    if (!retryResp.ok) {
      const err = await retryResp.json().catch(() => ({}));
      throw new Error(err.message || `上传失败: HTTP ${retryResp.status}`);
    }
    return retryPath;
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `上传失败: HTTP ${resp.status}`);
  }

  return path;
}

function mergeByIdAndTime(a, b) {
  const map = new Map();
  for (const item of a) map.set(String(item.id), item);
  for (const item of b) {
    const key = String(item.id);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
    } else if (item.deletedAt && !existing.deletedAt) {
      map.set(key, item);
    } else if (!item.deletedAt && existing.deletedAt) {
      // keep existing
    } else if (item.lastModified && (!existing.lastModified || item.lastModified > existing.lastModified)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

async function initSync() { return await restore(); }

function isOnline() { return navigator.onLine; }
function setupNetworkListeners(onOnline, onOffline) {
  window.addEventListener("online", () => onOnline && onOnline());
  window.addEventListener("offline", () => onOffline && onOffline());
}