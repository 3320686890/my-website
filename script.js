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
  var SWIPE_NEED  = 0.34;  // 上滑多少比例算打开（相对视口高度）

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

    /* ---------- 第 1 关：上滑 ---------- */
    var dragging = false, startY = 0, progress = 0, passed = false;

    function setProgress(p) {
      progress = Math.max(0, Math.min(1, p));
      if (bar) bar.style.width = (progress * 100).toFixed(1) + '%';
      var box = bar && bar.parentElement;
      if (box) box.classList.toggle('ready', progress >= 1);
    }

    function beginSwipe(y) {
      dragging = true; startY = y;
      gateEl.classList.add('dragging');
    }

    function moveSwipe(y) {
      if (!dragging) return;
      var up = startY - y;                       // 向上为正
      setProgress(up / (window.innerHeight * SWIPE_NEED * 1.6));
      if (up > window.innerHeight * SWIPE_NEED) {
        dragging = false;
        gateEl.classList.remove('dragging');
        setProgress(1);
        reveal();
      }
    }

    function endSwipe() {
      if (!dragging) return;
      dragging = false;
      gateEl.classList.remove('dragging');
      /* 没滑够就弹回去 */
      if (progress < 1) {
        setProgress(0);
        if (progress > 0.25) toast('再往上滑一点点～', 'bad');
      }
    }

    sceneSwipe.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button')) return;
      sceneSwipe.setPointerCapture && sceneSwipe.setPointerCapture(e.pointerId);
      beginSwipe(e.clientY);
    });
    sceneSwipe.addEventListener('pointermove', function (e) { moveSwipe(e.clientY); });
    sceneSwipe.addEventListener('pointerup', endSwipe);
    sceneSwipe.addEventListener('pointercancel', endSwipe);

    /* 触屏：阻止页面跟着滚 */
    sceneSwipe.addEventListener('touchmove', function (e) {
      if (dragging) e.preventDefault();
    }, { passive: false });

    /* 滚轮也算上滑 */
    sceneSwipe.addEventListener('wheel', function (e) {
      if (e.deltaY >= 0) return;
      setProgress(progress + 0.12);
      if (progress >= 1) reveal();
    }, { passive: true });

    /* 键盘：方向上 / 空格 也能过 */
    function onSwipeKey(e) {
      if (sceneSwipe.hidden) return;
      if (e.key === 'ArrowUp') { setProgress(progress + 0.25); if (progress >= 1) reveal(); }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setProgress(1); reveal(); }
    }

    function reveal() {
      if (passed) return;
      passed = true;
      document.removeEventListener('keydown', onSwipeKey);
      sceneSwipe.hidden = true;
      sceneHold.hidden = false;
      initHold();
    }

    document.addEventListener('keydown', onSwipeKey);
    if (reduceMotion) { /* 仍然保留上滑，只是动画更快 */ }

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

      var holding = false, t0 = 0, raf = null, finalT = 0;

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

      function loop() {
        if (!holding) return;
        paint((performance.now() - t0) / 1000);
        raf = requestAnimationFrame(loop);
      }

      function down(e) {
        if (e && e.button !== undefined && e.button !== 0) return;
        if (holding) return;
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
        paint(0);
        raf = requestAnimationFrame(loop);
      }

      function up() {
        if (!holding) return;
        holding = false;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
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

      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', up);
      window.addEventListener('blur', up);

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
      if (bar) {
        var max = root.scrollHeight - window.innerHeight;
        bar.style.width = ((max > 0 ? Math.min(1, Math.max(0, y / max)) : 0) * 100).toFixed(2) + '%';
      }
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

  /* ---------------- 6.5 鼠标跟随柔光光晕 ---------------- */
  (function cursorGlow() {
    if (!canHover || reduceMotion) return;

    var el = document.createElement('div');
    el.className = 'cursor-glow';
    document.body.appendChild(el);

    var tx = 0, ty = 0, cx = 0, cy = 0, on = false, raf = null;

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!on) {
        on = true; cx = tx; cy = ty;
        el.classList.add('on');
        if (!raf) raf = requestAnimationFrame(loop);
      }
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      on = false; el.classList.remove('on');
    });

    function loop() {
      /* 缓动跟随，形成柔和的拖尾 */
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.transform = 'translate3d(' + (cx - 160).toFixed(1) + 'px,' + (cy - 160).toFixed(1) + 'px,0)';
      raf = on ? requestAnimationFrame(loop) : null;
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
    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;left:-9999px;';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          resolve();
        } catch (e) { reject(e); }
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
          toast('复制失败，手动记一下吧：' + value, 'bad');
        });
      });
    });

    /* 拍一拍 */
    var poke = $('#pokeCard'), pokeText = $('#pokeText');
    if (poke && pokeText) {
      var replies = [
        '唉嘿嘿，被拍到啦 ✨',
        '在的在的，怎么啦？',
        '今天也要开心一点哦 🌸',
        '正在写代码，勿扰（骗你的）',
        '送你一颗小星星 ⭐',
        '一起打游戏吗？🎮',
        '已经拍了好多下了，但我不会生气的～',
        '鼓棒掉了，等我捡一下 🥁',
        '滑板又摔了，但是没事 🛹'
      ];
      var n = 0;
      poke.addEventListener('click', function () {
        pokeText.textContent = replies[n % replies.length];
        pokeText.style.animation = 'none';
        void pokeText.offsetWidth;
        pokeText.style.animation = '';
        pokeText.classList.add('poke-flash');
        setTimeout(function () { pokeText.classList.remove('poke-flash'); }, 500);
        n++;
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

    var snake, dir, nextDir, food, score, alive, paused, timer, tickMs, best;

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
      if (scoreEl) scoreEl.textContent = String(score);
      if (levelEl) levelEl.textContent = String(Math.min(9, 1 + Math.floor(score / 5)));
      if (bestEl) bestEl.textContent = String(best);
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
      draw();
      if (bigEl) bigEl.textContent = '游戏结束 · 得分 ' + score;
      if (smallEl) {
        smallEl.textContent = score >= best && score > 0
          ? '新纪录！你就是本页最强的蛇 🐍'
          : (score === 0 ? '一个都没吃到，要不…再来一次？' : '最高纪录还是 ' + best + ' 分，再冲一把');
      }
      if (startBtn) startBtn.textContent = '再来一局';
      if (overlay) overlay.classList.remove('hide');
    }

    function start() {
      reset();
      if (overlay) overlay.classList.add('hide');
      if (pauseBtn) pauseBtn.textContent = '暂停';
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

  /* ---------------- 11.5 耳机 = 音乐播放器 ----------------
     优先播放 assets/bgm.mp3（你自己放一个进去就能用）；
     没有文件时用 Web Audio 现场合成一段原创轻音乐，不依赖网络也不涉及版权。 */
  (function music() {
    var btn = $('#musicBtn');
    if (!btn) return;

    var playing = false;
    var ac = null, master = null, timer = null, step = 0, nextTime = 0;
    var usingFile = false, audioEl = null;

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
      a.src = 'assets/bgm.mp3';
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

    /* ---------- 开关 ---------- */
    btn.addEventListener('click', function () {
      if (playing) {
        if (usingFile && audioEl) audioEl.pause();
        else synthStop();
        setUI(false);
        toast('音乐已暂停 🎧');
        return;
      }
      if (usingFile) {
        if (audioEl) {
          audioEl.play().then(function () { setUI(true); toast('正在播放 🎵', 'ok'); })
            .catch(function () { toast('播放被浏览器拦下了，再点一次试试', 'bad'); });
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
      setUI(false);
    });
  })();

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
