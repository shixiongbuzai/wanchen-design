/* ===== 数据管理 ===== */

const DEFAULT_WORKS = [
  {
    id: 1716566400000,
    imageUrl: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=600&h=400&fit=crop",
    prompt: "A breathtaking futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars cruising between towering skyscrapers, photo-realistic, 8K ultra HD, cinematic lighting, volumetric fog, ray tracing, highly detailed",
    tags: ["赛博朋克", "夜景", "未来城市"],
    note: "适合做科幻主题壁纸，搭配霓虹色调效果更佳",
    createdAt: "2024-05-24T12:00:00.000Z"
  },
  {
    id: 1716652800000,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    prompt: "Epic mountain landscape at golden hour, majestic peaks with snow caps, crystal clear lake reflecting the mountains, warm sunlight rays breaking through clouds, National Geographic style, award-winning nature photography",
    tags: ["风景", "自然", "山"],
    note: "强调黄金时段的暖色调，适合风景类生成",
    createdAt: "2024-05-25T12:00:00.000Z"
  },
  {
    id: 1716739200000,
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop",
    prompt: "Professional portrait of a woman in her 30s, soft studio lighting, shallow depth of field, bokeh background, wearing elegant casual attire, natural smile, fashion magazine quality, shot on 85mm prime lens, f/1.4",
    tags: ["人物", "肖像", "摄影"],
    note: "适用于 Stable Diffusion 的人物肖像生成，浅景深效果突出",
    createdAt: "2024-05-26T12:00:00.000Z"
  },
  {
    id: 1716825600000,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop",
    prompt: "Futuristic laptop on a clean white desk with minimal desk setup, screen displaying holographic UI interface, soft ambient lighting, product photography, clean composition, 4K resolution, Apple-style commercial aesthetic",
    tags: ["产品", "科技", "极简"],
    note: "电商产品图风格，纯白背景 + 柔和光源",
    createdAt: "2024-05-27T12:00:00.000Z"
  },
  {
    id: 1716912000000,
    imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=400&fit=crop",
    prompt: "Modern architectural marvel, sweeping curves of a futuristic museum, glass and steel structure, sunset sky with dramatic clouds, architectural photography, symmetry, leading lines, ultra-wide angle lens, HDR",
    tags: ["建筑", "现代", "设计"],
    note: "建筑摄影类，强调几何线条与光影对比",
    createdAt: "2024-05-28T12:00:00.000Z"
  }
];

let works = [];
let currentFilterTag = null;
let editingWorkId = null;

function loadData() {
  const raw = localStorage.getItem("promptLibrary");
  if (raw) {
    try {
      works = JSON.parse(raw);
    } catch (e) {
      works = [];
    }
  }
  if (!works || works.length === 0) {
    works = JSON.parse(JSON.stringify(DEFAULT_WORKS));
    saveData();
  }
}

function saveData() {
  localStorage.setItem("promptLibrary", JSON.stringify(works));
  updateStorageStats();
}

/* ===== Toast 提示 ===== */

function showToast(message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 2500);
}

