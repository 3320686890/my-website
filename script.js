/* ===========================================================
   fly · 个人主页  —— 交互脚本
   -----------------------------------------------------------
   想改内容？只看下面这四个配置区：
     POSTS          —— 「碎碎念」的文章
     TYPING_LINES   —— 首屏打字机的句子
     FORM_ENDPOINT  —— 留言真正提交的地址（留空则只存本地）
     HOLD_*         —— 3 秒挑战的时间窗口
   =========================================================== */
(function () {
  'use strict';

  /* ==========================================================
     配置区 1：文章列表
     body 支持极简 Markdown：
       ## 小标题 / > 引用 / - 无序 / 1. 有序 / --- 分隔线
       **加粗** / `行内代码`
     段落之间空一行即可。
     ========================================================== */
  var POSTS = [
    {
      title: '为什么叫 fly',
      date: '2026-09-20',
      tags: ['自我介绍', '日常'],
      summary: '有人问我这个网名是什么意思。其实没什么深意 —— 就是希望自己能一直飞着，别停下来。',
      body: [
        '有人问我这个网名是什么意思。',
        '其实没什么特别的典故，就是希望自己能一直往前飞，别停在原地。高中那会儿想过很多名字，最后留下了这个最短的。',
        '## 为什么是短的',
        '短的东西好记，也好写。注册账号的时候少敲几个键，签名的时候少占一点位置。',
        '> 名字这东西，用久了就成了别人叫你的那个声音。',
        '所以就这样吧，fly。'
      ]
    },
    {
      title: '我用 Python 写了第一个小游戏',
      date: '2026-09-12',
      tags: ['Python', '项目'],
      summary: '猜数字。听起来很简单，但真正从零写完一遍，才发现自己连输入校验都没想明白。',
      body: [
        '猜数字这个题目，几乎所有 Python 教程的第一章都会提到。',
        '但真正从零写完一遍，才发现自己连**输入校验**都没想明白 —— 用户输入一个字母怎么办？输入一个超出范围的数怎么办？什么都不输入直接回车呢？',
        '## 踩过的几个坑',
        '1. `input()` 拿到的永远是字符串，得手动转成整数，转之前还要判断能不能转',
        '2. 猜的次数要单独记，不然最后没法给评价',
        '3. 循环退出的条件写在哪儿，直接影响代码好不好读',
        '## 写完之后的感觉',
        '代码量不大，可能一百行都不到。但这是我第一次让一个程序完整地「陪着」用户走完一个流程。',
        '> 会写 hello world 和能写出一个能玩的东西，中间隔着的不是语法，是把问题拆开的能力。',
        '接下来想试试把它做成有界面的版本，用 tkinter 或者直接搬到网页上。',
        '---',
        '代码在 GitHub 上，欢迎来指点一下，我还是个新手。'
      ]
    },
    {
      title: '大一开学第一个月，我在折腾什么',
      date: '2026-10-05',
      tags: ['大学', '生活'],
      summary: '课不少，但真正花时间的是这几件事：Python、打鼓、滑板，还有这个网页。',
      body: [
        '开学一个月了，感觉比高中自由，但也更容易把时间弄丢。',
        '## 时间大概花在这些地方',
        '- **Python**：每天挤一点时间看，周末写点小东西',
        '- **架子鼓**：练鼓的时候脑子最放空，什么都不用想',
        '- **滑板**：还在摔跤阶段，但滑顺一条线的时候是真的爽',
        '- **这个网页**：你正在看的，一点一点自己搭起来的',
        '## 一点感想',
        '以前总觉得「等我有空就学」，结果永远没有空。现在发现时间不是等出来的，是挤出来的 —— 哪怕每天只有半小时。',
        '> 大一最大的好处是，试错的成本特别低。想学什么都还来得及。',
        '所以就先这样吧，慢慢来，反正还有四年。'
      ]
    }
  ];

  /* ==========================================================
     配置区 2：留言怎么送到你手里（四种模式，从上往下优先）

     ⓪ WEB3FORMS_KEY —— 3Forms / Web3Forms（最省事，推荐）
        去 https://web3forms.com 用邮箱换一个 Access Key（形如一串 UUID），
        填到下面。访客在页面里写完直接提交，留言会发到你的邮箱。
        这个 key 本来就是设计成公开放在前端的，不用藏着。
        免费额度每月 250 条，个人站完全够。

     ① FORM_ENDPOINT —— 静默提交（要一个自己的后端）
        访客在页面里写完直接提交，不会跳走。
        需要你自己搭一个小后端，或用能访问的国外服务。填接口地址，例如
        'https://你的域名/api/message' 或 'https://xxx.workers.dev/msg'

     ② FORM_LINK —— 跳到国内表单平台（零依赖，马上能用）
        填一个腾讯文档 / 金数据 / WPS 表单的「填写链接」。
        访客点按钮会新开一个标签页去填，提交后你在那边的表格里就能看到。
        国内可直接访问，不需要服务器、不用备案。

     ③ 两个都留空 —— 只存在访客本机，页面会如实说明你看不到。

     小技巧：如果填了 FORM_LINK，页面上已经写好的称呼和留言会自动带过去，
     访客过去基本只需要点一下提交。
     ========================================================== */
  /* ⓪ 3Forms / Web3Forms 的 Access Key（推荐，填这里就不用管下面两个了） */
  var WEB3FORMS_KEY = '1d38b3ee-9023-4fcb-9fb4-774b417abca6';

  var FORM_ENDPOINT = '';
  /* ① 自己的后端接口；没有就留空 */

  /* ② 国内表单平台的填写链接（腾讯文档/金数据/WPS 都行）。
     还没填的时候页面会自己识别出来，不会真的跳过去。 */
  var FORM_LINK = 'REPLACE_WITH_YOUR_FORM_URL';

  /* ==========================================================
     配置区 3：首屏打字机
     ========================================================== */
  var TYPING_LINES = [
    '大一新生，正在适应新生活 🎓',
    '最近在学 Python 🐍',
    '打鼓的时候最专注 🥁',
    '滑板还在摔跤阶段 🛹',
    '崩三不倒，陪你到老 ⚔️',
    '这个网页是我自己写的 ✨'
  ];

  /* ==========================================================
     配置区 4：3 秒挑战的时间窗口（秒）
     ========================================================== */
  var HOLD_TARGET = 3.0;   // 提示里的目标
  var HOLD_MIN    = 2.0;   // 通过下限
  var HOLD_MAX    = 4.0;   // 通过上限
  /* 入场方式已改为轻触，这个变量保留仅为兼容旧配置，不再使用 */
  var SWIPE_NEED  = 0.34;

  /* ==========================================================
     以下为实现，一般不用改
     ========================================================== */

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* 触摸能力检测：决定是否显示游戏方向键。
     不用 media query —— 无头浏览器与触屏笔记本上的 hover 判定都不可靠。 */
  (function touchDetect() {
    function enable() {
      if (root.classList.contains('has-touch')) return;
      root.classList.add('has-touch');
    }
    if ('ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0) enable();
    /* 首次真实触摸时再补一次，兼容少数浏览器 */
    window.addEventListener('touchstart', enable, { once: true, passive: true });
  })();

  var store = {
    get: function (k, fb) { try { var v = localStorage.getItem(k); return v === null ? fb : v; } catch (e) { return fb; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  function throttle(fn, wait) {
    var last = 0, timer = null;
    return function () {
      var now = Date.now(), ctx = this, args = arguments;
      if (now - last >= wait) { last = now; fn.apply(ctx, args); }
      else if (!timer) { timer = setTimeout(function () { timer = null; last = Date.now(); fn.apply(ctx, args); }, wait - (now - last)); }
    };
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* 排行榜渲染：贪吃蛇模块和启动逻辑共用同一份实现 */
  var BOARD_KEY = 'fly-snake-board';
  var PLAYS_KEY = 'fly-snake-plays';

  function boardLoad() {
    try {
      var v = JSON.parse(store.get(BOARD_KEY, '[]'));
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function boardWhen(ts) {
    var d = Date.now() - ts;
    if (d < 60000) return '刚刚';
    if (d < 3600000) return Math.floor(d / 60000) + ' 分钟前';
    if (d < 86400000) return Math.floor(d / 3600000) + ' 小时前';
    if (d < 2592000000) return Math.floor(d / 86400000) + ' 天前';
    var dt = new Date(ts);
    return (dt.getMonth() + 1) + '月' + dt.getDate() + '日';
  }

  /* freshIdx：刚上榜那条高亮一下 */
  function boardPaint(freshIdx) {
    var list = $('#boardList');
    if (!list) return;
    var rows = boardLoad();
    list.innerHTML = '';
    rows.forEach(function (row, i) {
      var li = document.createElement('li');
      li.className = 'board-row' + (i === freshIdx ? ' fresh' : '');
      li.innerHTML =
        '<span class="board-rank">' + (i + 1) + '</span>' +
        '<span class="board-score">' + row.score + ' 分</span>' +
        '<span class="board-when">' + escapeHTML(boardWhen(row.ts)) + '</span>' +
        '<span class="board-when">' + (row.sec ? row.sec + '秒' : '') + '</span>';
      list.appendChild(li);
    });
    var empty = $('#boardEmpty');
    if (empty) empty.style.display = rows.length ? 'none' : '';
    var total = $('#boardTotal');
    if (total) total.textContent = '共玩过 ' + (Number(store.get(PLAYS_KEY, '0')) || 0) + ' 局';
    var clearBtn = $('#boardClear');
    if (clearBtn) clearBtn.style.display = rows.length ? '' : 'none';
  }

  /* 清空按钮（只绑一次） */
  (function bindBoardClear() {
    var btn = $('#boardClear');
    if (!btn || btn.__bound) return;
    btn.__bound = true;
    btn.addEventListener('click', function () {
      if (!boardLoad().length) return;
      if (!window.confirm('确定清空排行榜吗？这个操作没法撤销。')) return;
      store.del(BOARD_KEY); store.del(PLAYS_KEY);
      boardPaint(-1);
      var t = $('#rsTitle'), d = $('#rsDesc'), box = $('#runSummary');
      if (t) t.textContent = '记录已清空';
      if (d) d.textContent = '排行榜已经重置，重新开始吧。';
      if (box) box.classList.remove('best');
      toast('排行榜已清空', 'ok');
    });
  })();

  /* 数字滚动：给分数变化加一点动感 */
  function rollNumber(el, to) {
    if (!el) return;
    var from = Number(el.textContent) || 0;
    if (from === to) { el.textContent = String(to); return; }
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
    el.textContent = String(to);
  }

  /* 轻提示 */
  var toastTimer = null;
  function toast(msg, kind) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.hidden = true; }, 340);
    }, 2200);
  }

  /* ---------------- 1. 深浅色主题 ---------------- */
  (function theme() {
    var btn = $('#themeBtn');
    var mq = window.matchMedia('(prefers-color-scheme: dark)');

    function apply(t, persist) {
      root.setAttribute('data-theme', t);
      if (persist) store.set('theme', t);
      if (btn) {
        btn.setAttribute('aria-label', t === 'dark' ? '切换到浅色主题' : '切换到深色主题');
        btn.title = t === 'dark' ? '切到浅色' : '切到深色';
      }
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: t } }));
    }

    apply(root.getAttribute('data-theme') || 'light', false);

    if (btn) {
      btn.addEventListener('click', function () {
        apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
        if (reduceMotion) return;
        /* 右上角扩散一圈光，暗示切换来源 */
        root.classList.remove('theme-flash');
        void root.offsetWidth;
        root.classList.add('theme-flash');
        setTimeout(function () { root.classList.remove('theme-flash'); }, 700);
      });
    }

    var onSys = function (e) { if (!store.get('theme', null)) apply(e.matches ? 'dark' : 'light', false); };
    if (mq.addEventListener) mq.addEventListener('change', onSys);
    else if (mq.addListener) mq.addListener(onSys);
  })();

  /* ---------------- 2. 入场门：上滑 → 3 秒挑战 ---------------- */
  (function gate() {
    var gateEl = $('#gate');
    if (!gateEl) { root.classList.remove('gate-on'); return; }

    var sceneSwipe = $('#sceneSwipe');
    var sceneHold  = $('#sceneHold');
    var gateDone   = $('#gateDone');
    var bar        = $('#swipeBar');
    var site       = $('#site');

    /* ---------- 门内粒子 ---------- */
    (function gateParticles() {
      var cv = $('#gateCanvas');
      if (!cv || reduceMotion) return;
      var ctx = cv.getContext('2d');
      if (!ctx) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = 0, H = 0, dots = [], raf = null;
      var palette = [];
      var mouse = { x: -9999, y: -9999 };

      function readPalette() {
        var dark = root.getAttribute('data-theme') === 'dark';
        palette = dark
          ? ['rgba(147,197,247,', 'rgba(182,169,255,', 'rgba(255,217,142,']
          : ['rgba(158,201,245,', 'rgba(169,156,240,', 'rgba(255,207,122,'];
      }
      function resize() {
        W = cv.clientWidth; H = cv.clientHeight;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        build();
      }
      function build() {
        var n = Math.round(Math.min(80, Math.max(20, (W * H) / 24000)));
        dots = [];
        for (var i = 0; i < n; i++) {
          dots.push({
            x: Math.random() * W, y: Math.random() * H,
            r: 1 + Math.random() * 2.6,
            vx: (Math.random() - 0.5) * 0.24,
            vy: -0.1 - Math.random() * 0.3,
            a: 0.2 + Math.random() * 0.45,
            c: palette[i % palette.length],
            ph: Math.random() * Math.PI * 2
          });
        }
      }
      function frame(t) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < dots.length; i++) {
          var d = dots[i];
          d.x += d.vx; d.y += d.vy;
          var dx = d.x - mouse.x, dy = d.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 16000 && d2 > 1) {
            var f = (16000 - d2) / 16000 * 0.7, len = Math.sqrt(d2);
            d.x += (dx / len) * f; d.y += (dy / len) * f;
          }
          if (d.y < -14) { d.y = H + 14; d.x = Math.random() * W; }
          if (d.x < -14) d.x = W + 14;
          if (d.x > W + 14) d.x = -14;
          var alpha = d.a * (0.7 + 0.3 * Math.sin(t / 2300 + d.ph));
          ctx.beginPath();
          ctx.fillStyle = d.c + alpha.toFixed(3) + ')';
          ctx.arc(d.x + Math.sin(t / 1900 + d.ph) * 0.3, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
        raf = requestAnimationFrame(frame);
      }
      readPalette(); resize();
      raf = requestAnimationFrame(frame);
      window.addEventListener('resize', throttle(resize, 240));
      window.addEventListener('themechange', readPalette);
      if (canHover) {
        window.addEventListener('mousemove', throttle(function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, 60), { passive: true });
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
        else if (!raf) raf = requestAnimationFrame(frame);
      });
    })();

    /* ---------- 第 1 关：轻触开启 ----------
       改成点击任意位置就开门。比上滑流畅得多，
       手机上也不会再被浏览器当成滚动手势吞掉。
       这一次点击同时也是「用户手势」，正好用来启动背景音乐。 */
    var passed = false;

    /* 门上的小时钟（纯装饰，让赛博感更足） */
    (function gateClock() {
      var el = $('#gateClock');
      if (!el) return;
      function tick() {
        var d = new Date();
        el.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
          .map(function (n) { return String(n).padStart(2, '0'); }).join(':');
      }
      tick();
      setInterval(tick, 1000);
    })();

    function reveal(e) {
      if (passed) return;
      passed = true;

      /* 顺手把这个手势交给音乐 —— 浏览器只允许在用户操作里播放声音。
         这是「进门就自动放歌」唯一可行的时机。 */
      if (typeof window.__startMusic === 'function') window.__startMusic();

      sceneSwipe.hidden = true;
      sceneHold.hidden = false;
      initHold();
    }

    /* 点击任意位置都能进；但排除掉门里真正的链接 */
    sceneSwipe.addEventListener('click', function (e) {
      if (e.target.closest('a[href]')) return;
      reveal(e);
    });

    /* 键盘：回车 / 空格 / 方向上 都能进 */
    function onGateKey(e) {
      if (sceneSwipe.hidden) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        reveal();
      }
    }
    document.addEventListener('keydown', onGateKey);

    /* ---------- 第 2 关：按住 3 秒 ---------- */
    var holdInit = false;

    function initHold() {
      if (holdInit) return;
      holdInit = true;

      var btn      = $('#holdBtn');
      var label    = $('#holdLabel');
      var clockBox = $('#chalClock');
      var num      = $('#clockNum');
      var tag      = $('#clockTag');
      var ring     = $('#ringFill');
      var status   = $('#chalStatus');

      var R = 88;
      var CIRC = 2 * Math.PI * R;                 // 约 552.9
      ring.style.strokeDasharray = CIRC.toFixed(2);
      ring.style.strokeDashoffset = CIRC.toFixed(2);

      var holding = false, t0 = 0, ticker = null, finalT = 0, lastShown = -1;

      function paint(t) {
        num.textContent = t.toFixed(2);
        var k = Math.min(1, t / HOLD_MAX);
        ring.style.strokeDashoffset = (CIRC * (1 - k)).toFixed(2);

        var state = t < HOLD_MIN ? 'timing-early' : (t <= HOLD_MAX ? 'timing-good' : 'timing-late');
        if (!clockBox.classList.contains(state)) {
          clockBox.classList.remove('timing-early', 'timing-good', 'timing-late');
          clockBox.classList.add(state);
        }
        if (tag) {
          tag.textContent = t < HOLD_MIN ? '再等等' : (t <= HOLD_MAX ? '就是现在！' : '太久了');
        }
      }

      /* 用 setInterval 而不是 requestAnimationFrame：
         手机在滚动、切后台或省电模式下会节流 RAF，读数会卡住不动。
         60Hz 的间隔对 0.01 秒的读数完全够用，而且稳定得多。 */
      function tick() {
        if (!holding) return;
        try {
          var now = (performance.now() - t0) / 1000;
          /* 读数没变就不重绘，省点开销 */
          if (now.toFixed(2) !== lastShown) {
            lastShown = now.toFixed(2);
            paint(now);
          }
        } catch (err) {
          /* 绘制出任何意外都不该让计时卡死，直接把这次跳过 */
        }
      }

      var activeId = null;

      function down(e) {
        /* 按下期间忽略其他指针（多指乱按不会互相干扰） */
        if (holding) return;
        /* 只有鼠标才需要判断左右键：触摸和触控笔没有「左键」这个概念，
           button 常常是 -1 或 0，用原来的判断会把手机构型误拦掉。 */
        var ptype = (e && e.pointerType) || (isTouchPointer ? 'touch' : 'mouse');
        if (ptype === 'mouse' && e && typeof e.button === 'number' && e.button > 0) return;
        if (e && e.pointerId !== undefined) activeId = e.pointerId;
        holding = true;
        t0 = performance.now();
        btn.classList.add('holding');
        clockBox.classList.remove('ok', 'bad');
        status.textContent = '';
        status.className = 'chal-status';
        /* 按下之后才把这句话放出来 */
        var foot = $('#chalFoot');
        if (foot) {
          foot.hidden = false;
          foot.classList.remove('show');
          void foot.offsetWidth;
          foot.classList.add('show');
        }
        if (label) label.textContent = '松手';
        lastShown = '0.00';
        paint(0);
        clearInterval(ticker);
        ticker = setInterval(tick, 16);
      }

      function up(e) {
        if (!holding) return;
        /* 只在「明确是另一个指针」时才忽略。实测浏览器给触摸分配的
           pointerId 有时和 pointerdown 不一致，卡太死会导致松手无响应。 */
        if (e && e.pointerId !== undefined && activeId !== null &&
            e.pointerId !== activeId && e.pointerType !== 'touch' && e.pointerType !== 'pen') {
          return;
        }
        activeId = null;
        holding = false;
        clearInterval(ticker); ticker = null;
        btn.classList.remove('holding');
        if (label) label.textContent = '按住';
        var footEl = $('#chalFoot');
        if (footEl) {
          footEl.classList.remove('show');
          footEl.hidden = true;
        }
        finalT = (performance.now() - t0) / 1000;
        paint(finalT);
        judge(finalT);
      }

      function judge(t) {
        if (t >= HOLD_MIN && t <= HOLD_MAX) {
          clockBox.classList.add('ok');
          clockBox.classList.remove('timing-early', 'timing-good', 'timing-late');
          if (tag) tag.textContent = '通过';
          status.textContent = '通过啦！用了 ' + t.toFixed(2) + ' 秒，欢迎光临 ✨';
          status.className = 'chal-status ok';
          btn.disabled = true;
          setTimeout(enterSite, reduceMotion ? 120 : 900);
          return;
        }
        /* 失败 */
        clockBox.classList.add('bad');
        clockBox.classList.remove('timing-early', 'timing-good', 'timing-late');
        if (tag) tag.textContent = '再来';
        var msg = t < HOLD_MIN ? '太快了！才 ' + t.toFixed(2) + ' 秒，稳住手再试一次'
                               : '太久了～ ' + t.toFixed(2) + ' 秒，不用按到 4 秒以上';
        status.textContent = msg;
        status.className = 'chal-status bad';
        setTimeout(function () {
          clockBox.classList.remove('bad');
          if (tag) tag.textContent = '待机';
          paint(0);
          clockBox.classList.remove('timing-early', 'timing-good', 'timing-late');
          status.textContent = '';
          status.className = 'chal-status';
        }, reduceMotion ? 300 : 900);
      }

      /* 注意：这里刻意不在触摸时监听 pointerleave。
         真机上手指轻微移动、或指腹超出按钮边缘，浏览器就会派发 pointerleave，
         导致计时被中断、读数卡死在某个值（手机上表现为「卡住不动」）。
         鼠标才需要 pointerleave —— 指针移出去应当算松手。 */
      var isTouchPointer = false;

      btn.addEventListener('pointerdown', function (e) {
        isTouchPointer = (e.pointerType === 'touch' || e.pointerType === 'pen');
        down(e);
      });
      /* 结束计时只认 pointerup / pointercancel。
         实测：真机触摸时 pointerleave 会触发多次，且 pointerId 与按下时不同，
         会绕过校验提前把计时清掉并归零 —— 表现就是读数卡住、松手没反应。
         所以触摸路径完全不使用 pointerleave。 */
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);

      /* 鼠标移出按钮视为松手（只在确实是鼠标时生效） */
      btn.addEventListener('pointerleave', function (e) {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
        if (isTouchPointer) return;
        up(e);
      });

      window.addEventListener('blur', function () { up(); });

      /* 兜底：老浏览器不支持 Pointer Events 时用原生 touch 事件 */
      if (!window.PointerEvent) {
        btn.addEventListener('touchstart', function (e) { e.preventDefault(); down(); }, { passive: false });
        btn.addEventListener('touchend', function (e) { e.preventDefault(); up(); }, { passive: false });
        btn.addEventListener('touchcancel', function () { up(); });
      }

      /* 手指（或鼠标）在按钮外松开也要能正确结束，
         否则会一直停在 holding 状态出不来 */
      window.addEventListener('pointerup', function (e) { if (holding) up(e); });
      window.addEventListener('pointercancel', function (e) { if (holding) up(e); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && holding) up();
      });

      /* 键盘也能玩 */
      btn.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); down(); }
      });
      btn.addEventListener('keyup', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); up(); }
      });
    }

    /* ---------- 进入主站 ---------- */
    function enterSite() {
      if (gateDone) {
        gateDone.hidden = false;
      }
      setTimeout(function () {
        gateEl.classList.add('gone');
        root.classList.remove('gate-on');
        root.classList.add('gate-passed');
        if (site) site.setAttribute('aria-hidden', 'false');
        /* 让主站的入场动画重新触发 */
        window.dispatchEvent(new Event('gate:passed'));
        setTimeout(function () { gateEl.style.display = 'none'; }, reduceMotion ? 60 : 900);
      }, reduceMotion ? 80 : 620);
    }

    /* 偏好减少动效时，直接给个「跳过」的出口 */
    if (reduceMotion) {
      var skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'link-btn';
      skip.textContent = '跳过入场';
      skip.style.cssText = 'position:absolute;right:22px;bottom:18px;z-index:5;';
      skip.addEventListener('click', function () { setProgress(1); reveal(); });
      gateEl.appendChild(skip);
    }
  })();

  /* ---------------- 3. 主站：主题粒子 ---------------- */
  (function particles() {
    var cv = $('#particles');
    if (!cv || reduceMotion) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, raf = null, dots = [];
    var palette = [];
    var mouse = { x: -9999, y: -9999 };

    function readPalette() {
      var dark = root.getAttribute('data-theme') === 'dark';
      palette = dark
        ? ['rgba(147,197,247,', 'rgba(182,169,255,', 'rgba(255,217,142,']
        : ['rgba(158,201,245,', 'rgba(169,156,240,', 'rgba(255,207,122,'];
    }
    function resize() {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function build() {
      var n = Math.round(Math.min(72, Math.max(18, (W * H) / 26000)));
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 0.9 + Math.random() * 2.4,
          vx: (Math.random() - 0.5) * 0.22,
          vy: -0.08 - Math.random() * 0.26,
          a: 0.18 + Math.random() * 0.42,
          c: palette[i % palette.length],
          ph: Math.random() * Math.PI * 2
        });
      }
    }
    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        var dx = d.x - mouse.x, dy = d.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 13000 && d2 > 1) {
          var f = (13000 - d2) / 13000 * 0.6, len = Math.sqrt(d2);
          d.x += (dx / len) * f; d.y += (dy / len) * f;
        }
        if (d.y < -12) { d.y = H + 12; d.x = Math.random() * W; }
        if (d.x < -12) d.x = W + 12;
        if (d.x > W + 12) d.x = -12;
        var alpha = d.a * (0.72 + 0.28 * Math.sin(t / 2200 + d.ph));
        ctx.beginPath();
        ctx.fillStyle = d.c + alpha.toFixed(3) + ')';
        ctx.arc(d.x + Math.sin(t / 1800 + d.ph) * 0.28, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    var running = true;
    function start() { if (!raf) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } }

    readPalette(); resize(); start();
    window.addEventListener('resize', throttle(resize, 220));
    window.addEventListener('themechange', readPalette);
    if (canHover) {
      window.addEventListener('mousemove', throttle(function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, 50), { passive: true });
      window.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  })();

  /* ---------------- 4. 首屏打字机 ---------------- */
  (function typing() {
    var el = $('#typing');
    if (!el || !TYPING_LINES.length) return;
    if (reduceMotion) { el.textContent = TYPING_LINES[0]; return; }

    var li = 0, ci = 0, deleting = false;
    function tick() {
      var line = TYPING_LINES[li];
      if (!deleting) {
        ci++;
        el.textContent = line.slice(0, ci);
        if (ci === line.length) { deleting = true; return setTimeout(tick, 1900); }
        return setTimeout(tick, 85 + Math.random() * 55);
      }
      ci--;
      el.textContent = line.slice(0, ci);
      if (ci === 0) { deleting = false; li = (li + 1) % TYPING_LINES.length; return setTimeout(tick, 380); }
      setTimeout(tick, 38);
    }
    setTimeout(tick, 700);
  })();

  /* ---------------- 5. 导航 / 进度条 / 区块高亮 ---------------- */
  (function navigation() {
    var nav = $('#nav'), toggle = $('#navToggle'), links = $('#navLinks');
    var top = $('#toTop'), bar = $('#progressBar'), dots = $$('#dots a');

    var onScroll = throttle(function () {
      var y = window.scrollY || root.scrollTop;
      if (nav) nav.classList.toggle('scrolled', y > 12);
      if (top) top.classList.toggle('show', y > 640);
      var max = root.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (bar) bar.style.width = (pct * 100).toFixed(2) + '%';
      /* 「回到顶部」按钮外圈同步画一圈进度 */
      if (top) top.style.setProperty('--top-progress', (pct * 100).toFixed(1));
    }, 16);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
      });
      document.addEventListener('click', function (e) {
        if (!links.classList.contains('open')) return;
        if (links.contains(e.target) || toggle.contains(e.target)) return;
        links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && links.classList.contains('open')) {
          links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus();
        }
      });
    }

    var sections = $$('main section[id]');
    if ('IntersectionObserver' in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = '#' + en.target.id;
          $$('.nav-links a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === id); });
          dots.forEach(function (d) { d.classList.toggle('active', d.getAttribute('href') === id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }

    if (top) {
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ---------------- 6. 入场显示 ----------------
     改成纯 CSS 动画驱动：只要给 html 加上 .gate-passed，
     CSS 就一定会把 .anim 播到可见状态，不再依赖观察器的触发时机。
     （之前用 IntersectionObserver，门盖着时元素已在"视口内"，
       观察器提前触发并取消观察，门一开下方内容就永久停在 opacity:0。） */
  (function reveal() {
    function pass() {
      if (root.classList.contains('gate-passed')) return;
      root.classList.add('gate-passed');
    }

    /* 没有门（减少动效时会被跳过）就立刻放行 */
    if (!root.classList.contains('gate-on')) pass();

    window.addEventListener('gate:passed', pass);

    /* 兜底：无论发生什么，2.5 秒后一定放行，绝不让内容卡在透明 */
    setTimeout(pass, 2500);
  })();

  /* ---------------- 6.2 滚动视差 ----------------
     背景光斑、首屏装饰、板块编号以不同速度位移，产生纵深感。
     只写 CSS 变量，位移交给 transform，走合成线程不占主线程。 */
  (function parallax() {
    if (reduceMotion) return;

    var bg = document.querySelector('.bg-deco');
    var art = document.querySelector('.hero-art');
    var nums = $$('.section-title span');
    var ticking = false;

    function apply() {
      ticking = false;
      var y = window.scrollY || root.scrollTop;

      if (bg) bg.style.setProperty('--par', (-y * 0.1).toFixed(1) + 'px');
      if (art) art.style.setProperty('--par-art', (y * 0.06).toFixed(1) + 'px');

      /* 编号：各自按自身位置反向偏移一点 */
      nums.forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
        var mid = r.top + r.height / 2 - window.innerHeight / 2;
        n.style.setProperty('--par-num', (mid * -0.045).toFixed(1) + 'px');
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    apply();
  })();

  /* ---------------- 6.3 区块分隔线（滚动到才亮起） ---------------- */
  (function sectionSeen() {
    var secs = $$('main .section');
    if (!secs.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add('seen');
      });
    }, { rootMargin: '-10% 0px -30% 0px', threshold: 0 });
    secs.forEach(function (s) { io.observe(s); });
  })();

  /* ---------------- 6.5 光标 / 触摸特效 ----------------
     桌面：一圈柔和光晕 + 拖尾的圆环和三角，跟着指针走。
     手机：没有指针，改成手指点哪儿就炸开一圈圆环和三角。
     用 canvas 画，元素数量再多也不掉帧。 */
  (function cursorFX() {
    var cv = $('#cursorFx');
    if (!cv || reduceMotion) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var ring, glow = { x: -999, y: -999, a: 0 };
    var trailRings = [];   // 拖尾圆环
    var shapes = [];       // 漂浮三角
    var bursts = [];       // 触摸爆发
    var t = 0;
    var COLL = ['169,156,240', '255,168,197', '158,201,245', '255,207,122'];

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnTrail(x, y) {
      if (trailRings.length > 14) return;
      trailRings.push({
        x: x, y: y, r: 10 + Math.random() * 10,
        life: 1, max: 1,
        vx: (Math.random() - .5) * .5,
        vy: (Math.random() - .5) * .5,
        rot: Math.random() * Math.PI,
        col: COLL[(Math.random() * COLL.length) | 0]
      });
    }

    function spawnShape(x, y) {
      if (shapes.length > 10) return;
      shapes.push({
        x: x, y: y,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - .5) * .05,
        vy: -.25 - Math.random() * .5,
        life: 1,
        col: COLL[(Math.random() * COLL.length) | 0]
      });
    }

    /* 触摸/点击爆发：一圈扩散的环 + 若干三角 */
    function burst(x, y) {
      bursts.push({ x: x, y: y, r: 6, life: 1, col: '127,212,255' });
      var N = 9;
      for (var i = 0; i < N; i++) {
        var a = (Math.PI * 2 / N) * i + Math.random() * .3;
        /* 速度要够大、衰减要够慢，三角才能真正散开，
           否则全挤在中心一小团，看着像一坨。 */
        var sp = 5.2 + Math.random() * 3.4;
        shapes.push({
          x: x, y: y,
          size: 6 + Math.random() * 5,
          rot: a,
          spin: (Math.random() - .5) * .22,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          burst: true,          // 标记为爆发型：衰减慢、生命长
          life: 1,
          col: i % 2 ? '127,212,255' : '169,156,240'
        });
      }
    }

    function drawTri(x, y, s, rot, alpha, col) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * .87, s * .5);
      ctx.lineTo(-s * .87, s * .5);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(' + col + ',' + alpha + ')';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    }

    function frame() {
      t++;
      ctx.clearRect(0, 0, W, H);

      /* 1. 柔和光晕（跟着指针） */
      if (glow.a > 0.01) {
        var g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 170);
        var dark = root.getAttribute('data-theme') === 'dark';
        g.addColorStop(0, 'rgba(169,156,240,' + (0.2 * glow.a * (dark ? 1.25 : 1)) + ')');
        g.addColorStop(0.55, 'rgba(158,201,245,' + (0.07 * glow.a) + ')');
        g.addColorStop(1, 'rgba(169,156,240,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(glow.x, glow.y, 170, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 2. 拖尾圆环 */
      for (var i = trailRings.length - 1; i >= 0; i--) {
        var r = trailRings[i];
        r.x += r.vx; r.y += r.vy;
        r.life -= 0.028;
        if (r.life <= 0) { trailRings.splice(i, 1); continue; }
        var a = r.life * 0.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r * (1.7 - r.life * 0.7), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + r.col + ',' + a.toFixed(3) + ')';
        ctx.lineWidth = 1.3;
        ctx.stroke();
        /* 环上挂一个小三角，转着走 */
        drawTri(r.x + Math.cos(r.rot) * r.r, r.y + Math.sin(r.rot) * r.r,
                r.r * 0.32, r.rot + Math.PI / 2, a * 1.2, r.col);
      }

      /* 3. 漂浮三角 */
      for (var k = shapes.length - 1; k >= 0; k--) {
        var s = shapes[k];
        if (s.burst) {
          /* 爆发型：方向不变、速度几乎不衰减，飞得出去 */
          s.x += s.vx; s.y += s.vy;
          s.vx *= 0.985; s.vy *= 0.985;
          s.life -= 0.019;
        } else if (s.vx !== undefined) {
          s.x += s.vx; s.y += s.vy; s.vx *= 0.96; s.vy *= 0.96;
          s.life -= 0.022;
        } else {
          s.y += s.vy;
          s.life -= 0.02;
        }
        s.rot += s.spin;
        if (s.life <= 0) { shapes.splice(k, 1); continue; }
        drawTri(s.x, s.y, s.size, s.rot, s.life * 0.75, s.col);
      }

      /* 4. 触摸爆发的扩散环 */
      for (var m = bursts.length - 1; m >= 0; m--) {
        var b = bursts[m];
        b.r += 8.5;
        b.life -= 0.028;
        if (b.life <= 0) { bursts.splice(m, 1); continue; }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + b.col + ',' + (b.life * 0.7).toFixed(3) + ')';
        ctx.lineWidth = 2 * b.life;
        ctx.stroke();
        /* 内圈虚线，更像 HUD */
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 0.68, 0, Math.PI * 2);
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = 'rgba(' + b.col + ',' + (b.life * 0.4).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      requestAnimationFrame(frame);
    }

    resize();
    requestAnimationFrame(frame);
    window.addEventListener('resize', throttle(resize, 240));

    if (canHover) {
      /* 桌面：指针跟随 + 拖尾 */
      var lastTrail = 0;
      window.addEventListener('mousemove', function (e) {
        glow.x = e.clientX; glow.y = e.clientY; glow.a = 1;
        var now = Date.now();
        if (now - lastTrail > 55) {
          lastTrail = now;
          spawnTrail(e.clientX, e.clientY);
          if (Math.random() < 0.45) spawnShape(e.clientX, e.clientY);
        }
      }, { passive: true });
      window.addEventListener('mouseleave', function () { glow.a = 0; });
      window.addEventListener('mousedown', function (e) { burst(e.clientX, e.clientY); });
    } else {
      /* 触摸设备：点哪儿炸开一圈 */
      window.addEventListener('touchstart', function (e) {
        var tp = e.touches[0];
        if (tp) burst(tp.clientX, tp.clientY);
      }, { passive: true });
      /* 鼠标设备偶尔也会用触摸板，一并支持点击 */
      window.addEventListener('click', function (e) { burst(e.clientX, e.clientY); });
    }
  })();

  /* ---------------- 6.6 卡片聚光灯（03 / 04 板块的动态） ---------------- */
  (function spotlight() {
    if (!canHover || reduceMotion) return;
    $$('.cat, .proj').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
      });
    });
  })();

  /* ---------------- 7. 磁吸按钮 + 卡片倾斜 ---------------- */
  (function pointerFX() {
    if (!canHover || reduceMotion) return;

    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (mx * 0.26).toFixed(1) + 'px,' + (my * 0.26 - 2).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });

    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-py * 7).toFixed(2) + 'deg) rotateY(' + (px * 7).toFixed(2) + 'deg) translateZ(6px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  })();

  /* ---------------- 8. 碎碎念 ---------------- */
  (function posts() {
    var list = $('#postList');
    if (!list) return;

    var reader = $('#reader');
    var rTitle = $('#readerTitle'), rBody = $('#readerBody');
    var rDate = $('#readerDate'), rTags = $('#readerTags'), rRead = $('#readerRead');
    var lastFocus = null;

    function inline(s) {
      return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>');
    }

    function renderBody(lines) {
      var out = [], i = 0;
      while (i < lines.length) {
        var line = String(lines[i]).trim();
        if (!line) { i++; continue; }
        if (line === '---') { out.push('<hr>'); i++; continue; }
        if (line.indexOf('## ') === 0) { out.push('<h4>' + inline(escapeHTML(line.slice(3))) + '</h4>'); i++; continue; }
        if (line.indexOf('> ') === 0) {
          var q = [];
          while (i < lines.length && String(lines[i]).trim().indexOf('> ') === 0) { q.push(inline(escapeHTML(String(lines[i]).trim().slice(2)))); i++; }
          out.push('<blockquote>' + q.join('<br>') + '</blockquote>');
          continue;
        }
        if (/^[-*] /.test(line)) {
          var ul = [];
          while (i < lines.length && /^[-*] /.test(String(lines[i]).trim())) { ul.push('<li>' + inline(escapeHTML(String(lines[i]).trim().slice(2))) + '</li>'); i++; }
          out.push('<ul>' + ul.join('') + '</ul>');
          continue;
        }
        if (/^\d+\. /.test(line)) {
          var ol = [];
          while (i < lines.length && /^\d+\. /.test(String(lines[i]).trim())) { ol.push('<li>' + inline(escapeHTML(String(lines[i]).trim().replace(/^\d+\.\s*/, ''))) + '</li>'); i++; }
          out.push('<ol>' + ol.join('') + '</ol>');
          continue;
        }
        out.push('<p>' + inline(escapeHTML(line)) + '</p>');
        i++;
      }
      return out.join('');
    }

    function formatDate(iso) {
      var p = String(iso).split('-');
      return p.length === 3 ? p[0] + ' 年 ' + Number(p[1]) + ' 月 ' + Number(p[2]) + ' 日' : iso;
    }
    function readMinutes(post) {
      return Math.max(1, Math.round(post.body.join('').length / 320)) + ' 分钟读完';
    }

    /* 按日期倒序：最新的排最前。
       这样以后往 POSTS 里加文章，写在哪个位置都不影响显示顺序。 */
    var ORDERED = POSTS.slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });

    if (!ORDERED.length) {
      list.innerHTML = '<p class="msg-empty">还没有写东西，之后再来看看吧 🌙</p>';
    } else {
      var frag = document.createDocumentFragment();
      ORDERED.forEach(function (post, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'post anim';
        btn.setAttribute('data-anim', 'up');
        if (i % 3) btn.setAttribute('data-delay', String(i % 3));
        btn.setAttribute('aria-label', '阅读文章：' + post.title);
        btn.innerHTML =
          '<div class="post-meta">' +
            '<time datetime="' + escapeHTML(post.date) + '">' + escapeHTML(formatDate(post.date)) + '</time>' +
            '<span class="sep">·</span><span>' + escapeHTML(readMinutes(post)) + '</span>' +
          '</div>' +
          '<h3>' + escapeHTML(post.title) + '</h3>' +
          '<p class="post-sum">' + escapeHTML(post.summary || '') + '</p>' +
          '<div class="post-foot">' +
            '<span class="post-more">点开看全文 <i>→</i></span>' +
            '<span class="post-tags">' + (post.tags || []).map(function (t) { return '<span class="chip">' + escapeHTML(t) + '</span>'; }).join('') + '</span>' +
          '</div>';
        btn.addEventListener('click', function () { openReader(post, btn); });
        frag.appendChild(btn);
      });
      list.innerHTML = '';
      list.appendChild(frag);
    }

    function openReader(post, trigger) {
      if (!post || !reader) return;
      lastFocus = trigger || document.activeElement;
      rTitle.textContent = post.title;
      rDate.textContent = formatDate(post.date);
      rDate.setAttribute('datetime', post.date);
      rRead.textContent = readMinutes(post);
      rTags.innerHTML = (post.tags || []).map(function (t) { return '<span class="chip">' + escapeHTML(t) + '</span>'; }).join('');
      rBody.innerHTML = renderBody(post.body);
      reader.hidden = false;
      document.body.classList.add('no-scroll');
      reader.querySelector('.reader-panel').scrollTop = 0;
      $('#readerClose').focus();
    }

    function closeReader() {
      if (!reader) return;
      reader.hidden = true;
      document.body.classList.remove('no-scroll');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    if (reader) {
      $('#readerClose').addEventListener('click', closeReader);
      reader.addEventListener('click', function (e) { if (e.target === reader) closeReader(); });
      document.addEventListener('keydown', function (e) { if (!reader.hidden && e.key === 'Escape') closeReader(); });
    }
  })();

  /* ---------------- 9. 留言板 ---------------- */
  (function messages() {
    var form = $('#msgForm');
    if (!form) return;
    var listEl = $('#msgList'), emptyEl = $('#msgEmpty'), countEl = $('#msgCount');
    var statusEl = $('#formStatus'), submitBtn = $('#submitBtn');
    var nameEl = $('#fName'), msgEl = $('#fMsg'), countLabel = $('#charCount');
    var clearBtn = $('#clearMsgs'), exportBtn = $('#exportMsgs');

    var KEY = 'fly-guestbook';
    var msgs = [];
    try { msgs = JSON.parse(store.get(KEY, '[]')); } catch (e) { msgs = []; }
    if (!Array.isArray(msgs)) msgs = [];

    function save() { store.set(KEY, JSON.stringify(msgs.slice(-100))); }

    /* 提示、标题、按钮随模式变化，别让人误会 */
    (function tuneCopy() {
      /* 注意：.form-hint 是 <form> 的兄弟节点，不在表单内部，
         所以必须用 document 查，用 form.querySelector 会永远返回 null */
      var hint = document.querySelector('.form-hint');
      var head = document.querySelector('.msg-head strong');
      var btn = document.getElementById('submitBtn');
      var cardH3 = document.querySelector('.card-form > h3');

      /* 占位符没换掉就当没配，免得跳到一个假地址 */
      var linkReady = !!FORM_LINK && FORM_LINK.indexOf('REPLACE_WITH_YOUR_FORM_URL') < 0;
      var w3fReady = !!WEB3FORMS_KEY && WEB3FORMS_KEY.indexOf('REPLACE_WITH') < 0;

      var mode = w3fReady ? 'w3f' : (FORM_ENDPOINT ? 'api' : (linkReady ? 'link' : 'local'));

      var copy = {
        w3f: {
          hint: '写点什么吧，提交之后会直接发到我的邮箱，我一定会看的。',
          head: '我发出的留言',
          btn: '发送留言',
          h3: '💬 给我留言'
        },
        api: {
          hint: '写点什么吧，提交之后会直接送到我这里，我会看的。',
          head: '我发出的留言',
          btn: '发送留言',
          h3: '💬 给我留言'
        },
        link: {
          hint: '在下面写好内容，点「去提交」会打开留言表单，确认一下就能发给我。',
          head: '我发过的留言',
          btn: '去提交 →',
          h3: '💬 给我留言'
        },
        local: {
          hint: '注意：这个站点还没接上留言通道，内容只会留在你自己这台设备上，作者看不到。',
          head: '本机记录',
          btn: '存到本机',
          h3: '💬 留言（暂未接通）'
        }
      }[mode];

      if (hint) hint.textContent = copy.hint;
      if (btn) btn.textContent = copy.btn;
      if (cardH3) cardH3.textContent = copy.h3;
      if (head) {
        head.innerHTML = copy.head + ' <em id="msgCount">0</em>';
        countEl = document.getElementById('msgCount');
      }

      /* 外链模式下不必强行校验，内容可以带过去再改 */
      if (mode === 'link') {
        form.setAttribute('data-mode', 'link');
      }
    })();

    /* 提交成功后 Web3Forms 会带 ?sent=1 跳回来，这里给个明确反馈 */
    (function checkSent() {
      if (!/[?&]sent=1/.test(location.search)) return;
      root.classList.add('w3f-sent');
      var banner = document.createElement('p');
      banner.className = 'sent-banner';
      banner.textContent = '✅ 上一条留言已经送到我邮箱啦，谢谢！';
      var box = document.querySelector('.msg-box');
      if (box && box.parentNode) box.parentNode.insertBefore(banner, box);
      /* 把 URL 里的标记去掉，刷新不会重复提示 */
      try {
        history.replaceState(null, '', location.pathname + location.hash);
      } catch (e) {}
      var st = document.getElementById('formStatus');
      if (st) { st.textContent = '发送成功，我已经收到啦，谢谢你！🌸'; st.classList.add('show'); }
    })();

    function timeAgo(ts) {
      var d = Date.now() - ts;
      if (d < 60000) return '刚刚';
      if (d < 3600000) return Math.floor(d / 60000) + ' 分钟前';
      if (d < 86400000) return Math.floor(d / 3600000) + ' 小时前';
      if (d < 2592000000) return Math.floor(d / 86400000) + ' 天前';
      var dt = new Date(ts);
      return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    }

    function render() {
      listEl.innerHTML = '';
      msgs.slice().sort(function (a, b) { return b.ts - a.ts; }).forEach(function (m) {
        var li = document.createElement('li');
        li.className = 'msg-item';
        li.innerHTML =
          '<div class="msg-item-top"><strong>' + escapeHTML(m.name) + '</strong>' +
          '<time datetime="' + new Date(m.ts).toISOString() + '">' + escapeHTML(timeAgo(m.ts)) + '</time></div>' +
          '<p>' + escapeHTML(m.text) + '</p>';
        listEl.appendChild(li);
      });
      if (countEl) countEl.textContent = String(msgs.length);
      if (emptyEl) emptyEl.style.display = msgs.length ? 'none' : '';
      if (clearBtn) clearBtn.style.display = msgs.length ? '' : 'none';
      if (exportBtn) exportBtn.style.display = msgs.length ? '' : 'none';
    }

    function setError(input, message) {
      var field = input.closest('.field');
      var slot = form.querySelector('[data-err-for="' + input.id + '"]');
      if (field) field.classList.toggle('invalid', !!message);
      if (slot) slot.textContent = message || '';
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      return !message;
    }

    function validate() {
      /* 外链模式下内容会带过去，那边还能改，所以只要求填了称呼 */
      if (!FORM_ENDPOINT && FORM_LINK && FORM_LINK.indexOf('REPLACE_WITH_YOUR_FORM_URL') < 0) {
        return setError(nameEl, nameEl.value.trim() ? '' : '先写个称呼吧');
      }
      var a = setError(nameEl, nameEl.value.trim() ? '' : '还没写称呼呢');
      var v = msgEl.value.trim();
      var b = setError(msgEl, !v ? '说点什么再走吧～' : (v.length < 2 ? '至少写两个字吧' : ''));
      return a && b;
    }

    if (msgEl && countLabel) {
      var max = Number(msgEl.getAttribute('maxlength')) || 500;
      var sync = function () {
        var n = msgEl.value.length;
        countLabel.textContent = String(n);
        countLabel.parentElement.classList.toggle('warn', n > max * 0.85 && n <= max);
        countLabel.parentElement.classList.toggle('over', n > max);
      };
      msgEl.addEventListener('input', sync);
      sync();
    }

    [nameEl, msgEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () {
        if (el.closest('.field').classList.contains('invalid')) setError(el, '');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var bad = form.querySelector('.field.invalid input, .field.invalid textarea');
        if (bad) bad.focus();
        return;
      }
      var name = nameEl.value.trim().slice(0, 24);
      var text = msgEl.value.trim().slice(0, 500);

      function say(message, isError) {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.toggle('error', !!isError);
        statusEl.classList.add('show');
        setTimeout(function () { statusEl.classList.remove('show'); }, 4000);
      }

      function remember() {
        msgs.push({ name: name, text: text, ts: Date.now() });
        save(); render(); form.reset();
        if (countLabel) countLabel.textContent = '0';
        setError(nameEl, ''); setError(msgEl, '');
      }

      /* 模式⓪：3Forms / Web3Forms
         用「隐藏 iframe + 普通表单提交」，而不是 fetch。
         原因：普通表单提交不算跨域请求，完全不受 CORS 限制，
         也不用去读跨域响应 —— 这是静态站点发留言最稳的方式。
         提交完 Web3Forms 会带着 ?sent=1 跳回本站，据此给提示。 */
      if (WEB3FORMS_KEY && WEB3FORMS_KEY.indexOf('REPLACE_WITH') < 0) {
        var d = new Date();
        var stamp = d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0') + ' ' +
                    String(d.getHours()).padStart(2, '0') + ':' +
                    String(d.getMinutes()).padStart(2, '0');

        var fields = {
          access_key: WEB3FORMS_KEY,
          subject: '【个人主页】' + name + ' 给你留言了',
          from_name: 'fly 的个人主页',
          name: name,
          message: text,
          page: location.href,
          time: stamp,
          /* 提交完成后跳回本站，带上标记 */
          redirect: location.origin + location.pathname + '?sent=1'
        };

        /* 用一个隐藏 iframe 当提交目标，页面不会跳走 */
        var sink = document.getElementById('w3fSink');
        if (!sink) {
          sink = document.createElement('iframe');
          sink.id = 'w3fSink';
          sink.name = 'w3fSink';
          sink.setAttribute('title', '留言提交');
          sink.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
          document.body.appendChild(sink);
        }

        var f = document.createElement('form');
        f.method = 'POST';
        f.action = 'https://api.web3forms.com/submit';
        f.target = 'w3fSink';
        f.style.display = 'none';
        f.setAttribute('accept-charset', 'UTF-8');

        Object.keys(fields).forEach(function (k) {
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = fields[k];
          f.appendChild(input);
        });

        document.body.appendChild(f);
        f.submit();
        setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 3000);

        remember();
        say('发送中…稍等一下下 🌸');
        toast('正在发送…', 'ok');

        /* 十秒内没等到跳回，就给个如实的提示 */
        setTimeout(function () {
          if (!document.documentElement.classList.contains('w3f-sent')) {
            say('还没收到确认，如果你担心没发出去，可以再发一次', true);
          }
        }, 10000);
        return;
      }

      /* 模式②：跳到国内表单平台 */
      if (!FORM_ENDPOINT && FORM_LINK && FORM_LINK.indexOf('REPLACE_WITH_YOUR_FORM_URL') < 0) {
        var url = FORM_LINK;
        /* 尽量把已填内容带过去，减少访客重复输入 */
        try {
          var sep = url.indexOf('?') >= 0 ? '&' : '?';
          url += sep + 'name=' + encodeURIComponent(name) +
                 '&message=' + encodeURIComponent(text);
        } catch (e) {}
        window.open(url, '_blank', 'noopener');
        say('已打开留言表单，提交后我就能看到啦～');
        toast('已在新标签页打开留言表单', 'ok');
        return;
      }

      /* 模式③：什么都没配，如实说明，不假装是个留言板 */
      if (!FORM_ENDPOINT && !(WEB3FORMS_KEY && WEB3FORMS_KEY.indexOf('REPLACE_WITH') < 0)) {
        remember();
        say('已存在这台设备上（作者暂时收不到，配置后即可送达）', true);
        toast('只保存在本机，作者看不到', 'bad');
        return;
      }

      /* 配置了地址：真的发出去 */
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '发送中…'; }

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name,
          message: text,
          page: location.href,
          time: new Date().toLocaleString()
        })
      }).then(function (r) {
        if (r.ok) {
          remember();
          say('发送成功，我已经收到啦，谢谢你！🌸');
          toast('留言已送达 ✅', 'ok');
        } else {
          /* 失败就别清空表单，让人能重试 */
          say('发送失败了（' + r.status + '），内容还在，稍后再试一次', true);
          toast('发送失败，请重试', 'bad');
        }
      }).catch(function () {
        say('网络好像不太通，内容还在，稍后再试一次', true);
        toast('网络异常，请重试', 'bad');
      }).finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '发送留言'; }
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!msgs.length) return;
        if (!window.confirm('确定要清空所有留言吗？这个操作没法撤销。')) return;
        msgs = []; store.del(KEY); render();
        toast('留言已清空', 'ok');
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        if (!msgs.length) return;
        try {
          var text = msgs.map(function (m) {
            return '[' + new Date(m.ts).toLocaleString() + '] ' + m.name + '：' + m.text;
          }).join('\n');
          var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'fly-留言备份.txt';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
          toast('已导出 ' + msgs.length + ' 条留言', 'ok');
        } catch (err) {
          toast('导出失败，浏览器可能不支持', 'bad');
        }
      });
    }

    render();
  })();

  /* ---------------- 10. 联系方式：点击复制 / 拍一拍 ---------------- */
  (function contacts() {
    /* 老办法：选中一个临时输入框再 execCommand('copy')。
       现代浏览器虽然不推荐，但在缺用户激活、或权限策略受限时仍然管用。 */
    function legacyCopy(text) {
      var ok = false;
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) { ok = false; }
      return ok;
    }

    /* 三段式：现代 API -> 老办法 -> 弹框让用户自己复制。
       注意不能只在「API 不存在」时兜底 —— 它常常是「存在但拒绝」，
       那样会直接抛错，永远走不到老办法。 */
    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(function () {
          if (legacyCopy(text)) return;
          throw new Error('clipboard-unavailable');
        });
      }
      return new Promise(function (resolve, reject) {
        if (legacyCopy(text)) resolve();
        else reject(new Error('clipboard-unavailable'));
      });
    }

    $$('[data-copy]').forEach(function (card) {
      var hint = card.querySelector('.contact-hint');
      var original = hint ? hint.textContent : '';
      card.addEventListener('click', function () {
        var value = card.getAttribute('data-copy');
        copyText(value).then(function () {
          toast('已复制：' + value, 'ok');
          card.classList.add('copied');
          if (hint) hint.textContent = '已复制 ✓';
          setTimeout(function () {
            card.classList.remove('copied');
            if (hint) hint.textContent = original;
          }, 1800);
        }).catch(function () {
          /* 实在复制不了就弹出来让用户自己选中，别让人干瞪眼 */
          try { window.prompt('浏览器不让自动复制，手动复制一下吧：', value); } catch (e) {}
          toast('已弹出，手动复制即可', 'bad');
        });
      });
    });

    /* 拍一拍（页面最底下那个大按钮） */
    var poke = $('#pokeCard'), pokeText = $('#pokeText'), pokeCount = $('#pokeCount');
    if (poke && pokeText) {
      var replies = [
        '被拍到啦 ✨',
        '在的在的，怎么啦？',
        '今天也要开心一点哦 🌸',
        '正在写代码，勿扰（骗你的）',
        '送你一颗小星星 ⭐',
        '一起打游戏吗？🎮',
        '已经拍了好多下了，但我不会生气的～',
        '鼓棒掉了，等我捡一下 🥁',
        '滑板又摔了，但是没事 🛹',
        '唉嘿嘿，谢谢你陪我玩这么久'
      ];
      var n = 0;
      /* 拍的总数存本地，来一次算一次 */
      var KEY = 'fly-poke-count';
      var total = Number(store.get(KEY, '0')) || 0;
      if (pokeCount) pokeCount.textContent = String(total);

      poke.addEventListener('click', function () {
        pokeText.textContent = replies[n % replies.length];
        n++;
        total++;
        store.set(KEY, String(total));
        if (pokeCount) pokeCount.textContent = String(total);

        /* 重放两个动画 */
        pokeText.style.animation = 'none';
        void pokeText.offsetWidth;
        pokeText.style.animation = '';
        poke.classList.remove('poked');
        void poke.offsetWidth;
        poke.classList.add('poked');
        setTimeout(function () { poke.classList.remove('poked'); }, 620);

        /* 每 10 下给个额外反馈 */
        if (total % 10 === 0) toast('你已经拍了我 ' + total + ' 下，厉害 👏', 'ok');
      });
    }
  })();

  /* ---------------- 11. 贪吃蛇 ---------------- */
  (function snake() {
    var cv = $('#snake');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var scoreEl = $('#snakeScore'), bestEl = $('#snakeBest'), levelEl = $('#snakeLevel');
    var overlay = $('#snakeOverlay'), bigEl = $('#snakeBig'), smallEl = $('#snakeSmall');
    var startBtn = $('#snakeStart'), pauseBtn = $('#snakePause'), restartBtn = $('#snakeRestart');

    var COLS = 16, ROWS = 16;
    var CELL = cv.width / COLS;                 // 30
    var BEST_KEY = 'fly-snake-best';

    var rsBox = $('#runSummary'), rsTitle = $('#rsTitle'), rsDesc = $('#rsDesc');

    /* 排行榜的读写与渲染用共享实现（见文件上方的 boardPaint） */
    function loadBoard() { return boardLoad(); }
    function renderBoard(freshIdx) { boardPaint(freshIdx); }

    /* 记一局：返回它在榜上的名次（-1 表示没上榜） */
    function recordRun(finalScore, seconds) {
      var list = boardLoad();
      var entry = { score: finalScore, ts: Date.now(), sec: Math.round(seconds) };
      list.push(entry);
      list.sort(function (a, b) { return b.score - a.score || a.ts - b.ts; });
      var top = list.slice(0, 5);
      store.set(BOARD_KEY, JSON.stringify(top));
      store.set(PLAYS_KEY, String((Number(store.get(PLAYS_KEY, '0')) || 0) + 1));
      var idx = top.indexOf(entry);
      boardPaint(idx);
      return idx;
    }

    /* 本局评语 */
    function describe(finalScore, idx, seconds) {
      if (!rsBox) return;
      rsBox.classList.toggle('best', idx === 0);
      var titles = ['🐍 还没开始', '🌱 刚起步', '🙂 有点样子了', '😎 稳住了', '🔥 手感来了', '👑 本页最强'];
      var t = finalScore === 0 ? 0
            : finalScore < 3 ? 1
            : finalScore < 7 ? 2
            : finalScore < 13 ? 3
            : finalScore < 20 ? 4 : 5;
      if (rsTitle) rsTitle.textContent = titles[t];
      var desc;
      if (finalScore === 0) {
        desc = '一个果子都没吃到，再来一局吧。';
      } else if (idx === 0) {
        desc = '本局 ' + finalScore + ' 分、坚持了 ' + Math.round(seconds) + ' 秒 —— 这是你的最好成绩！';
      } else if (idx > 0) {
        desc = '本局 ' + finalScore + ' 分，排在榜上第 ' + (idx + 1) + ' 名，' +
               (Math.round(seconds)) + ' 秒。';
      } else {
        var list = loadBoard();
        var topScore = list.length ? list[0].score : finalScore;
        desc = '本局 ' + finalScore + ' 分，离最好成绩还差 ' + (topScore - finalScore) + ' 分。';
      }
      if (rsDesc) rsDesc.textContent = desc;
    }



    var snake, dir, nextDir, food, score, alive, paused, timer, tickMs, best;
    var runStart = performance.now();

    best = Number(store.get(BEST_KEY, '0')) || 0;
    if (bestEl) bestEl.textContent = String(best);

    function reset() {
      var mid = Math.floor(COLS / 2);
      snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      score = 0; alive = true; paused = false;
      tickMs = 150;
      placeFood();
      updateHud();
    }

    function placeFood() {
      var tries = 0, p;
      do {
        p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        tries++;
      } while (snake.some(function (s) { return s.x === p.x && s.y === p.y; }) && tries < 300);
      food = p;
    }

    function updateHud() {
      rollNumber(scoreEl, score);
      if (levelEl) levelEl.textContent = String(Math.min(9, 1 + Math.floor(score / 5)));
      rollNumber(bestEl, best);
    }

    /* --- 绘制 --- */
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function draw() {
      var dark = root.getAttribute('data-theme') === 'dark';
      ctx.clearRect(0, 0, cv.width, cv.height);

      /* 棋盘格 */
      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          if ((x + y) % 2 === 0) {
            ctx.fillStyle = dark ? 'rgba(255,255,255,.022)' : 'rgba(120,100,180,.045)';
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
          }
        }
      }

      /* 食物 */
      var t = performance.now() / 420;
      var pulse = 1 + Math.sin(t) * 0.12;
      ctx.save();
      ctx.shadowColor = dark ? 'rgba(255,217,142,.85)' : 'rgba(214,160,40,.7)';
      ctx.shadowBlur = 16 * pulse;
      ctx.fillStyle = dark ? '#ffd98e' : '#e8b23c';
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.3 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      /* 蛇 */
      snake.forEach(function (s, i) {
        var head = i === 0;
        var k = 1 - Math.min(0.42, i / (snake.length * 1.9));
        ctx.fillStyle = head
          ? (dark ? '#c9bfff' : '#6547bd')
          : (dark ? 'rgba(158,201,245,' + (0.55 + k * 0.4) + ')' : 'rgba(123,95,214,' + (0.42 + k * 0.52) + ')');
        roundRect(s.x * CELL + 1.5, s.y * CELL + 1.5, CELL - 3, CELL - 3, head ? 9 : 7);
        ctx.fill();

        if (head) {
          /* 眼睛，跟着方向看 */
          var cx = s.x * CELL + CELL / 2, cy = s.y * CELL + CELL / 2;
          var ex = dir.y !== 0 ? 5 : 0, ey = dir.x !== 0 ? 5 : 0;
          ctx.fillStyle = dark ? '#221e33' : '#fff';
          [[-ex, -ey], [ex, ey]].forEach(function (o) {
            ctx.beginPath();
            ctx.arc(cx + o[0] * 0.6 + (dir.x * 3), cy + o[1] * 0.6 + (dir.y * 3), 2.6, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      });

      /* 暂停遮罩 */
      if (paused && alive) {
        ctx.fillStyle = dark ? 'rgba(20,18,29,.72)' : 'rgba(253,251,255,.78)';
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.fillStyle = dark ? '#ece8fa' : '#38324c';
        ctx.font = '700 26px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('已暂停', cv.width / 2, cv.height / 2);
      }
    }

    /* --- 主循环 --- */
    function step() {
      if (!alive || paused) return;

      /* 应用缓存的转向 */
      if (nextDir.x !== -dir.x || nextDir.y !== -dir.y) dir = nextDir;

      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      /* 撞墙 */
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) return gameOver();
      /* 撞自己（尾巴那一格会移开，所以不算） */
      var willGrow = (head.x === food.x && head.y === food.y);
      var limit = willGrow ? snake.length : snake.length - 1;
      for (var i = 0; i < limit; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return gameOver();
      }

      snake.unshift(head);
      if (willGrow) {
        score++;
        if (score > best) { best = score; store.set(BEST_KEY, String(best)); }
        placeFood();
        updateHud();
        /* 每 5 分提速一点 */
        tickMs = Math.max(62, 150 - Math.floor(score / 5) * 11);
        restartTimer();
      } else {
        snake.pop();
      }
    }

    function restartTimer() {
      clearInterval(timer);
      timer = setInterval(function () { step(); draw(); }, tickMs);
    }

    function gameOver() {
      alive = false;
      clearInterval(timer); timer = null;
      var seconds = (performance.now() - runStart) / 1000;
      draw();
      if (bigEl) bigEl.textContent = '游戏结束 · 得分 ' + score;
      var idx = recordRun(score, seconds);
      if (smallEl) {
        smallEl.textContent = idx === 0 && score > 0
          ? '新纪录！你就是本页最强的蛇 🐍'
          : (score === 0 ? '一个都没吃到，要不…再来一次？' : '最高纪录还是 ' + best + ' 分，再冲一把');
      }
      describe(score, idx, seconds);
      if (startBtn) startBtn.textContent = '再来一局';
      if (overlay) overlay.classList.remove('hide');
    }

    function start() {
      reset();
      runStart = performance.now();
      if (overlay) overlay.classList.add('hide');
      if (pauseBtn) pauseBtn.textContent = '暂停';
      if (rsTitle) rsTitle.textContent = '正在玩…';
      if (rsDesc) rsDesc.textContent = '方向键 / WASD 控制，手机可以滑动屏幕。';
      if (rsBox) rsBox.classList.remove('best');
      restartTimer();
      draw();
    }

    function togglePause() {
      if (!alive) return;
      paused = !paused;
      if (pauseBtn) pauseBtn.textContent = paused ? '继续' : '暂停';
      if (paused) { clearInterval(timer); timer = null; }
      else restartTimer();
      draw();
    }

    function turn(nx, ny) {
      if (!alive || paused) return;
      /* 不能直接反向 */
      if (nx === -dir.x && ny === -dir.y) return;
      nextDir = { x: nx, y: ny };
    }

    /* --- 输入 --- */
    var KEYS = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
      W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0]
    };

    document.addEventListener('keydown', function (e) {
      /* 只在游戏区域进入视口时才接管按键，避免影响正常滚动 */
      var r = cv.getBoundingClientRect();
      var visible = r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
      if (!visible) return;
      var k = KEYS[e.key];
      if (k) {
        if (!alive) return;
        e.preventDefault();
        turn(k[0], k[1]);
        if (paused) togglePause();
        return;
      }
      if (e.key === ' ' && visible) {
        e.preventDefault();
        if (!alive) start(); else togglePause();
      }
    });

    /* 触屏滑动 */
    var tsx = 0, tsy = 0, tracking = false;
    cv.addEventListener('touchstart', function (e) {
      tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    cv.addEventListener('touchmove', function (e) { if (tracking) e.preventDefault(); }, { passive: false });
    cv.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - tsx;
      var dy = e.changedTouches[0].clientY - tsy;
      if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
      else turn(0, dy > 0 ? 1 : -1);
    }, { passive: true });

    /* 方向键盘 */
    $$('.dpad-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[b.getAttribute('data-dir')];
        if (m) { turn(m[0], m[1]); if (paused) togglePause(); }
      });
    });

    if (startBtn) startBtn.addEventListener('click', start);
    if (restartBtn) restartBtn.addEventListener('click', start);
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

    /* 离开视口自动暂停，省 CPU */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting && alive && !paused) togglePause();
        });
      }, { threshold: 0 }).observe(cv);
    }

    window.addEventListener('themechange', draw);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && alive && !paused) togglePause();
    });

    reset();
    draw();
  })();

  /* ---------------- 11.4 音乐律动引擎 ----------------
     把声音接到 AnalyserNode，逐帧算能量，写进 --beat（0~1），
     由 CSS 驱动光晕、强调色、音条的呼吸。
     拿不到真实频谱时（跨域音频等）退回正弦模拟，效果不丢。 */
  var Beat = (function () {
    var analyser = null, data = null, raf = null, source = null;
    var beating = false, simT = 0;
    var bars = null;

    function barsEl() {
      if (!bars) bars = document.getElementById('beatBars');
      return bars;
    }

    function setBeat(v) {
      root.style.setProperty('--beat', v.toFixed(3));
      var b = barsEl();
      if (b) {
        var kids = b.children;
        for (var i = 0; i < kids.length; i++) {
          /* 每根条错开一点相位，看起来更像真的 */
          var ph = i * 0.7;
          var h = 6 + Math.max(0, Math.sin(simT * 3 + ph)) * 20 * (0.4 + v);
          kids[i].style.height = h.toFixed(1) + 'px';
        }
      }
    }

    function loop() {
      if (!beating) return;
      simT += 0.05;
      var v = 0;

      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        var sum = 0;
        /* 只取低频段（鼓点主要在这里），响应更跟手 */
        var n = Math.min(24, data.length);
        for (var i = 0; i < n; i++) sum += data[i];
        v = (sum / n) / 255;
        /* 低音偏多，压缩一下动态范围 */
        v = Math.min(1, Math.pow(v, 0.75) * 1.5);
      } else {
        /* 模拟：两拍一循环，带一点强弱变化 */
        v = 0.22 + 0.5 * Math.pow(Math.max(0, Math.sin(simT * 2.2)), 3);
      }

      setBeat(v);
      raf = requestAnimationFrame(loop);
    }

    return {
      /* 用真实音频节点：synth 传 master，file 传 audio 元素 */
      attachNode: function (node, ctx) {
        try {
          analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.72;
          data = new Uint8Array(analyser.frequencyBinCount);
          node.connect(analyser);
          return true;
        } catch (e) { analyser = null; data = null; return false; }
      },
      attachElement: function (el, ctx) {
        try {
          source = ctx.createMediaElementSource(el);
          analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.72;
          data = new Uint8Array(analyser.frequencyBinCount);
          source.connect(analyser);
          analyser.connect(ctx.destination);
          return true;
        } catch (e) { analyser = null; data = null; return false; }
      },
      start: function () {
        if (beating) return;
        beating = true;
        document.body.classList.add('music-live');
        raf = requestAnimationFrame(loop);
      },
      stop: function () {
        beating = false;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        document.body.classList.remove('music-live');
        root.style.setProperty('--beat', '0');
        var b = barsEl();
        if (b) {
          for (var i = 0; i < b.children.length; i++) b.children[i].style.height = '';
        }
      }
    };
  })();

  /* ---------------- 11.5 耳机 = 音乐播放器 ----------------
     优先播放同目录下的 bgm.mp3（有文件就播文件，没有才用合成音）；
     没有文件时用 Web Audio 现场合成一段原创轻音乐，不依赖网络也不涉及版权。 */
  (function music() {
    var btn = $('#musicBtn');
    if (!btn) return;

    var playing = false;
    var ac = null, master = null, timer = null, step = 0, nextTime = 0;
    var usingFile = false, audioEl = null;
    var started = false;      // 是否已经开始过（避免重复触发）

    function setUI(on) {
      playing = on;
      btn.classList.toggle('playing', on);
      btn.setAttribute('aria-label', on ? '暂停背景音乐' : '播放背景音乐');
      btn.title = on ? '点一下暂停' : '点一下放首歌';
    }

    /* ---------- 方案 A：外部音频文件 ---------- */
    function tryFile(done) {
      var a = new Audio();
      a.loop = true;
      a.volume = 0.5;
      a.preload = 'auto';
      var settled = false;
      a.addEventListener('canplaythrough', function () {
        if (settled) return; settled = true;
        audioEl = a; done(true);
      });
      a.addEventListener('error', function () {
        if (settled) return; settled = true;
        done(false);
      });
      setTimeout(function () { if (!settled) { settled = true; done(false); } }, 1600);
      a.src = 'bgm.mp3';
      a.load();
    }

    /* ---------- 方案 B：Web Audio 合成 ---------- */
    /* C 大调五声音阶，简单的循环分解和弦，听着不吵 */
    var MELODY = [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33];
    var BASS   = [130.81, 174.61, 196.00, 164.81];

    function synthStart() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { toast('这个浏览器不支持播放音乐', 'bad'); return false; }
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 0.0001;
      master.connect(ac.destination);
      master.gain.exponentialRampToValueAtTime(0.16, ac.currentTime + 1.2);
      /* 把合成音接到律动分析器 */
      Beat.attachNode(master, ac);
      Beat.start();
      nextTime = ac.currentTime + 0.1;
      step = 0;

      /* 主循环：提前 0.5 秒排布音符 */
      timer = setInterval(function () {
        if (!ac) return;
        while (nextTime < ac.currentTime + 0.5) {
          scheduleStep(step, nextTime);
          nextTime += 0.32;
          step++;
        }
      }, 90);
      return true;
    }

    function scheduleStep(i, at) {
      /* 旋律：三角波，轻一点 */
      var f = MELODY[i % MELODY.length];
      if (i % 2 === 0 || i % 8 === 3) {
        var o = ac.createOscillator();
        var g = ac.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.5, at + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.62);
        o.connect(g); g.connect(master);
        o.start(at); o.stop(at + 0.7);
      }

      /* 低音：每 4 步换一次 */
      if (i % 4 === 0) {
        var b = ac.createOscillator();
        var bg = ac.createGain();
        b.type = 'sine';
        b.frequency.value = BASS[(i / 4) % BASS.length];
        bg.gain.setValueAtTime(0.0001, at);
        bg.gain.exponentialRampToValueAtTime(0.34, at + 0.04);
        bg.gain.exponentialRampToValueAtTime(0.0001, at + 1.15);
        b.connect(bg); bg.connect(master);
        b.start(at); b.stop(at + 1.25);
      }

      /* 空气感的高音点缀 */
      if (i % 8 === 6) {
        var h = ac.createOscillator();
        var hg = ac.createGain();
        h.type = 'sine';
        h.frequency.value = f * 2;
        hg.gain.setValueAtTime(0.0001, at);
        hg.gain.exponentialRampToValueAtTime(0.12, at + 0.03);
        hg.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
        h.connect(hg); hg.connect(master);
        h.start(at); h.stop(at + 1);
      }
    }

    function synthStop() {
      if (timer) { clearInterval(timer); timer = null; }
      if (master && ac) {
        try {
          master.gain.cancelScheduledValues(ac.currentTime);
          master.gain.setValueAtTime(master.gain.value, ac.currentTime);
          master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.45);
        } catch (e) {}
      }
      var old = ac;
      setTimeout(function () { if (old && old.close) { try { old.close(); } catch (e) {} } }, 700);
      ac = null; master = null;
    }

    /* ---------- 真正开始播放 ----------
       抽出来是为了让入场门复用：点「开启」那一下就是用户手势，
       浏览器只允许在这种时机启动声音，所以「进门自动放歌」只能挂在那里。 */
    /* 给音频文件建一个 Web Audio 链路，用来做律动。
       注意：一旦接入 MediaElementSource，就必须再由我们连回 destination，
       否则就没声音了。失败时退回模拟节拍，不影响播放。 */
    var fileCtx = null;
    function hookFile(el) {
      if (fileCtx) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { Beat.start(); return; }
      try {
        fileCtx = new AC();
        if (Beat.attachElement(el, fileCtx)) Beat.start();
        else Beat.start();
      } catch (e) {
        fileCtx = null;
        Beat.start();
      }
    }

    function startPlaying() {
      if (playing || started) return;
      started = true;

      if (usingFile) {
        if (audioEl) {
          hookFile(audioEl);
          audioEl.play().then(function () { setUI(true); })
            .catch(function () { started = false; });
        }
        return;
      }

      /* 先看有没有音频文件；没有就退回现场合成 */
      tryFile(function (ok) {
        if (ok) {
          usingFile = true;
          audioEl.volume = 0.45;
          hookFile(audioEl);
          audioEl.play().then(function () {
            setUI(true);
            toast('🎵 Moon Halo · 正在播放', 'ok');
          }).catch(function () {
            started = false;
            Beat.stop();
            toast('音乐被浏览器拦下了，点右下角耳机试试', 'bad');
          });
        } else {
          if (synthStart()) { setUI(true); toast('给你放了段轻音乐 🎵', 'ok'); }
          else { started = false; }
        }
      });
    }

    /* 供入场门调用 */
    window.__startMusic = startPlaying;

    /* ---------- 开关 ---------- */
    btn.addEventListener('click', function () {
      if (playing) {
        if (usingFile && audioEl) audioEl.pause();
        else synthStop();
        Beat.stop();
        setUI(false);
        toast('音乐已暂停 🎧');
        return;
      }
      if (usingFile) {
        if (audioEl) {
          hookFile(audioEl);
          audioEl.play().then(function () {
            setUI(true); Beat.start(); toast('正在播放 🎵', 'ok');
          }).catch(function () { toast('播放被浏览器拦下了，再点一次试试', 'bad'); });
        }
        return;
      }
      /* 第一次点击：先看有没有音频文件 */
      tryFile(function (ok) {
        if (ok) {
          usingFile = true;
          audioEl.play().then(function () { setUI(true); toast('正在播放 🎵', 'ok'); })
            .catch(function () { setUI(false); toast('播放被浏览器拦下了，再点一次试试', 'bad'); });
        } else {
          if (synthStart()) { setUI(true); toast('给你放了段轻音乐 🎵', 'ok'); }
        }
      });
    });

    /* 标签页切走时自动暂停，别吵到别人 */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden || !playing) return;
      if (usingFile && audioEl) audioEl.pause();
      else synthStop();
      Beat.stop();
      setUI(false);
    });
  })();

  /* ---------------- 11.9 排行榜首次渲染 ---------------- */
  boardPaint(-1);

  /* ---------------- 12. 其他 ---------------- */
  (function misc() {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());

    $$('[data-todo]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        toast(el.getAttribute('data-todo'), 'bad');
      });
    });

    if (location.hash) {
      var target = document.querySelector(location.hash);
      if (target) {
        setTimeout(function () {
          var navH = ($('#nav') ? $('#nav').offsetHeight : 0) + 16;
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'auto' });
        }, 80);
      }
    }
  })();

})();
