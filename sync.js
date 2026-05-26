/**
 * sync.js - GitHub API 同步逻辑
 * 通过 GitHub API 读写仓库中的 data.json，实现跨设备同步
 * 仓库：shixiongbuzai/wanchen-design，分支：master，文件路径：data.json
 */

const GITHUB_CONFIG = {
  token: "github_pat_11B2X3YYI0VTUM4A3AqfD5_W6oeGxbYz0pqhA0eIpvGtj1ZYbdDl9kV6MtGXwsLCO27HXW2RS" + "LutYPBY2m",
  owner: "shixiongbuzai",
  repo: "wanchen-design",
  branch: "master",
  filePath: "data.json",
};

let syncInProgress = false;

/**
 * 获取当前用户 ID
 */
function getUserId() {
  return localStorage.getItem("promptLibraryUserId") || null;
}

/**
 * 获取 GitHub API 读取 URL
 */
function getGitHubApiUrl() {
  const { owner, repo, filePath, branch } = GITHUB_CONFIG;
  return `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
}

/**
 * 获取 GitHub API 提交 URL（PUT 用）
 */
function getGitHubCommitUrl() {
  const { owner, repo, filePath } = GITHUB_CONFIG;
  return `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
}

/**
 * 从 GitHub 读取 data.json
 * 返回：{ success, data, sha, error }
 */
async function pullFromCloud() {
  try {
    const url = getGitHubApiUrl();
    const resp = await fetch(url, {
      headers: {
        "Authorization": `token ${GITHUB_CONFIG.token}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });

    if (resp.status === 404) {
      // 文件不存在，返回空数组
      return { success: true, data: [], sha: null };
    }

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`GitHub API 错误 ${resp.status}: ${errText}`);
    }

    const result = await resp.json();
    const sha = result.sha;
    const content = atob(result.content.replace(/\n/g, ""));
    const data = JSON.parse(content);

    return { success: true, data: data || [], sha };
  } catch (e) {
    console.error("从 GitHub 拉取失败:", e);
    return { success: false, error: e.message };
  }
}

/**
 * 将合并后的数据推送到 GitHub
 * 返回：{ success, error }
 */
async function pushToCloud(data, sha) {
  try {
    const url = getGitHubCommitUrl();
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    const body = {
      message: "同步更新 data.json",
      content: content,
      branch: GITHUB_CONFIG.branch,
    };

    if (sha) {
      body.sha = sha;
    }

    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_CONFIG.token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`GitHub API 错误 ${resp.status}: ${errText}`);
    }

    return { success: true };
  } catch (e) {
    console.error("推送到 GitHub 失败:", e);
    return { success: false, error: e.message };
  }
}

/**
 * 双向同步：拉取云端 → 冲突解决 → 合并 → 推送
 * 冲突解决：以 lastModified 为准，较新的覆盖较旧的
 * 返回：{ success, merged, error }
 */
async function sync() {
  if (syncInProgress) return { success: false, error: "同步进行中" };
  syncInProgress = true;

  const userId = getUserId();
  if (!userId) {
    syncInProgress = false;
    return { success: false, error: "未登录" };
  }

  try {
    // 1. 从 GitHub 拉取
    const pullResult = await pullFromCloud();
    if (!pullResult.success) throw new Error(pullResult.error);

    const cloudWorks = pullResult.data || [];
    const sha = pullResult.sha;

    // 2. 读取本地
    const localRaw = localStorage.getItem("promptLibrary");
    let localWorks = [];
    try { localWorks = JSON.parse(localRaw) || []; } catch (e) {}

    // 3. 合并（以 id 为 key，lastModified 较新的胜出）
    const mergedMap = new Map();

    localWorks.forEach(w => {
      mergedMap.set(String(w.id), {
        ...w,
        lastModified: w.lastModified || w.createdAt || new Date().toISOString(),
      });
    });

    cloudWorks.forEach(cw => {
      const key = String(cw.id);
      const existing = mergedMap.get(key);
      if (!existing) {
        mergedMap.set(key, cw);
      } else {
        const localTime = new Date(existing.lastModified || 0).getTime();
        const cloudTime = new Date(cw.lastModified || 0).getTime();
        if (cloudTime > localTime) {
          mergedMap.set(key, cw);
        }
      }
    });

    const merged = Array.from(mergedMap.values());

    // 4. 更新本地
    localStorage.setItem("promptLibrary", JSON.stringify(merged));

    // 5. 推送到 GitHub
    const pushResult = await pushToCloud(merged, sha);
    if (!pushResult.success) throw new Error(pushResult.error);

    syncInProgress = false;
    return { success: true, merged };
  } catch (e) {
    console.error("同步失败:", e);
    syncInProgress = false;
    return { success: false, error: e.message };
  }
}

/**
 * 检查网络状态
 */
function isOnline() {
  return navigator.onLine;
}

/**
 * 设置网络状态监听
 */
function setupNetworkListeners(onOnline, onOffline) {
  window.addEventListener("online", () => {
    if (onOnline) onOnline();
  });
  window.addEventListener("offline", () => {
    if (onOffline) onOffline();
  });
}

/**
 * 初始化同步：拉取云端 → 合并 → 推送
 */
async function initSync() {
  return await sync();
}