/* ===== 工具函数 ===== */

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function getAllTags() {
  const tagSet = new Set();
  works.forEach(w => w.tags.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

function filterWorks() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  return works.filter(w => {
    const matchTag = !currentFilterTag || w.tags.includes(currentFilterTag);
    const matchSearch = !query ||
      w.prompt.toLowerCase().includes(query) ||
      w.tags.some(t => t.toLowerCase().includes(query)) ||
      (w.note && w.note.toLowerCase().includes(query));
    return matchTag && matchSearch;
  });
}

/* ===== 画廊渲染 ===== */

function createCard(work) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("data-id", work.id);

  // 图片区
  const imgWrapper = document.createElement("div");
  imgWrapper.className = "card-image-wrapper";

  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.tags.join(", ");
  img.loading = "lazy";
  img.onerror = function() {
    this.src = "data:image/svg+xml," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#333"><rect width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="16">圖片載入失敗</text></svg>'
    );
  };
  imgWrapper.appendChild(img);

  // 遮罩层 + 图标按钮
  const overlay = document.createElement("div");
  overlay.className = "card-overlay";

  const detailBtn = document.createElement("button");
  detailBtn.className = "card-overlay-btn";
  detailBtn.title = "查看详情";
  detailBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
  detailBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openDetail(work.id);
  });

  const editBtn = document.createElement("button");
  editBtn.className = "card-overlay-btn";
  editBtn.title = "编辑";
  editBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openForm(work.id);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "card-overlay-btn";
  deleteBtn.title = "删除";
  deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteWork(work.id);
  });

  overlay.appendChild(detailBtn);
  overlay.appendChild(editBtn);
  overlay.appendChild(deleteBtn);
  imgWrapper.appendChild(overlay);
  card.appendChild(imgWrapper);

  // 标签徽章
  if (work.tags && work.tags.length > 0) {
    const tagContainer = document.createElement("div");
    tagContainer.className = "card-tags";
    const displayTags = work.tags.slice(0, 2);
    displayTags.forEach(tag => {
      const badge = document.createElement("span");
      badge.className = "tag-badge";
      badge.textContent = tag;
      tagContainer.appendChild(badge);
    });
    card.appendChild(tagContainer);
  }

  // 提示词复制区
  if (work.prompt) {
    const promptArea = document.createElement("div");
    promptArea.className = "card-prompt";

    const promptText = document.createElement("span");
    promptText.className = "card-prompt-text";
    promptText.textContent = work.prompt;

    const copyIcon = document.createElement("span");
    copyIcon.className = "card-copy-icon";
    copyIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';

    promptArea.appendChild(promptText);
    promptArea.appendChild(copyIcon);

    promptArea.addEventListener("click", (e) => {
      e.stopPropagation();
      copyPrompt(work.prompt, copyIcon);
    });

    card.appendChild(promptArea);
  }

  // 点击卡片打开详情
  card.addEventListener("click", () => openDetail(work.id));

  return card;
}

function renderGallery(filteredWorks) {
  const gallery = document.getElementById("gallery");
  const emptyState = document.getElementById("emptyState");

  gallery.innerHTML = "";

  if (filteredWorks.length === 0) {
    emptyState.style.display = "flex";
    gallery.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  gallery.style.display = "";

  filteredWorks.forEach(work => {
    gallery.appendChild(createCard(work));
  });
}

/* ===== 复制功能 ===== */

function copyPrompt(text, iconEl) {
  navigator.clipboard.writeText(text).then(() => {
    if (iconEl) {
      iconEl.classList.add("copied");
      iconEl.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => {
        iconEl.classList.remove("copied");
        iconEl.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
      }, 1500);
    }
    showToast("提示词已复制");
  }).catch(() => {
    showToast("复制失败，请手动复制");
  });
}

/* ===== 删除操作 ===== */

function deleteWork(workId) {
  const work = works.find(w => w.id === workId);
  if (!work) return;

  if (!confirm("确定要删除这个作品吗？此操作不可撤销。")) return;

  works = works.filter(w => w.id !== workId);
  saveData();
  refreshAll();
  showToast("作品已删除");

  // 如果详情模态框打开且显示的就是被删除的作品，关闭它
  const detailModal = document.getElementById("detailModal");
  if (detailModal.classList.contains("show") && detailModal.getAttribute("data-current-id") == workId) {
    closeDetail();
  }
}

/* ===== 详情模态框 ===== */

function openDetail(workId) {
  const work = works.find(w => w.id === workId);
  if (!work) return;

  const modal = document.getElementById("detailModal");
  modal.setAttribute("data-current-id", workId);

  document.getElementById("detailImage").src = work.imageUrl;
  document.getElementById("detailImage").onerror = function() {
    this.src = "data:image/svg+xml," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="#333"><rect width="600" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="18">圖片載入失敗</text></svg>'
    );
  };

  // 标签
  const tagsContainer = document.getElementById("detailTags");
  tagsContainer.innerHTML = "";
  if (work.tags && work.tags.length > 0) {
    work.tags.forEach(tag => {
      const badge = document.createElement("span");
      badge.className = "tag-badge";
      badge.textContent = tag;
      tagsContainer.appendChild(badge);
    });
  }

  document.getElementById("detailPrompt").textContent = work.prompt || "";
  document.getElementById("detailImageUrl").textContent = work.imageUrl || "";

  // 一键复制按钮
  const copyBtn = document.getElementById("detailCopyBtn");
  copyBtn.onclick = function() {
    copyPrompt(work.prompt, null);
  };

  // 编辑按钮
  document.getElementById("detailEditBtn").onclick = function() {
    closeDetail();
    openForm(workId);
  };

  // 删除按钮
  document.getElementById("detailDeleteBtn").onclick = function() {
    closeDetail();
    deleteWork(workId);
  };

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeDetail() {
  const modal = document.getElementById("detailModal");
  modal.classList.remove("show");
  modal.removeAttribute("data-current-id");
  document.body.style.overflow = "";
}

