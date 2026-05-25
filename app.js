/* ============================================================
   万晨图影设计 — 应用逻辑
   ============================================================ */

/* ============================================================
   案例数据
   覆盖 5 种类型，每种至少 2 个，共计 10+ 个案例
   ============================================================ */
const casesData = [
  // === 产品渲染 (2个) ===
  {
    id: 1,
    title: "高端茶具系列电商主图",
    industry: "电商品牌",
    type: "产品渲染",
    client: "云栖茶器",
    description: "客户需要一套高端茶具的电商平台主图，要求展现陶瓷质感与东方美学。我们从产品线稿出发，经过材质指定、光影测试，最终交付了 8 张多角度产品渲染图，让产品在天猫旗舰店上线首周即获得 35% 的点击率提升。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/f0a050?text=初探-线稿与构图", label: "初探：线稿与构图" },
      { src: "https://placehold.co/800x600/1a1a2e/d8853a?text=定调-材质与光影", label: "定调：材质与光影" },
      { src: "https://placehold.co/800x600/1a1a2e/ffd700?text=精修-成品渲染", label: "精修：成品渲染" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/f0a050?text=茶具-主图1",
      "https://placehold.co/800x800/0a0a1e/d8853a?text=茶具-主图2",
      "https://placehold.co/800x800/0a0a1e/ffd700?text=茶具-主图3"
    ],
    testimonial: "万晨团队完全理解了我们想要的'静奢'风格，产品质感比实拍还要出色。",
    deliverable: "8 张 3000x3000px PNG 主图 + 4 张 1080x1080px 社交媒体版本",
    tags: ["产品摄影", "电商", "陶瓷", "东方美学"]
  },
  {
    id: 2,
    title: "智能手表场景化展示",
    industry: "电商品牌",
    type: "产品渲染",
    client: "锐步科技",
    description: "新发布的智能手表需要在不同生活场景中展示，包括运动、商务、户外三种模式。我们利用 AI 场景合成技术，将产品无缝融入真实感场景，实现了传统拍摄难以达到的视觉效果。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/7b5cfc?text=初探-产品白底图", label: "初探：产品白底图" },
      { src: "https://placehold.co/800x600/1a1a2e/4a60d4?text=定调-场景匹配", label: "定调：场景匹配" },
      { src: "https://placehold.co/800x600/1a1a2e/f0a050?text=精修-色彩统一", label: "精修：色彩统一" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/7b5cfc?text=手表-运动场景",
      "https://placehold.co/800x800/0a0a1e/4a60d4?text=手表-商务场景",
      "https://placehold.co/800x800/0a0a1e/f0a050?text=手表-户外场景"
    ],
    testimonial: "三种场景的融合度远超预期，省去了大量布景拍摄成本。",
    deliverable: "12 张 2500x2500px JPG 场景图 + PSD 分层源文件",
    tags: ["智能穿戴", "场景合成", "电商", "科技产品"]
  },

  // === 概念设定 (2个) ===
  {
    id: 3,
    title: "赛博朋克世界观概念设定",
    industry: "游戏影视",
    type: "概念设定",
    client: "星核互娱",
    description: "为即将开发的开放世界 RPG 游戏构建赛博朋克风格的世界观视觉体系。从灵感板收集到粗稿探索，再到多轮迭代打磨，最终形成了包含城市天际线、街区小巷、霓虹市集三个主题的完整概念设定集。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/e040fb?text=灵感板-参考搜集", label: "灵感板：参考搜集" },
      { src: "https://placehold.co/800x600/1a1a2e/9b59b6?text=粗稿-方向探索", label: "粗稿：方向探索" },
      { src: "https://placehold.co/800x600/1a1a2e/c0392b?text=迭代-细节打磨", label: "迭代：细节打磨" },
      { src: "https://placehold.co/800x600/1a1a2e/f0a050?text=最终-完整设定", label: "最终：完整设定" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/e040fb?text=赛博-天际线",
      "https://placehold.co/800x800/0a0a1e/9b59b6?text=赛博-街区",
      "https://placehold.co/800x800/0a0a1e/c0392b?text=赛博-市集"
    ],
    testimonial: "这套概念设定直接成为了我们美术团队的视觉圣经，省去了至少两个月的风格探索期。",
    deliverable: "3 套完整概念设定（每套 6-8 张）+ 配色方案文档",
    tags: ["游戏", "赛博朋克", "概念设计", "世界观"]
  },
  {
    id: 4,
    title: "奇幻小说场景概念图",
    industry: "游戏影视",
    type: "概念设定",
    client: "云端动画工作室",
    description: "为一部奇幻题材动画电影设计关键场景概念图，包括精灵森林、龙巢火山、浮空城堡三个核心场景。通过 AI 快速迭代，两天内完成了传统需要两周的概念探索工作。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/2ecc71?text=灵感板-自然参考", label: "灵感板：自然参考" },
      { src: "https://placehold.co/800x600/1a1a2e/27ae60?text=粗稿-色调实验", label: "粗稿：色调实验" },
      { src: "https://placehold.co/800x600/1a1a2e/1abc9c?text=迭代-氛围强化", label: "迭代：氛围强化" },
      { src: "https://placehold.co/800x600/1a1a2e/16a085?text=最终-场景定稿", label: "最终：场景定稿" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/2ecc71?text=奇幻-精灵森林",
      "https://placehold.co/800x800/0a0a1e/e67e22?text=奇幻-龙巢火山",
      "https://placehold.co/800x800/0a0a1e/3498db?text=奇幻-浮空城堡"
    ],
    testimonial: "AI 生成的速度和多样性令人震惊，让我们在前期就能和投资人进行有效的视觉沟通。",
    deliverable: "3 组场景概念图（每组 5 张）+ 风格指南文档",
    tags: ["动画", "奇幻", "场景设计", "概念艺术"]
  },

  // === 艺术风格化 (2个) ===
  {
    id: 5,
    title: "儿童绘本插画风格化",
    industry: "出版文创",
    type: "艺术风格化",
    client: "蒲公英童书",
    description: "将作者手绘的线稿转化为温暖水彩风格的绘本插画。我们以原作为基础，通过 AI 风格迁移技术保留了原作构图，同时赋予画面柔和细腻的水彩质感，完美契合 3-6 岁儿童的审美需求。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/ff6b6b?text=原作-手绘线稿", label: "原作：手绘线稿" },
      { src: "https://placehold.co/800x600/1a1a2e/f0a050?text=生成-水彩风格", label: "生成：水彩风格" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/ff6b6b?text=绘本-封面",
      "https://placehold.co/800x800/0a0a1e/ee5a24?text=绘本-内页1",
      "https://placehold.co/800x800/0a0a1e/f0932b?text=绘本-内页2"
    ],
    testimonial: "水彩效果非常自然，印刷出来的质感让作者本人也非常惊喜。",
    deliverable: "24 页绘本插画（CMYK 300dpi TIFF）",
    tags: ["绘本", "水彩", "风格迁移", "儿童"]
  },
  {
    id: 6,
    title: "经典油画风格肖像生成",
    industry: "出版文创",
    type: "艺术风格化",
    client: "雅集文化传媒",
    description: "为一本历史人物传记配图，需要将现代演员照片转化为 19 世纪古典油画风格的肖像。AI 精准捕捉了光影层次与笔触纹理，使生成结果具备真实的油画质感。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/8e44ad?text=原作-演员照片", label: "原作：演员照片" },
      { src: "https://placehold.co/800x600/1a1a2e/c0392b?text=生成-古典油画", label: "生成：古典油画" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/8e44ad?text=油画肖像-1",
      "https://placehold.co/800x800/0a0a1e/9b59b6?text=油画肖像-2",
      "https://placehold.co/800x800/0a0a1e/7b5cfc?text=油画肖像-3"
    ],
    testimonial: "油画质感的还原度非常高，读者反馈说像是看到了真正的历史画像。",
    deliverable: "6 幅古典油画风格肖像（A4 300dpi）",
    tags: ["油画", "肖像", "历史", "风格迁移"]
  },

  // === 场景合成 (2个) ===
  {
    id: 7,
    title: "户外露营装备场景展示",
    industry: "电商品牌",
    type: "场景合成",
    client: "山脊户外",
    description: "将多款露营装备（帐篷、睡袋、炉具等）合成到统一的高山湖泊场景中。通过分层渲染技术，精确控制每件产品的位置、光影和透视关系，确保场景真实可信。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/00b894?text=背景层-自然场景", label: "背景层：自然场景" },
      { src: "https://placehold.co/800x600/1a1a2e/00cec9?text=主体层-帐篷", label: "主体层：帐篷" },
      { src: "https://placehold.co/800x600/1a1a2e/0984e3?text=配件层-装备", label: "配件层：装备" },
      { src: "https://placehold.co/800x600/1a1a2e/6c5ce7?text=", label: "氛围层：光影雾化" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/00b894?text=露营-全景",
      "https://placehold.co/800x800/0a0a1e/00cec9?text=露营-近景",
      "https://placehold.co/800x800/0a0a1e/0984e3?text=露营-特写"
    ],
    testimonial: "一张图就完整展示了全系列产品，节省了大量外拍预算。",
    deliverable: "3 张 4000x3000px 场景合成图 + 分层 PSD",
    tags: ["户外", "场景合成", "电商", "多产品展示"]
  },
  {
    id: 8,
    title: "房地产项目景观可视化",
    industry: "空间建筑",
    type: "场景合成",
    client: "锦绣地产",
    description: "为新开发的滨江住宅项目制作景观可视化效果图。将建筑设计图纸与 AI 生成的自然景观（植被、水系、天空）融合，呈现出春夏秋冬四季不同的社区氛围。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/00b894?text=底层-航拍基底", label: "底层：航拍基底" },
      { src: "https://placehold.co/800x600/1a1a2e/0984e3?text=建筑层-3D模型", label: "建筑层：3D 模型" },
      { src: "https://placehold.co/800x600/1a1a2e/2ecc71?text=", label: "植被层：景观绿化" },
      { src: "https://placehold.co/800x600/1a1a2e/f0a050?text=", label: "氛围层：季节光照" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/00b894?text=滨江-春天",
      "https://placehold.co/800x800/0a0a1e/0984e3?text=滨江-夏天",
      "https://placehold.co/800x800/0a0a1e/f0a050?text=滨江-秋天"
    ],
    deliverable: "4 张 6000x4000px 景观效果图",
    tags: ["房地产", "景观", "建筑可视化", "四季"]
  },

  // === 角色设计 (2个) ===
  {
    id: 9,
    title: "国风武侠游戏角色设计",
    industry: "游戏影视",
    type: "角色设计",
    client: "沧海游戏",
    description: "为一款国风武侠 MMORPG 设计主角团四大门派角色。从人物背景故事出发，历经草稿、线稿、上色、细节四个阶段，最终交付了完整的角色立绘和三视图。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/6c5ce7?text=草稿-人物剪影", label: "草稿：人物剪影" },
      { src: "https://placehold.co/800x600/1a1a2e/a29bfe?text=线稿-结构细化", label: "线稿：结构细化" },
      { src: "https://placehold.co/800x600/1a1a2e/f0a050?text=上色-配色方案", label: "上色：配色方案" },
      { src: "https://placehold.co/800x600/1a1a2e/d8853a?text=最终-细节完稿", label: "最终：细节完稿" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/6c5ce7?text=角色-剑侠",
      "https://placehold.co/800x800/0a0a1e/a29bfe?text=角色-医仙",
      "https://placehold.co/800x800/0a0a1e/f0a050?text=角色-刺客"
    ],
    testimonial: "角色设计兼具武侠韵味和现代审美，玩家社区的期待值非常高。",
    deliverable: "4 个角色完整立绘 + 三视图 + 表情集",
    tags: ["游戏", "国风", "角色设计", "武侠"]
  },
  {
    id: 10,
    title: "虚拟偶像形象设计",
    industry: "游戏影视",
    type: "角色设计",
    client: "星潮娱乐",
    description: "为虚拟偶像团体设计三位成员的形象。风格定位为'未来感 + 亲和力'，每位成员有独特的色彩主题和性格特征。AI 辅助下三天内完成了从概念到精稿的全流程。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/e040fb?text=草稿-风格探索", label: "草稿：风格探索" },
      { src: "https://placehold.co/800x600/1a1a2e/9b59b6?text=线稿-造型确定", label: "线稿：造型确定" },
      { src: "https://placehold.co/800x600/1a1a2e/f0a050?text=上色-主题色系", label: "上色：主题色系" },
      { src: "https://placehold.co/800x600/1a1a2e/ff6b6b?text=最终-精稿输出", label: "最终：精稿输出" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/e040fb?text=虚拟偶像-A",
      "https://placehold.co/800x800/0a0a1e/9b59b6?text=虚拟偶像-B",
      "https://placehold.co/800x800/0a0a1e/f0a050?text=虚拟偶像-C"
    ],
    testimonial: "三位成员的视觉区分度完美，粉丝一眼就能记住每个人。",
    deliverable: "3 位虚拟偶像形象（全身立绘 + 头像 + 表情包）",
    tags: ["虚拟偶像", "角色设计", "未来感", "团体"]
  },

  // === 空间建筑类额外 ===
  {
    id: 11,
    title: "精品酒店室内设计渲染",
    industry: "空间建筑",
    type: "场景合成",
    client: "悦旅酒店集团",
    description: "为新概念精品酒店制作大堂与客房的室内渲染图。通过 AI 场景合成技术，将设计方案的 CAD 线框图转化为照片级真实感渲染，帮助客户在施工前进行效果验证。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/00b894?text=结构层-线框模型", label: "结构层：线框模型" },
      { src: "https://placehold.co/800x600/1a1a2e/0984e3?text=材质层-家具陈设", label: "材质层：家具陈设" },
      { src: "https://placehold.co/800x600/1a1a2e/2ecc71?text=", label: "光影层：照明方案" },
      { src: "https://placehold.co/800x600/1a1a2e/f0a050?text=", label: "氛围层：色调统一" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/00b894?text=酒店-大堂",
      "https://placehold.co/800x800/0a0a1e/0984e3?text=酒店-客房",
      "https://placehold.co/800x800/0a0a1e/2ecc71?text=酒店-餐厅"
    ],
    testimonial: "渲染效果让投资人直接批准了设计方案，加速了项目进程。",
    deliverable: "6 张 5000x3500px 室内渲染图",
    tags: ["酒店", "室内设计", "渲染", "商业空间"]
  },
  {
    id: 12,
    title: "城市公园景观概念设计",
    industry: "空间建筑",
    type: "概念设定",
    client: "市政规划设计院",
    description: "为城市新区中央公园制作概念设计方案图。将航拍实景与 AI 生成的景观元素（步道、水景、植被、公共设施）融合，展示不同季节和时段的空间氛围。",
    processImages: [
      { src: "https://placehold.co/800x600/1a1a2e/2ecc71?text=灵感板-参考案例", label: "灵感板：参考案例" },
      { src: "https://placehold.co/800x600/1a1a2e/27ae60?text=粗稿-功能分区", label: "粗稿：功能分区" },
      { src: "https://placehold.co/800x600/1a1a2e/1abc9c?text=迭代-植被配置", label: "迭代：植被配置" },
      { src: "https://placehold.co/800x600/1a1a2e/16a085?text=最终-全景概念", label: "最终：全景概念" }
    ],
    finalImages: [
      "https://placehold.co/800x800/0a0a1e/2ecc71?text=公园-鸟瞰",
      "https://placehold.co/800x800/0a0a1e/27ae60?text=公园-水景区",
      "https://placehold.co/800x800/0a0a1e/1abc9c?text=公园-休闲区"
    ],
    deliverable: "3 张全景概念图 + 功能分区说明图",
    tags: ["景观设计", "城市规划", "公园", "概念方案"]
  }
];

