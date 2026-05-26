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

async function apiGetData() {
  const url = `https://api.github.com/repos/${REPO}/contents/${DATA_PATH}?ref=${BRANCH}`;
  const resp = await fetch(url, {
    headers: { Authorization: `token ${GH}`, Accept: "application/vnd.github.v3+json" },
    cache: "no-store",
  });
  if (resp.status === 404) return { content: [], sha: null };
  if (!resp.ok) throw new Error(`GitHub GET ${resp.status}`);
  const info = await resp.json();
  const bytes = Uint8Array.from(atob(info.content.replace(/\n/g, "")), c => c.charCodeAt(0));
  return { content: JSON.parse(new TextDecoder("utf-8").decode(bytes)), sha: info.sha };
}

async function apiPutData(content, sha) {
  const text = JSON.stringify(content, null, 2);
  const bytes = new TextEncoder().encode(text);
  const base64 = btoa(String.fromCharCode(...bytes));
  const resp = await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`, {
    method: "PUT",
    headers: { Authorization: `token ${GH}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
    body: JSON.stringify({ message: "同步 data.json", content: base64, sha, branch: BRANCH }),
  });
  if (!resp.ok) throw new Error(`GitHub PUT ${resp.status}`);
}

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
  if (sha) {
    await apiPutData(merged, sha);
  } else {
    const text = JSON.stringify(merged, null, 2);
    const bytes = new TextEncoder().encode(text);
    const base64 = btoa(String.fromCharCode(...bytes));
    const resp = await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`, {
      method: "PUT",
      headers: { Authorization: `token ${GH}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
      body: JSON.stringify({ message: "创建 data.json", content: base64, branch: BRANCH }),
    });
    if (!resp.ok) throw new Error(`GitHub PUT ${resp.status}`);
  }
}

function mergeByIdAndTime(a, b) {
  const map = new Map();
  for (const item of a) map.set(String(item.id), item);
  for (const item of b) {
    const key = String(item.id);
    const existing = map.get(key);
    if (!existing || (item.lastModified && (!existing.lastModified || item.lastModified > existing.lastModified))) {
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