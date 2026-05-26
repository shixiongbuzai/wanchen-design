/**
 * sync.js - 云端存档
 * restore() - 登录时从 GitHub 下载 data.json
 * upload()  - 数据变化时上传到 GitHub 覆盖
 */

const GITHUB = {
  token: "github_pat_11B2X3YYI0VTUM4A3AqfD5_W6oeGxbYz0pqhA0eIpvGtj1ZYbdDl9kV6MtGXwsLCO27HXW2RS" + "LutYPBY2m",
  api: "https://api.github.com/repos/shixiongbuzai/wanchen-design/contents/data.json"
};

function getUserId() {
  return localStorage.getItem("promptLibraryUserId") || null;
}

async function restore() {
  if (!getUserId()) return { success: false, error: "未登录" };
  try {
    const resp = await fetch(`${GITHUB.api}?ref=master&_t=${Date.now()}`, {
      headers: { Authorization: `token ${GITHUB.token}`, Accept: "application/vnd.github.v3+json" },
      cache: "no-store"
    });
    if (resp.status === 404) { localStorage.setItem("promptLibrary", "[]"); return { success: true }; }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const info = await resp.json();
    const data = JSON.parse(atob(info.content.replace(/\n/g, "")));
    localStorage.setItem("promptLibrary", JSON.stringify(data));
    return { success: true, count: data.length };
  } catch (e) { console.error("下载失败:", e); return { success: false, error: e.message }; }
}

async function upload() {
  if (!getUserId()) throw new Error("未登录");
  const raw = localStorage.getItem("promptLibrary") || "[]";
  let sha = null;
  const getResp = await fetch(`${GITHUB.api}?ref=master`, {
    headers: { Authorization: `token ${GITHUB.token}`, Accept: "application/vnd.github.v3+json" }
  });
  if (!getResp.ok) throw new Error(`获取 SHA 失败: HTTP ${getResp.status}`);
  sha = (await getResp.json()).sha;
  const body = { message: "存档", content: btoa(unescape(encodeURIComponent(raw))), branch: "master", sha };
  const resp = await fetch(GITHUB.api, {
    method: "PUT",
    headers: { Authorization: `token ${GITHUB.token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (resp.status === 409) {
    // 冲突时用新 SHA 重试一次
    const retry = await fetch(`${GITHUB.api}?ref=master`, { headers: { Authorization: `token ${GITHUB.token}`, Accept: "application/vnd.github.v3+json" } });
    if (!retry.ok) throw new Error(`重试失败: HTTP ${retry.status}`);
    body.sha = (await retry.json()).sha;
    const retryResp = await fetch(GITHUB.api, {
      method: "PUT",
      headers: { Authorization: `token ${GITHUB.token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!retryResp.ok) throw new Error(`上传失败: HTTP ${retryResp.status}`);
  } else if (!resp.ok) {
    throw new Error(`上传失败: HTTP ${resp.status}`);
  }
}

async function initSync() { return await restore(); }
function isOnline() { return navigator.onLine; }
function setupNetworkListeners(onOnline, onOffline) {
  window.addEventListener("online", () => onOnline && onOnline());
  window.addEventListener("offline", () => onOffline && onOffline());
}