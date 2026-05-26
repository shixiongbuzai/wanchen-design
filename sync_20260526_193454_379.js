/* ===== Supabase 同步服务 =====
 *
 * 使用前请在下方填入你的 Supabase 配置：
 * 1. 前往 https://supabase.com 创建项目
 * 2. 在 SQL Editor 中执行建表语句：
 *    CREATE TABLE works (
 *      id BIGINT PRIMARY KEY,
 *      user_id TEXT NOT NULL,
 *      image_url TEXT,
 *      prompt TEXT,
 *      tags TEXT[],
 *      note TEXT,
 *      created_at TEXT,
 *      last_modified TEXT
 *    );
 *    CREATE INDEX idx_works_user_id ON works(user_id);
 * 3. 启用 Row Level Security 并添加策略
 * 4. 将 Project URL 和 Anon Key 填入下方
 */

const SYNC_CONFIG = {
  url: "",         // 你的 Supabase Project URL，如 https://xxxxx.supabase.co
  anonKey: ""      // 你的 Supabase Anon Key
};

// 合并 window.SUPABASE_CONFIG（用户可在 HTML 中的 script 标签填入）
(function() {
  if (window.SUPABASE_CONFIG) {
    if (window.SUPABASE_CONFIG.url) SYNC_CONFIG.url = window.SUPABASE_CONFIG.url;
    if (window.SUPABASE_CONFIG.anonKey) SYNC_CONFIG.anonKey = window.SUPABASE_CONFIG.anonKey;
  }
})();

let supabaseClient = null;
let syncInProgress = false;

/* ===== 初始化 Supabase 客户端 ===== */

function initSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = SYNC_CONFIG.url || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url);
  const anonKey = SYNC_CONFIG.anonKey || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey);

  if (!url || !anonKey) {
    console.warn("Supabase 配置缺失，同步功能不可用。请在 sync.js 或 index.html 中填入 project URL 和 anon key。");
    return null;
  }

  try {
    supabaseClient = supabase.createClient(url, anonKey);
    console.log("Supabase 客户端已初始化");
    return supabaseClient;
  } catch (e) {
    console.error("Supabase 初始化失败:", e);
    supabaseClient = null;
    return null;
  }
}

/* ===== 辅助函数 ===== */

function getUserId() {
  return localStorage.getItem("promptLibraryUserId") || null;
}

function getUserToken() {
  return localStorage.getItem("promptLibraryLoggedIn") === "true" ? "authenticated" : null;
}

/* ===== 云端拉取 (Pull) ===== */

async function pullFromCloud() {
  if (!supabaseClient) return { success: false, error: "Supabase 未初始化" };

  const userId = getUserId();
  if (!userId) return { success: false, error: "未登录" };

  try {
    const { data, error } = await supabaseClient
      .from("works")
      .select("*")
      .eq("user_id", userId)
      .order("last_modified", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map(row => ({
        id: row.id,
        imageUrl: row.image_url,
        prompt: row.prompt,
        tags: row.tags || [],
        note: row.note || "",
        createdAt: row.created_at,
        lastModified: row.last_modified
      }))
    };
  } catch (e) {
    console.error("云端拉取失败:", e);
    return { success: false, error: e.message || "云端拉取失败" };
  }
}

/* ===== 云端推送 (Push) ===== */

async function pushToCloud() {
  if (!supabaseClient) return { success: false, error: "Supabase 未初始化" };

  const userId = getUserId();
  if (!userId) return { success: false, error: "未登录" };

  try {
    const raw = localStorage.getItem("promptLibrary");
    const localWorks = raw ? JSON.parse(raw) : [];

    const rows = localWorks.map(w => ({
      id: w.id,
      user_id: userId,
      image_url: w.imageUrl || "",
      prompt: w.prompt || "",
      tags: w.tags || [],
      note: w.note || "",
      created_at: w.createdAt || new Date().toISOString(),
      last_modified: new Date().toISOString()
    }));

    // 批量 upsert
    const { error } = await supabaseClient
      .from("works")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;

    return { success: true };
  } catch (e) {
    console.error("云端推送失败:", e);
    return { success: false, error: e.message || "云端推送失败" };
  }
}

/* ===== 全量同步 (Pull + Merge + Push) ===== */

async function sync() {
  if (syncInProgress) return { success: false, error: "同步正在进行中" };
  syncInProgress = true;

  try {
    // Step 1: 拉取云端数据
    const pullResult = await pullFromCloud();
    if (!pullResult.success) {
      syncInProgress = false;
      return pullResult;
    }

    const cloudWorks = pullResult.data;

    // Step 2: 拉取本地数据
    const raw = localStorage.getItem("promptLibrary");
    const localWorks = raw ? JSON.parse(raw) : [];

    // Step 3: 合并（最后修改时间优先）
    const merged = {};
    for (const w of localWorks) {
      merged[w.id] = w;
    }
    for (const cw of cloudWorks) {
      if (!merged[cw.id]) {
        merged[cw.id] = cw;
      } else {
        const localTime = merged[cw.id].lastModified || merged[cw.id].createdAt || "";
        const cloudTime = cw.lastModified || cw.createdAt || "";
        if (cloudTime > localTime) {
          merged[cw.id] = cw;
        }
      }
    }

    const mergedArray = Object.values(merged);

    // Step 4: 写回本地
    const localMapped = mergedArray.map(w => ({
      id: w.id,
      imageUrl: w.imageUrl || "",
      prompt: w.prompt || "",
      tags: w.tags || [],
      note: w.note || "",
      createdAt: w.createdAt || new Date().toISOString(),
      lastModified: w.lastModified || new Date().toISOString()
    }));
    localStorage.setItem("promptLibrary", JSON.stringify(localMapped));

    // Step 5: 推送合并后的数据到云端
    const pushResult = await pushToCloud();
    if (!pushResult.success) {
      syncInProgress = false;
      return pushResult;
    }

    syncInProgress = false;
    return { success: true };
  } catch (e) {
    syncInProgress = false;
    console.error("同步失败:", e);
    return { success: false, error: e.message || "同步失败" };
  }
}

/* ===== 网络监听 ===== */

let isOnline = navigator.onLine;

function setupNetworkListeners(onOnline, onOffline) {
  window.addEventListener("online", () => {
    isOnline = true;
    if (typeof onOnline === "function") onOnline();
  });

  window.addEventListener("offline", () => {
    isOnline = false;
    if (typeof onOffline === "function") onOffline();
  });
}

/* ===== initSync — 登录后调用 ===== */

async function initSync() {
  initSupabase();
  if (!supabaseClient) {
    console.warn("initSync: Supabase 未配置，跳过同步");
    return { success: false, error: "Supabase 未配置" };
  }

  const result = await sync();
  if (result.success) {
    console.log("initSync: 初始同步完成");
  } else {
    console.warn("initSync: 初始同步失败:", result.error);
  }
  return result;
}