// 详情模态框关闭事件
document.getElementById("detailClose").addEventListener("click", closeDetail);
document.getElementById("detailModal").addEventListener("click", function(e) {
  if (e.target === this) closeDetail();
});

// 详情大图点击全屏
document.getElementById("detailImage").addEventListener("click", function() {
  if (this.requestFullscreen) {
    this.requestFullscreen();
  }
});

// ESC 关闭详情
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    const detailModal = document.getElementById("detailModal");
    const formModal = document.getElementById("formModal");
    if (detailModal.classList.contains("show")) {
      closeDetail();
    } else if (formModal.classList.contains("show")) {
      closeForm();
    }
  }
});

/* ===== 添加/编辑表单 ===== */

function openForm(workId) {
  editingWorkId = workId || null;
  const modal = document.getElementById("formModal");
  const title = document.getElementById("formTitle");

  if (workId) {
    title.textContent = "编辑作品";
    const work = works.find(w => w.id === workId);
    if (work) {
      document.getElementById("imageUrl").value = work.imageUrl || "";
      document.getElementById("prompt").value = work.prompt || "";
      document.getElementById("tags").value = (work.tags || []).join(", ");
      document.getElementById("note").value = work.note || "";
      updateImagePreview();
    }
  } else {
    title.textContent = "添加作品";
    document.getElementById("workForm").reset();
    document.getElementById("imagePreview").style.display = "none";
    document.getElementById("tagSuggestions").innerHTML = "";
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeForm() {
  const modal = document.getElementById("formModal");
  modal.classList.remove("show");
  document.body.style.overflow = "";
  editingWorkId = null;
}

// 图片URL实时预览
document.getElementById("imageUrl").addEventListener("input", updateImagePreview);

function updateImagePreview() {
  const url = document.getElementById("imageUrl").value.trim();
  const preview = document.getElementById("imagePreview");
  const img = document.getElementById("previewImg");

  if (url) {
    img.src = url;
    img.onerror = function() {
      preview.style.display = "none";
    };
    img.onload = function() {
      preview.style.display = "block";
    };
  } else {
    preview.style.display = "none";
  }
}

// 标签自动补全
document.getElementById("tags").addEventListener("input", function() {
  const input = this.value;
  const suggestions = document.getElementById("tagSuggestions");

  if (!input) {
    suggestions.innerHTML = "";
    return;
  }

  // 获取当前输入中最后一个逗号后的内容
  const parts = input.split(",");
  const lastPart = parts[parts.length - 1].trim();

  if (!lastPart) {
    suggestions.innerHTML = "";
    return;
  }

  const allTags = getAllTags();
  const matches = allTags.filter(t => t.toLowerCase().includes(lastPart.toLowerCase()) && !parts.slice(0, -1).some(p => p.trim() === t));

  suggestions.innerHTML = "";
  if (matches.length > 0 && lastPart.length >= 1) {
    matches.slice(0, 6).forEach(tag => {
      const chip = document.createElement("span");
      chip.className = "tag-suggestion-chip";
      chip.textContent = tag;
      chip.addEventListener("click", () => {
        parts[parts.length - 1] = " " + tag;
        document.getElementById("tags").value = parts.join(", ");
        suggestions.innerHTML = "";
      });
      suggestions.appendChild(chip);
    });
  }
});

// 表单提交
document.getElementById("workForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const imageUrl = document.getElementById("imageUrl").value.trim();
  const prompt = document.getElementById("prompt").value.trim();
  const tagsRaw = document.getElementById("tags").value.trim();
  const note = document.getElementById("note").value.trim();

  if (!imageUrl || !prompt) {
    showToast("请填写图片链接和提示词");
    return;
  }

  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  if (editingWorkId) {
    const index = works.findIndex(w => w.id === editingWorkId);
    if (index !== -1) {
      works[index].imageUrl = imageUrl;
      works[index].prompt = prompt;
      works[index].tags = tags;
      works[index].note = note;
    }
  } else {
    works.push({
      id: Date.now(),
      imageUrl: imageUrl,
      prompt: prompt,
      tags: tags,
      note: note,
      createdAt: new Date().toISOString()
    });
  }

  saveData();
  refreshAll();
  closeForm();
  showToast(editingWorkId ? "作品已更新" : "作品已添加");
});

// 取消按钮
document.getElementById("formCancelBtn").addEventListener("click", closeForm);
document.getElementById("formClose").addEventListener("click", closeForm);
document.getElementById("formModal").addEventListener("click", function(e) {
  if (e.target === this) closeForm();
});

/* ===== 搜索与筛选 ===== */

document.getElementById("searchInput").addEventListener("input", function() {
  renderGallery(filterWorks());
});

// 标签筛选下拉
const tagFilterBtn = document.getElementById("tagFilterBtn");
const tagDropdown = document.getElementById("tagDropdown");

tagFilterBtn.addEventListener("click", function(e) {
  e.stopPropagation();
  tagDropdown.classList.toggle("show");
  populateTagDropdown();
});

document.addEventListener("click", function() {
  tagDropdown.classList.remove("show");
});

tagDropdown.addEventListener("click", function(e) {
  e.stopPropagation();
});

function populateTagDropdown() {
  const allTags = getAllTags();
  tagDropdown.innerHTML = "";

  // 全部选项
  const allOption = document.createElement("button");
  allOption.className = "tag-option" + (!currentFilterTag ? " active" : "");
  allOption.textContent = "全部标签";
  allOption.addEventListener("click", () => {
    currentFilterTag = null;
    renderGallery(filterWorks());
    tagDropdown.classList.remove("show");
  });
  tagDropdown.appendChild(allOption);

  allTags.forEach(tag => {
    const option = document.createElement("button");
    option.className = "tag-option" + (currentFilterTag === tag ? " active" : "");
    option.textContent = tag;
    option.addEventListener("click", () => {
      currentFilterTag = currentFilterTag === tag ? null : tag;
      renderGallery(filterWorks());
      tagDropdown.classList.remove("show");
    });
    tagDropdown.appendChild(option);
  });
}

/* ===== 设置面板 ===== */

const settingsPanel = document.getElementById("settingsPanel");
const settingsOverlay = document.getElementById("settingsOverlay");

document.getElementById("settingsBtn").addEventListener("click", function() {
  settingsPanel.classList.add("show");
  settingsOverlay.classList.add("show");
  updateStorageStats();
  document.body.style.overflow = "hidden";
});

function closeSettings() {
  settingsPanel.classList.remove("show");
  settingsOverlay.classList.remove("show");
  document.body.style.overflow = "";
}

document.getElementById("settingsClose").addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", closeSettings);

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && settingsPanel.classList.contains("show")) {
    closeSettings();
  }
});