/* ============================================================
   Hash 路由系统
   ============================================================ */
const views = {
  home: document.getElementById('view-home'),
  portfolio: document.getElementById('view-portfolio'),
  detail: document.getElementById('view-detail')
};

function parseHash() {
  const hash = location.hash.slice(1) || 'home';
  if (hash.startsWith('detail/')) {
    return { view: 'detail', caseId: parseInt(hash.split('/')[1]) };
  }
  if (hash.startsWith('portfolio')) {
    const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
    return { view: 'portfolio', industry: params.get('industry') || 'all', type: params.get('type') || 'all' };
  }
  return { view: hash, industry: 'all', type: 'all' };
}

function switchView(viewName) {
  Object.keys(views).forEach(k => {
    views[k].classList.toggle('active', k === viewName);
  });
}

function updateNavHighlight(viewName, sub) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const nav = link.dataset.nav;
    if (viewName === 'portfolio' && nav === 'portfolio') {
      link.classList.add('active');
    } else if (viewName === 'home' && nav === 'home') {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ============================================================
   导航滚动加深 & 汉堡菜单
   ============================================================ */
const navBar = document.getElementById('navBar');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navBar.classList.toggle('scrolled', window.scrollY > 60);
});

hamburgerBtn.addEventListener('click', () => {
  hamburgerBtn.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// 点击导航链接关闭移动菜单
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburgerBtn.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ============================================================
   首页 — 精选案例渲染
   ============================================================ */
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = casesData.slice(0, 6);
  grid.innerHTML = featured.map(c => caseCardHTML(c)).join('');
}

/* ============================================================
   首页 — 客户卡片点击
   ============================================================ */
document.querySelectorAll('.client-card').forEach(card => {
  card.addEventListener('click', () => {
    const industry = card.dataset.industry;
    location.hash = `portfolio?industry=${encodeURIComponent(industry)}&type=all`;
  });
});

/* ============================================================
   作品集 — 筛选与渲染
   ============================================================ */
let currentIndustry = 'all';
let currentType = 'all';

function renderPortfolio(industry, type) {
  currentIndustry = industry;
  currentType = type;

  // 更新筛选标签状态
  document.querySelectorAll('#filterIndustry .filter-tag').forEach(tag => {
    tag.classList.toggle('active', tag.dataset.value === industry);
  });
  document.querySelectorAll('#filterType .filter-tag').forEach(tag => {
    tag.classList.toggle('active', tag.dataset.value === type);
  });

  const filtered = casesData.filter(c => {
    const matchIndustry = industry === 'all' || c.industry === industry;
    const matchType = type === 'all' || c.type === type;
    return matchIndustry && matchType;
  });

  const grid = document.getElementById('portfolioGrid');
  const empty = document.getElementById('emptyState');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    // 动画：淡出 -> 渲染 -> 淡入
    grid.style.opacity = '0';
    grid.style.transition = 'opacity 0.25s ease';
    setTimeout(() => {
      grid.innerHTML = filtered.map(c => caseCardHTML(c)).join('');
      grid.style.opacity = '1';
    }, 250);
  }
}

