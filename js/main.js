/**
 * GTA 6 情报站 — Main JavaScript
 * Handles: article loading, filtering, routing, interactions
 */

(function () {
  'use strict';

  // =============================================
  // STATE
  // =============================================
  let articles = [];
  let activeFilter = 'ALL';

  const CATEGORY_MAP = {
    'ALL': '全部文章',
    '预告分析': '预告分析',
    '爆料追踪': '爆料追踪',
    '深度分析': '深度分析',
    '官方动态': '官方动态',
    '角色解析': '角色解析',
    '游戏文化': '游戏文化',
  };

  const CATEGORY_ICONS = {
    '预告分析': '🎬',
    '爆料追踪': '🔍',
    '深度分析': '📊',
    '官方动态': '📢',
    '角色解析': '👤',
    '游戏文化': '🎵',
  };

  // =============================================
  // DOM REFS
  // =============================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days} 天前`;
    if (days < 30) return `${Math.floor(days / 7)} 周前`;

    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatDateFull(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Simple client-side router — check if we're on article detail page
  function getArticleIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  function isHomePage() {
    return !getArticleIdFromURL() &&
           !window.location.pathname.includes('article.html');
  }

  function isArticlePage() {
    return window.location.pathname.includes('article.html');
  }

  // =============================================
  // DATA LOADING
  // =============================================

  // Fallback: embedded article data for local file:// environments
  const EMBEDDED_ARTICLES = [
    {"id":"gta6-trailer2-analysis","title":"GTA 6 第二支预告片深度解析：每个细节都不容错过","excerpt":"Rockstar Games 终于发布了《GTA 6》的第二支官方预告片，我们从逐帧分析中发现了关于游戏玩法、地图规模和角色关系的重磅线索。","content":"<p>距离第一支预告片发布已经过去了数月，Rockstar Games 终于在万众期待中放出了《Grand Theft Auto VI》的第二支官方预告片。这支长达两分半的预告片信息密度极高，我们逐帧进行了详细分析。</p><h2>地图规模确认</h2><p>预告片中出现了多个标志性地点的俯瞰镜头，确认了 Vice City 及其周边地区的庞大开放世界。从迈阿密市中心的霓虹街道到佛罗里达沼泽地，再到基韦斯特风格的群岛区域，整个地图的多样性令人惊叹。据社区制图师的测算，这可能是 GTA 系列史上最大的地图，甚至超过了《GTA V》的洛圣都加上布莱恩郡的总面积。</p><h2>双主角系统革新</h2><p>Jason 和 Lucia 的双主角设定在这支预告片中得到了更多展示。与《GTA V》的三主角切换不同，本作似乎更强调两个角色之间的情感纽带与协作。预告片展示了两人在抢劫任务中的精密配合 —— Lucia 负责社交工程和潜入，Jason 则在外部提供支援和火力掩护。</p><h2>新玩法机制</h2><p>几个关键细节暗示了全新的玩法机制：</p><ul><li>动态天气系统大幅升级，飓风和热带风暴将成为游戏中的重要事件</li><li>角色现在可以进行更多物理互动，包括攀爬、匍匐前进和更流畅的跑酷动作</li><li>社交系统似乎更加深入，预告片中出现了多段角色使用手机社交媒体的画面</li><li>车辆自定义系统全面革新，改装细节前所未有地丰富</li></ul><h2>发售窗口</h2><p>预告片结尾确认了发售窗口：2025年秋季。Rockstar 母公司 Take-Two Interactive 在最近的财报电话会议中也重申了这一时间表，给全球粉丝吃了一颗定心丸。</p>","author":"GTA6情报站","category":"预告分析","tags":["预告片","玩法分析","地图","角色"],"date":"2025-12-15","coverImage":"","readTime":8,"featured":true},{"id":"vice-city-map-leak","title":"Vice City 地图泄露？匿名爆料者称地图面积是洛圣都的2倍","excerpt":"一位匿名爆料者在 Reddit 上发布了一份据称是《GTA 6》完整地图的详细描述，引发社区热议。我们整理了这份爆料的要点。","content":"<p>本周二，Reddit 用户 u/ViceCityInsider2025 在 r/GTA6 子版块发布了一篇长达3000字的帖子，详细描述了据称是《GTA 6》完整地图的每一个区域。虽然该账号随后被删除，但帖子内容已被广泛存档和传播。</p><h2>爆料内容要点</h2><p>根据该匿名用户的描述，地图包含以下主要区域：</p><ul><li><strong>Vice City 主城区</strong>：包括市中心金融区、南海滩艺术装饰区、小哈瓦那文化区等，面积约等于洛圣都市区的1.5倍</li><li><strong>Port Gellhorn 及周边郊区</strong>：位于主城北部，包括工业区、中产阶级社区和广袤的商业中心</li><li><strong>佛罗里达群岛</strong>：由一连串可通过桥梁连接的岛屿组成，包括一个类似基韦斯特的度假胜地</li><li><strong>大沼泽地区</strong>：充满了野生动物、隐藏任务和非法活动的广阔湿地</li><li><strong>古巴/加勒比海区域</strong>：爆料中最令人惊讶的部分 —— 玩家可以在游戏后期解锁一个海外任务区域</li></ul><h2>社区反应</h2><p>知名爆料人 Tom Henderson 对此表示「部分内容与我所了解的信息吻合」，而另一位资深爆料者 Jason Schreier 则在社交媒体上发了一个耐人寻味的「🤔」表情。需要注意的是，目前没有任何官方渠道确认这些信息，大家还是要以官方发布为准。</p>","author":"GTA6情报站","category":"爆料追踪","tags":["地图","泄露","Vice City"],"date":"2025-11-28","coverImage":"","readTime":6,"featured":false},{"id":"gta6-online-economy","title":"GTA 6 Online 经济系统前瞻：Rockstar 在下一盘大棋","excerpt":"从招聘信息、专利文件和业内人士的爆料来看，《GTA 6》的在线模式经济系统将彻底重构，告别通货膨胀时代。","content":"<p>《GTA Online》在过去十年间为 Take-Two 创造了超过80亿美元的收入，但其经济系统一直饱受玩家诟病 —— 通货膨胀失控、鲨鱼卡定价争议、新手入门门槛过高等问题层出不穷。多方信息显示，Rockstar 正在为《GTA 6 Online》设计一套全新的经济系统。</p><h2>全新货币体系</h2><p>根据 Rockstar 在2024年提交的一项专利申请，新作可能采用双货币系统：</p><ul><li><strong>美元（USD）</strong>：可通过任务、抢劫、商业活动获取，用于购买大部分物品</li><li><strong>加密货币（Coin）</strong>」：一种无法直接购买的高级货币，仅能通过高难度活动和赛季通行证获取</li></ul><p>这一设计据称是为了平衡付费玩家和免费玩家之间的差距。</p><h2>动态经济</h2><p>多个职位招聘信息中提到了「动态经济系统设计师」这一岗位。分析人士认为，这意味着游戏内的物价、房产价值甚至犯罪活动的收益将随玩家行为而波动 —— 如果太多玩家抢劫同一家银行，那家银行的安保会升级，收益也会下降。</p><h2>玩家驱动的商业</h2><p>最令人期待的是「玩家驱动型经济」的可能性。泄露的设计文档提到了玩家间交易系统的雏形，包括二手车交易市场、自定义车辆拍卖行，甚至可能允许玩家运营自己的夜店、赌场和走私网络，并与其他玩家进行商业竞争或合作。</p>","author":"GTA6情报站","category":"深度分析","tags":["Online","经济系统","多人模式"],"date":"2025-11-10","coverImage":"","readTime":7,"featured":false},{"id":"rockstar-confirms-fall-2025","title":"官方确认！Take-Two CEO 重申 GTA 6 2025年秋季发售","excerpt":"在最新一季的财报电话会议上，Take-Two Interactive CEO Strauss Zelnick 再次确认《GTA 6》将于2025年秋季如期发售。","content":"<p>Take-Two Interactive 在2025财年第二季度财报电话会议上，CEO Strauss Zelnick 面对分析师的提问，再次确认《Grand Theft Auto VI》的开发正按计划进行，目标发售窗口仍为2025年秋季。</p><h2>关键表态</h2><p>Zelnick 在电话会议中表示：「Rockstar Games 团队正在打造一款超越所有人期待的作品。我们对目前的开发进度感到满意，并期待在2025年秋季将这款游戏带给全球玩家。」</p><p>这一表态是在回应分析师关于近期业界多款3A大作延期发售的担忧。Zelnick 承认新冠疫情后的游戏开发环境仍然充满挑战，但强调 Rockstar 拥有业界最顶尖的开发团队和完善的项目管理流程。</p><h2>市场影响</h2><p>受此消息影响，Take-Two 股价在盘后交易中上涨了4.2%。分析师预测，《GTA 6》首年销售额可能突破30亿美元，有望成为娱乐史上发布规模最大的产品。</p><h2>平台确认</h2><p>在问答环节中，Zelnick 确认游戏将首先登陆 PlayStation 5 和 Xbox Series X|S 平台，PC 版将「按照 Rockstar 的惯例在后续公布更多细节」。这一表态暗示 PC 玩家可能仍需要等待额外的时间。</p>","author":"GTA6情报站","category":"官方动态","tags":["发售日期","Take-Two","Rockstar"],"date":"2025-11-05","coverImage":"","readTime":4,"featured":true},{"id":"gta6-characters-backstory","title":"Jason 和 Lucia 的背景故事：从官方物料中拼凑出的线索","excerpt":"虽然 Rockstar 对角色背景守口如瓶，但通过预告片、艺术设定和配音演员的蛛丝马迹，我们已经能拼凑出这对亡命情侣的动人故事。","content":"<p>《GTA 6》的双主角 —— Jason 和 Lucia —— 自第一支预告片亮相以来就成为了玩家讨论的焦点。这对被称为「邦妮与克莱德」的情侣组合，其关系动态很可能成为游戏叙事的主轴。</p><h2>Lucia：从底层崛起的野心家</h2><p>预告片中 Lucia 的形象最为突出。她穿着囚服出现在监狱场景中，暗示她可能有犯罪前科。多处细节表明她是一个拉丁裔女性，成长于 Vice City 的贫困社区。预告片中有一个意味深长的镜头：Lucia 站在豪华公寓的落地窗前俯瞰整个 Vice City，眼神中既有野心也有一丝悲凉。</p><p>配音演员的选择也透露了重要信息 —— Rockstar 选择了一位具有波多黎各血统的新人演员，这暗示 Lucia 的角色设定将深入探讨移民家庭和少数族裔在美国都市中的生存状态。</p><h2>Jason：谜一样的男人</h2><p>相比 Lucia，Jason 的信息要少得多。预告片中他多以 Lucia 的搭档身份出现，但他的衣着打扮和驾驶技术暗示他可能来自 Vice City 郊区的工薪阶层，具有丰富的街头经验。一个关键细节：Jason 的右手有一枚显眼的戒指，Reddit 粉丝推测这可能是军队退伍戒指或兄弟会戒指。</p><h2>他们的关系</h2><p>Rockstar 联合创始人 Sam Houser 曾在一次罕见的采访中表示：「我们想要讲述一个关于信任的故事。」这句话被广泛解读为对 Jason 和 Lucia 关系的暗示。在犯罪世界中，信任是最奢侈的东西 —— 这对情侣能否在金钱、背叛和生存压力面前守住彼此，或许就是《GTA 6》最核心的叙事主题。</p>","author":"GTA6情报站","category":"角色解析","tags":["角色","Jason","Lucia","剧情"],"date":"2025-10-20","coverImage":"","readTime":6,"featured":false},{"id":"gta6-soundtrack-rumors","title":"GTA 6 电台与配乐爆料：史上最大规模音乐授权预算","excerpt":"据报道，Rockstar 为《GTA 6》的配乐和电台曲目预留了高达2亿美元的授权预算，这将是游戏史上最庞大的音乐阵容。","content":"<p>《GTA》系列的电台系统一直是游戏的灵魂所在。从 Vice City 的80年代金曲到 GTA V 的现代嘻哈，每一代作品的音乐都为游戏世界注入了生命力。最新消息显示，《GTA 6》的音乐阵容将达到前所未有的规模。</p><h2>天价预算</h2><p>据音乐产业内部人士透露，Rockstar Games 已为《GTA 6》的音乐授权预留了约2亿美元的预算 —— 这几乎是《GTA V》音乐预算的5倍。这一数字在游戏业界前所未有，甚至超过了许多好莱坞大片的配乐预算。</p><h2>电台阵容传闻</h2><p>根据多方爆料，游戏将包含超过30个电台频道，覆盖以下风格：</p><ul><li>80年代合成器流行 / 迈阿密之声（向原版 Vice City 致敬）</li><li>现代拉丁流行和雷鬼顿</li><li>南方嘻哈和 trap</li><li>电子舞曲和迈阿密 bass</li><li>经典摇滚和乡村音乐</li><li>古巴爵士和加勒比音乐</li><li>独立另类和 city pop</li></ul><h2>原创配乐</h2><p>除了授权音乐，Rockstar 还邀请了多位知名音乐人为游戏创作原创配乐。据称，《虎胆龙威》和《加勒比海盗》的配乐大师也参与了项目，将为游戏的高潮任务创作动态配乐 —— 音乐会根据玩家行动实时变化，这在开放世界游戏中是一项开创性的技术。</p>","author":"GTA6情报站","category":"游戏文化","tags":["配乐","电台","音乐","文化"],"date":"2025-10-08","coverImage":"","readTime":5,"featured":false}
  ];

  async function loadArticles() {
    // Try fetch first (works on deployed server)
    try {
      const resp = await fetch('./data/articles.json');
      if (resp.ok) {
        articles = await resp.json();
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        return articles;
      }
    } catch (_) { /* fallback to embedded data */ }

    // Fallback: use embedded data (works with file:// protocol)
    console.log('Using embedded article data (local mode)');
    articles = [...EMBEDDED_ARTICLES];
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    return articles;
  }

  // =============================================
  // ARTICLE CARD RENDERING
  // =============================================

  function renderArticleCard(article, index, searchQuery) {
    const icon = CATEGORY_ICONS[article.category] || '📰';
    const dateFormatted = formatDate(article.date);
    const hasCover = article.coverImage && article.coverImage.trim() !== '';

    const thumbContent = hasCover
      ? `<img src="${escapeHtml(article.coverImage)}" alt="${escapeHtml(article.title)}" class="card-thumb-img" loading="lazy" />`
      : `<span class="card-thumb-icon">${icon}</span>`;

    const titleHtml = searchQuery
      ? highlightMatch(article.title, searchQuery)
      : escapeHtml(article.title);
    const excerptHtml = searchQuery
      ? highlightMatch(article.excerpt, searchQuery)
      : escapeHtml(article.excerpt);

    return `
      <article class="article-card${article.featured ? ' featured' : ''} fade-in"
               style="animation-delay: ${index * 0.06}s"
               onclick="window.location.href='article.html?id=${article.id}'">
        <div class="card-thumb${hasCover ? ' has-cover' : ''}">
          ${thumbContent}
          <span class="card-tag">${article.category}</span>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span>📅 ${dateFormatted}</span>
            <span>🕐 ${article.readTime} 分钟阅读</span>
          </div>
          <h3 class="card-title">${titleHtml}</h3>
          <p class="card-excerpt">${excerptHtml}</p>
          <div class="card-footer">
            <span style="font-size:0.8rem;color:var(--text-muted);">✍️ ${escapeHtml(article.author)}</span>
            <span class="read-more">
              阅读全文
              <span style="font-size:0.8rem;">→</span>
            </span>
          </div>
        </div>
      </article>`;
  }

  function renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="icon">📭</div>
        <p>该分类下暂无文章</p>
        <p style="font-size:0.85rem;margin-top:8px;">请尝试其他分类筛选</p>
      </div>`;
  }

  function renderSkeletons(count = 6) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="article-card">
          <div class="card-thumb skeleton" style="height:180px;"></div>
          <div class="card-body">
            <div class="skeleton" style="width:50%;height:14px;margin-bottom:12px;"></div>
            <div class="skeleton" style="width:100%;height:24px;margin-bottom:8px;"></div>
            <div class="skeleton" style="width:90%;height:16px;margin-bottom:4px;"></div>
            <div class="skeleton" style="width:70%;height:16px;"></div>
          </div>
        </div>`;
    }
    return html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // =============================================
  // SEARCH
  // =============================================

  function highlightMatch(text, query) {
    if (!query || !text) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped.replace(
      new RegExp(`(${safeQuery})`, 'gi'),
      '<mark class="search-highlight">$1</mark>'
    );
  }

  function searchArticles(query) {
    if (!query || query.trim() === '') {
      return activeFilter === 'ALL' ? articles : articles.filter(a => a.category === activeFilter);
    }

    const q = query.toLowerCase().trim();
    const baseArticles = activeFilter === 'ALL' ? articles : articles.filter(a => a.category === activeFilter);

    return baseArticles.filter(a => {
      // Search across title, excerpt, tags, category, and content
      const searchText = [
        a.title,
        a.excerpt,
        a.category,
        ...(a.tags || []),
        a.content.replace(/<[^>]*>/g, ''), // strip HTML for content search
      ].join(' ').toLowerCase();

      return searchText.includes(q);
    });
  }

  let searchDebounceTimer = null;

  function setupSearch() {
    const input = $('#search-input');
    const clearBtn = $('#search-clear');
    const countEl = $('#search-count');
    if (!input) return;

    input.addEventListener('input', function () {
      const query = this.value;

      // Toggle clear button
      if (clearBtn) {
        clearBtn.classList.toggle('visible', query.length > 0);
      }

      // Debounce search
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        const results = searchArticles(query);
        renderArticles(results, query);
        if (countEl) countEl.textContent = results.length;
      }, 200);
    });

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.remove('visible');
        const results = searchArticles('');
        renderArticles(results, '');
        if (countEl) countEl.textContent = articles.length;
        input.focus();
      });
    }

    // Escape key to clear search
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.value = '';
        clearBtn.classList.remove('visible');
        const results = searchArticles('');
        renderArticles(results, '');
        if (countEl) countEl.textContent = articles.length;
        input.blur();
      }
    });
  }

  // =============================================
  // HOME PAGE RENDERING
  // =============================================

  function renderArticles(filteredArticles, searchQuery) {
    const grid = $('#articles-grid');
    if (!grid) return;

    if (!filteredArticles || filteredArticles.length === 0) {
      const query = searchQuery || $('#search-input')?.value || '';
      grid.innerHTML = query.trim()
        ? `<div class="empty-state"><div class="icon">🔍</div><p>未找到匹配 <strong>"${escapeHtml(query.trim())}"</strong> 的文章</p><p style="font-size:0.85rem;margin-top:8px;">尝试使用不同的关键词搜索</p></div>`
        : renderEmptyState();
      return;
    }

    grid.innerHTML = filteredArticles
      .map((article, i) => renderArticleCard(article, i, searchQuery))
      .join('');
  }

  function filterArticles(category) {
    activeFilter = category;
    // Also apply current search query
    const searchInput = $('#search-input');
    const query = searchInput ? searchInput.value : '';
    const filtered = searchArticles(query);
    renderArticles(filtered, query);
  }

  // =============================================
  // FILTER BAR
  // =============================================

  function buildFilterBar() {
    const filterBar = $('#filter-inner');
    if (!filterBar) return;

    // Collect unique categories from articles
    const categories = ['ALL', ...new Set(articles.map(a => a.category))];

    filterBar.innerHTML = categories
      .map(cat => `
        <button class="filter-btn${cat === 'ALL' ? ' active' : ''}"
                data-category="${cat}">
          ${CATEGORY_ICONS[cat] || '🏷️'} ${CATEGORY_MAP[cat] || cat}
        </button>`)
      .join('');

    // Bind click events
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterArticles(this.dataset.category);
      });
    });
  }

  // =============================================
  // HERO STATS
  // =============================================

  function updateHeroStats() {
    const totalArticles = $('#hero-total');
    const totalCategories = $('#hero-categories');
    if (totalArticles) totalArticles.textContent = articles.length;
    if (totalCategories) {
      const uniqueCats = new Set(articles.map(a => a.category)).size;
      totalCategories.textContent = uniqueCats;
    }
  }

  // =============================================
  // ARTICLE DETAIL PAGE
  // =============================================

  function renderArticleDetail(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) {
      document.title = '文章未找到 — GTA 6 情报站';
      const container = $('#article-detail-container');
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="icon">🔍</div>
            <p>文章未找到</p>
            <p style="margin-top:16px;"><a href="index.html" class="btn-primary" style="display:inline-block;text-decoration:none;">返回首页</a></p>
          </div>`;
      }
      return;
    }

    // Update page title
    document.title = `${article.title} — GTA 6 情报站`;

    const container = $('#article-detail-container');
    if (!container) return;

    const dateFull = formatDateFull(article.date);

    container.innerHTML = `
      <div class="article-detail fade-in">
        <a href="index.html" class="back-link">
          ← 返回文章列表
        </a>

        <div class="article-detail-header">
          <span class="article-detail-category">${CATEGORY_ICONS[article.category] || ''} ${article.category}</span>
          <h1 class="article-detail-title">${escapeHtml(article.title)}</h1>
          <div class="article-detail-meta">
            <span>✍️ ${escapeHtml(article.author)}</span>
            <span>📅 ${dateFull}</span>
            <span>🕐 ${article.readTime} 分钟阅读</span>
          </div>
        </div>

        <div class="article-detail-content">
          ${article.content}
        </div>

        <div class="article-tags">
          ${article.tags.map(t => `<span class="article-tag">#${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>`;

    // Render "related articles" — exclude current, same category preferred
    const related = articles
      .filter(a => a.id !== article.id)
      .sort((a, b) => {
        // Prioritize same category
        if (a.category === article.category && b.category !== article.category) return -1;
        if (b.category === article.category && a.category !== article.category) return 1;
        return new Date(b.date) - new Date(a.date);
      })
      .slice(0, 3);

    const relatedSection = $('#related-articles');
    if (relatedSection && related.length > 0) {
      relatedSection.innerHTML = `
        <div class="section-header" style="margin-top:60px;">
          <h2 class="section-title">相关文章</h2>
        </div>
        <div class="articles-grid">
          ${related.map((a, i) => renderArticleCard(a, i)).join('')}
        </div>`;
    }
  }

  // =============================================
  // MOBILE MENU
  // =============================================

  function setupMobileMenu() {
    const btn = $('#mobile-menu-btn');
    const nav = $('#main-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  // =============================================
  // SCROLL TO TOP
  // =============================================

  function setupScrollToTop() {
    const btn = $('#scroll-top');
    if (!btn) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 500) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =============================================
  // STICKY HEADER EFFECT
  // =============================================

  function setupStickyHeader() {
    const header = $('#site-header');
    if (!header) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 10) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // =============================================
  // NEWSLETTER FORM (demo)
  // =============================================

  function setupNewsletterForm() {
    const form = $('#newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) return;

      // Demo: just show a toast-like message
      const btn = form.querySelector('.btn-primary');
      const originalText = btn.textContent;
      btn.textContent = '✓ 已订阅！';
      btn.style.background = 'linear-gradient(135deg, #00e5ff, #00c853)';
      input.value = '';
      input.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        input.disabled = false;
      }, 3000);
    });
  }

  // =============================================
  // KEYBOARD NAVIGATION
  // =============================================

  function setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Press '/' to focus search (future feature placeholder)
      // Press 'Escape' to go back from article
      if (e.key === 'Escape' && isArticlePage()) {
        window.location.href = 'index.html';
      }
    });
  }

  // =============================================
  // INITIALIZATION
  // =============================================

  async function init() {
    // Load article data
    articles = await loadArticles();

    if (isHomePage()) {
      // Home page
      buildFilterBar();
      renderArticles(articles, '');
      updateHeroStats();
      setupSearch();
    } else if (isArticlePage()) {
      // Article detail page
      const articleId = getArticleIdFromURL();
      if (articleId) {
        renderArticleDetail(articleId);
      }
      // Initialize highlight.js on code blocks
      if (typeof hljs !== 'undefined') {
        setTimeout(() => {
          document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
          });
        }, 100);
      }
    }

    // Common setup
    setupMobileMenu();
    setupScrollToTop();
    setupStickyHeader();
    setupNewsletterForm();
    setupKeyboardNav();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