// 导出数据
document.getElementById("exportBtn").addEventListener("click", function() {
  const blob = new Blob([JSON.stringify(works, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "提示词库备份_" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("数据已导出");
});

// 导入数据
document.getElementById("importBtn").addEventListener("click", function() {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!confirm("导入将覆盖当前所有数据，确定继续吗？")) {
    this.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (!Array.isArray(data)) throw new Error("格式无效");
      works = data;
      saveData();
      refreshAll();
      showToast("数据导入成功，共 " + works.length + " 条作品");
    } catch (err) {
      showToast("导入失败：文件格式不正确");
    }
  };
  reader.readAsText(file);
  this.value = "";
});

// 重置为示例数据
document.getElementById("resetBtn").addEventListener("click", function() {
  if (!confirm("确定要重置为示例数据吗？当前所有作品将被删除。")) return;
  works = JSON.parse(JSON.stringify(DEFAULT_WORKS));
  saveData();
  refreshAll();
  showToast("已重置为示例数据");
});

// 暗黑模式切换
const darkModeToggle = document.getElementById("darkModeToggle");

// 恢复暗黑模式偏好
(function initDarkMode() {
  const saved = localStorage.getItem("promptLibraryDarkMode");
  if (saved === "true") {
    document.body.classList.add("dark");
    darkModeToggle.checked = true;
  }
})();

darkModeToggle.addEventListener("change", function() {
  if (this.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("promptLibraryDarkMode", "true");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("promptLibraryDarkMode", "false");
  }
});

// 存储统计
function updateStorageStats() {
  const stats = document.getElementById("storageStats");
  if (!stats) return;
  const bytes = new Blob([JSON.stringify(works)]).size;
  stats.textContent = works.length + " 个作品 | 占用 " + formatBytes(bytes);
}

/* ===== 添加按钮 ===== */

document.getElementById("addBtn").addEventListener("click", function() {
  openForm(null);
});

/* ===== 全量刷新 ===== */

function refreshAll() {
  const filtered = filterWorks();
  renderGallery(filtered);
  updateStorageStats();
}

/* ===== 初始化 ===== */

document.addEventListener("DOMContentLoaded", function() {
  loadData();
  renderGallery(filterWorks());
  updateStorageStats();
});