// 筛选标签点击
document.querySelectorAll('.filter-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    const group = tag.closest('.filter-tags');
    const isIndustry = group.id === 'filterIndustry';
    const value = tag.dataset.value;
    const industry = isIndustry ? value : currentIndustry;
    const type = isIndustry ? currentType : value;
    location.hash = `portfolio?industry=${encodeURIComponent(industry)}&type=${encodeURIComponent(type)}`;
  });
});

/* ============================================================
   案例卡片 HTML 生成
   ============================================================ */
function caseCardHTML(c) {
  const badgeClassMap = {
    '产品渲染': 'badge-ai',
    '概念设定': 'badge-concept',
    '艺术风格化': 'badge-art',
    '场景合成': 'badge-scene',
    '角色设计': 'badge-character'
  };
  const badgeClass = badgeClassMap[c.type] || 'badge-ai';

  let indicatorHTML = '';
  switch (c.type) {
    case '产品渲染':
      indicatorHTML = '<div class="card-type-indicator indicator-grid"></div>';
      break;
    case '概念设定':
      indicatorHTML = '<div class="card-type-indicator indicator-grid"></div>';
      break;
    case '艺术风格化':
      indicatorHTML = '<div class="card-type-indicator"><div class="indicator-palette"><span style="background:#ff6b6b"></span><span style="background:#f0a050"></span><span style="background:#7b5cfc"></span></div></div>';
      break;
    case '场景合成':
      indicatorHTML = '<div class="card-type-indicator indicator-frame"></div>';
      break;
    case '角色设计':
      indicatorHTML = '<div class="card-type-indicator indicator-pose"></div>';
      break;
  }

  const coverImg = c.finalImages && c.finalImages[0] ? c.finalImages[0] :
    `https://placehold.co/800x500/1a1a2e/f0a050?text=${encodeURIComponent(c.title)}`;

  return `
    <div class="case-card" data-case-id="${c.id}" onclick="openDetail(${c.id})">
      <div class="card-image-wrap">
        <img src="${coverImg}" alt="${c.title}" loading="lazy">
        <span class="card-badge ${badgeClass}">${c.type}</span>
        ${indicatorHTML}
      </div>
      <div class="card-info">
        <h4>${c.title}</h4>
        <div class="card-meta">
          <span class="card-tag">${c.industry}</span>
          <span class="card-tag">${c.client}</span>
        </div>
      </div>
      <div class="card-hover-btn">查看详情</div>
    </div>`;
}

