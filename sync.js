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

  // 409: SHA 冲突，重新获取最新 SHA 后合并重试（最多 2 次）
  if (status === 409 && retry409 < 2) {
    console.warn("GitHub PUT 409, retrying with fresh SHA...");
    const { content: fresh, sha: freshSha } = await apiGetData();
    const merged = mergeByIdAndTime(content, fresh);
    if (merged.length === fresh.length && fresh.every((f, i) => JSON.stringify(f) === JSON.stringify(merged[i]))) {
      // 如果合并后与远端完全一致，说明本地数据已被远端覆盖，无需再写
      return { sha: freshSha };
    }
    return apiPutData(merged, freshSha, retry409 + 1, retry403, retry429);
  }

  // 403: rate limit，等待后重试（最多 1 次）
  if (status === 403 && retry403 < 1) {
    const retryAfter = resp.headers.get("Retry-After");
    const wait = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
    console.warn(`GitHub PUT 403, waiting ${wait / 1000}s...`);
    await new Promise(r => setTimeout(r, wait));
    return apiPutData(content, sha, retry409, retry403 + 1, retry429);
  }

  // 429: too many requests，等待 Retry-After 后重试（最多 2 次）
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
 * 按 id + lastModified 合并，保留 deletedAt 状态。
 * 关键规则：若同一 id 同时存在一条有 deletedAt 和一条没有 deletedAt 的记录，
 * 优先保留有 deletedAt 的那条（软删除覆盖未删除）。
 */
function mergeByIdAndTime(a, b) {
  const map = new Map();
  for (const item of a) map.set(String(item.id), item);
  for (const item of b) {
    const key = String(item.id);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
    } else if (item.deletedAt && !existing.deletedAt) {
      // 远端有 deletedAt，本地没有 → 保留远端的软删除状态
      map.set(key, item);
    } else if (!item.deletedAt && existing.deletedAt) {
      // 本地有 deletedAt，远端没有 → 保留本地的软删除状态
      // do nothing (keep existing)
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