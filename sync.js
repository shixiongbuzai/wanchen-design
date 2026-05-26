/**
 * sync.js - Supabase 同步逻辑
 * 环境变量通过 window.SUPABASE_CONFIG 注入，用户需在 config.js 中填写自己的配置
 */

const SYNC_CONFIG = {
  // 用户需在 index.html 前引入 config.js 并设置 window.SUPABASE_CONFIG
  // 格式：{ url: 'https://xxx.supabase.co', anonKey: 'eyJ...' }
};

let supabaseClient = null;
let syncInProgress = false;

/**
 * 初始化 Supabase 客户端
 */
function initSupabase() {
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg || !cfg.url || !cfg.anonKey) {
    console.warn("Supabase 配置未找到，同步功能不可用");
    return false;
  }
  try {
    supabaseClient = supabase.createClient(cfg.url, cfg.anonKey);
    return true;
  } catch (e) {
    console.error("Supabase 初始化失败:", e);
    return false;
  }
}

/**
 * 获取当前用户 ID（登录时由 AUTH 模块生成并存入 localStorage）
 */
function getUserId() {
  return localStorage.getItem("promptLibraryUserId") || null;
}

/**
 * 从 Supabase 拉取云端数据
 * 返回：{ success, data, error }
 */
async function pullFromCloud() {
  const userId = getUserId();
  if (!userId || !supabaseClient) {
    return { success: false, error: "未登录或 Supabase 未初始化" };
  }

  try {
    const { data, error } = await supabaseClient
      .from("works")
      .select("*")
      .eq("user_id", userId)
      .order("last_modified", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (e) {
    console.error("拉取失败:", e);
    return { success: false, error: e.message };
  }
}

/**
 * 将本地数据推送到 Supabase
 * 策略：全量 upsert（按 id + userId 唯一约束）
 * 返回：{ success, error }
 */
async function pushToCloud(works) {
  const userId = getUserId();
  if (!userId || !supabaseClient) {
    return { success: false, error: "未登录或 Supabase 未初始化" };
  }

  if (!works || works.length === 0) {
    return { success: true };
  }

  const now = new Date().toISOString();
  const records = works.map(w => ({
    id: w.id,
    user_id: userId,
    image_url: w.imageUrl || "",
    prompt: w.prompt || "",
    tags: w.tags || [],
    note: w.note || "",
    created_at: w.createdAt || now,
    last_modified: now,
  }));

  try {
    // 先删除云端已不存在的本地记录
    const { data: existing } = await supabaseClient
      .from("works")
      .select("id")
      .eq("user_id", userId);

    const existingIds = (existing || []).map(r => r.id);
    const localIds = works.map(w => w.id);
    const toDelete = existingIds.filter(id => !localIds.includes(id));

    if (toDelete.length > 0) {
      await supabaseClient
        .from("works")
        .delete()
        .eq("user_id", userId)
        .in("id", toDelete);
    }

    // Upsert 本地数据
    const { error } = await supabaseClient
      .from("works")
      .upsert(records, { onConflict: "id,user_id" });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error("推送失败:", e);
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
  if (!userId || !supabaseClient) {
    syncInProgress = false;
    return { success: false, error: "未登录或 Supabase 未初始化" };
  }

  try {
    // 1. 拉取云端
    const pullResult = await pullFromCloud();
    if (!pullResult.success) throw new Error(pullResult.error);

    const cloudWorks = (pullResult.data || []).map(r => ({
      id: r.id,
      imageUrl: r.image_url,
      prompt: r.prompt,
      tags: r.tags || [],
      note: r.note || "",
      createdAt: r.created_at,
      lastModified: r.last_modified,
    }));

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

    // 5. 推送合并结果到云端
    const pushResult = await pushToCloud(merged);
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
 * 登录后初始化同步：配置 Supabase → 拉取云端 → 合并 → 推送
 * 用户需先在 index.html 的 window.SUPABASE_CONFIG 中填入 project URL 和 anon key
 */
async function initSync() {
  if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
    console.warn("Supabase 未配置，跳过同步");
    return { success: false, error: "Supabase 未配置" };
  }

  if (!initSupabase()) {
    return { success: false, error: "Supabase 客户端初始化失败" };
  }

  return await sync();
}