/* ============================================================
   案例详情页渲染
   ============================================================ */
function openDetail(caseId) {
  location.hash = `detail/${caseId}`;
}

function renderDetail(caseId) {
  const c = casesData.find(item => item.id === caseId);
  if (!c) { location.hash = 'portfolio'; return; }

  const container = document.getElementById('detailContent');
  const coverImg = c.finalImages && c.finalImages[0] ? c.finalImages[0] :
    `https://placehold.co/1200x500/1a1a2e/f0a050?text=${encodeURIComponent(c.title)}`;

  const finalGalleryHTML = (c.finalImages || []).map((img, i) =>
    `<img src="${img}" alt="${c.title} - 成果 ${i+1}" onclick="openLightbox(${caseId}, ${i})">`
  ).join('');

  const processHTML = renderProcessModule(c);

  // 相关案例（同行业或同类型，排除自身，最多4个）
  const related = casesData.filter(r => r.id !== c.id && (r.industry === c.industry || r.type === c.type)).slice(0, 4);

  container.innerHTML = `
    <div class="detail-header">
      <img src="${coverImg}" alt="${c.title}">
      <div class="detail-header-overlay">
        <h1>${c.title}</h1>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-brief">
        <div class="detail-quote">${c.description}</div>
        <div class="detail-meta-card">
          <div class="meta-row"><span class="label">客户</span><span class="value">${c.client}</span></div>
          <div class="meta-row"><span class="label">行业</span><span class="value">${c.industry}</span></div>
          <div class="meta-row"><span class="label">需求类型</span><span class="value">${c.type}</span></div>
          <div class="meta-row"><span class="label">交付规格</span><span class="value">${c.deliverable}</span></div>
          ${c.testimonial ? `<div class="meta-row" style="flex-direction:column;align-items:flex-start;gap:4px"><span class="label">客户评价</span><span class="value" style="font-style:italic;font-weight:400">"${c.testimonial}"</span></div>` : ''}
        </div>
      </div>

      <div class="detail-section-title">创意过程</div>
      <div class="process-section">${processHTML}</div>

      <div class="detail-section-title">最终成果</div>
      <div class="final-gallery">${finalGalleryHTML}</div>

      ${related.length > 0 ? `
      <div class="related-section">
        <div class="detail-section-title">相关案例</div>
        <div class="related-scroll">
          ${related.map(r => caseCardHTML(r)).join('')}
        </div>
      </div>` : ''}
    </div>`;

  // 初始化创意过程交互
  initProcessInteractions(c, container);
}

