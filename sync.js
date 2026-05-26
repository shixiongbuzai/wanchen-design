/**
 * sync.js - Cloudflare Worker 同步接口
 * Worker 源码见 worker.js，需部署到 Cloudflare Workers
 * 
 * 使用前请将 WORKER_URL 替换为你的 Worker 域名
 */
const WORKER_URL = "https://你的-worker域名/api/data";

/**
 * 从 Worker 下载 data.json，合并到 localStorage
 * 合并策略：按 id + lastModified 取最新版本
 */
async function restore() {
  if (!AUTH.isLoggedIn()) return { success: false, error: "未登录" };
  try {
    const resp = await fetch(WORKER_URL, {
      headers: { "Cache-Control": "no-cache" },
      cache: "no-store"
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const remote = await resp.json();
    if (!Array.isArray(remote)) throw new Error("返回数据格式错误");

    // 合并：id 相同取 lastModified 较新的
    const local = JSON.parse(localStorage.getItem("promptLibrary") || "[]");
    const merged = mergeByIdAndTime(local, remote);

    localStorage.setItem("promptLibrary", JSON.stringify(merged));
    return { success: true, count: remote.length };
  } catch (e) {
    console.error("下载失败:", e);
    return { success: false, error: e.message };
  }
}

/**
 * 上传 localStorage 数据到 Worker
 * Worker 端会再次合并，确保不丢失远端更新
 */
async function upload() {
  if (!AUTH.isLoggedIn()) throw new Error("未登录");
  const raw = localStorage.getItem("promptLibrary") || "[]";
  const resp = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: raw
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => `HTTP ${resp.status}`);
    throw new Error(msg || `HTTP ${resp.status}`);
  }
}

/**
 * 按 id + lastModified 合并两个数组，取最新版本
 */
function mergeByIdAndTime(a, b) {
  const map = new Map();
  for (const item of a) {
    const key = String(item.id);
    map.set(key, item);
  }
  for (const item of b) {
    const key = String(item.id);
    const existing = map.get(key);
    if (!existing || (item.lastModified && (!existing.lastModified || item.lastModified > existing.lastModified))) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

/** 初始化同步（登录时调用，等同于 restore） */
async function initSync() { return await restore(); }

function isOnline() { return navigator.onLine; }
function setupNetworkListeners(onOnline, onOffline) {
  window.addEventListener("online", () => onOnline && onOnline());
  window.addEventListener("offline", () => onOffline && onOffline());
}