/* ============================================================
   创意过程模块渲染
   ============================================================ */
function renderProcessModule(c) {
  const imgs = c.processImages || [];

  switch (c.type) {
    case '产品渲染':
      return `
        <div class="process-carousel" id="processCarousel">
          ${imgs.map(img => `
            <div class="proc-item">
              <img src="${img.src}" alt="${img.label}" loading="lazy">
              <div class="proc-label">${img.label}</div>
            </div>`).join('')}
        </div>`;

    case '概念设定':
      return `
        <div class="process-timeline">
          ${imgs.map(img => `
            <div class="timeline-item">
              <img src="${img.src}" alt="${img.label}" loading="lazy">
              <div class="tl-label">${img.label}</div>
            </div>`).join('')}
        </div>`;

    case '艺术风格化':
      const beforeImg = imgs[0] || { src: 'https://placehold.co/700x466/1a1a2e/ff6b6b?text=原作', label: '原作' };
      const afterImg = imgs[1] || { src: 'https://placehold.co/700x466/1a1a2e/f0a050?text=生成', label: '生成' };
      return `
        <div class="compare-slider" id="compareSlider">
          <img src="${afterImg.src}" alt="${afterImg.label}">
          <div class="compare-before" id="compareBefore">
            <img src="${beforeImg.src}" alt="${beforeImg.label}">
          </div>
          <div class="compare-handle"></div>
        </div>
        <div class="compare-labels">
          <span>${beforeImg.label}</span><span>${afterImg.label}</span>
        </div>`;

    case '场景合成':
      return `
        <div class="layer-toggle-list" id="layerList">
          ${imgs.map((img, i) => `
            <div class="layer-toggle-item ${i === 0 ? 'active' : ''}" data-layer="${i}">
              <div class="layer-checkbox"></div>
              <span class="layer-name">${img.label || '第'+(i+1)+'层'}</span>
              <img class="layer-thumb" src="${img.src}" alt="" loading="lazy">
            </div>`).join('')}
        </div>`;

    case '角色设计':
      return `
        <div class="evolution-slideshow" id="evolutionSlides">
          ${imgs.map((img, i) => `
            <div class="evolution-slide ${i === 0 ? 'active' : ''}" data-evo="${i}">
              <img src="${img.src}" alt="${img.label}" loading="lazy">
              <div class="ev-label">${img.label}</div>
            </div>`).join('')}
        </div>
        <div class="evolution-nav" id="evoNav">
          ${imgs.map((_, i) => `<div class="evo-dot ${i === 0 ? 'active' : ''}" data-evo="${i}"></div>`).join('')}
        </div>`;

    default:
      return `<p style="color:var(--white-50)">暂无过程展示</p>`;
  }
}

/* ============================================================
   创意过程交互初始化
   ============================================================ */
function initProcessInteractions(c, container) {
  // 对比滑块
  if (c.type === '艺术风格化') {
    const slider = container.querySelector('#compareSlider');
    const before = container.querySelector('#compareBefore');
    if (slider && before) {
      let dragging = false;
      const move = (clientX) => {
        const rect = slider.getBoundingClientRect();
        let pct = (clientX - rect.left) / rect.width;
        pct = Math.max(0.05, Math.min(0.95, pct));
        before.style.width = (pct * 100) + '%';
        const handle = slider.querySelector('.compare-handle');
        if (handle) handle.style.left = (pct * 100) + '%';
      };
      slider.addEventListener('mousedown', (e) => { dragging = true; move(e.clientX); });
      slider.addEventListener('touchstart', (e) => { dragging = true; move(e.touches[0].clientX); });
      window.addEventListener('mousemove', (e) => { if (dragging) move(e.clientX); });
      window.addEventListener('touchmove', (e) => { if (dragging) move(e.touches[0].clientX); });
      window.addEventListener('mouseup', () => { dragging = false; });
      window.addEventListener('touchend', () => { dragging = false; });
    }
  }

  // 分层图解
  if (c.type === '场景合成') {
    container.querySelectorAll('.layer-toggle-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('active');
      });
    });
  }

  // 设计演变幻灯片
  if (c.type === '角色设计') {
    const slides = container.querySelectorAll('.evolution-slide');
    const dots = container.querySelectorAll('.evo-dot');
    function goEvo(idx) {
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
    dots.forEach(dot => {
      dot.addEventListener('click', () => goEvo(parseInt(dot.dataset.evo)));
    });
  }
}

/* ============================================================
   全屏灯箱
   ============================================================ */
let lightboxCaseId = null;
let lightboxIndex = 0;
let lightboxImages = [];

function openLightbox(caseId, startIdx) {
  const c = casesData.find(item => item.id === caseId);
  if (!c || !c.finalImages || c.finalImages.length === 0) return;

  lightboxCaseId = caseId;
  lightboxImages = c.finalImages;
  lightboxIndex = startIdx;
  showLightboxImage();

  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLightboxImage() {
  const img = document.getElementById('lightboxImg');
  const title = document.getElementById('lightboxTitle');
  const counter = document.getElementById('lightboxCounter');
  const download = document.getElementById('lightboxDownload');

  img.src = lightboxImages[lightboxIndex];
  title.textContent = `成果 ${lightboxIndex + 1}`;
  counter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
  download.href = lightboxImages[lightboxIndex];
  download.download = `成果_${lightboxIndex + 1}.jpg`;
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  showLightboxImage();
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  showLightboxImage();
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', lightboxPrev);
document.getElementById('lightboxNext').addEventListener('click', lightboxNext);

// 键盘导航
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev();
  if (e.key === 'ArrowRight') lightboxNext();
});

// 触摸滑动
let touchStartX = 0;
document.getElementById('lightbox').addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});
document.getElementById('lightbox').addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? lightboxNext() : lightboxPrev();
  }
});

/* ============================================================
   路由监听
   ============================================================ */
function handleRoute() {
  const { view, caseId, industry, type } = parseHash();

  switchView(view);
  updateNavHighlight(view);

  if (view === 'home') {
    renderFeatured();
  } else if (view === 'portfolio') {
    renderPortfolio(industry || 'all', type || 'all');
  } else if (view === 'detail' && caseId) {
    renderDetail(caseId);
  }
}

window.addEventListener('hashchange', handleRoute);

/* ============================================================
   初始化
   ============================================================ */
handleRoute();