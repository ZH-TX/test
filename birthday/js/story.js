/* ============================================================================
   叙事时间线（数据驱动）

   ★ 要加内容，只改下面 SCENES 数组。HTML 和逻辑都不用碰。
   ★ 标了「占位」的句子是我当初随手写的草稿，等你的文字往里换。

   每种场景的写法：

     { kind: 'greet', hi: 'hi', name: '娇娇', sub: '其实我很喜欢你的名字' }
        大标题 + 小字。hi 和 name 逐字砸入。

     { kind: 'big', text: '今天是你生日啊' }
        一句大字，缩放切入。

     { kind: 'chat', text: '生日快乐！！！\n愿你……', send: '发送' }
        假聊天框，文字逐字打出（\n 换行），打完按钮闪一下。

     { kind: 'lines', lines: ['第一句', '第二句', '第三句'] }
        逐句轮播：进 → 停 → 出。可以用 <strong> 和
        <span class="smile">:)</span>。最后一句停住不退。

     { kind: 'para', text: '很长的一封信……\n可以换行，会逐字打出来，超出高度自动滚动。', cps: 32, sign: '—— 落款' }
        长信模式：逐字打字机 + 光标 + 自动跟随滚动。
        打字途中点一下 = 立刻写完；写完之后再点一下 = 翻到下一幕。
        cps   每秒打几个字（默认 32）
        sign  可选的落款，写完后淡入
        信纸感的段落，适合放长一点的心里话。

     { kind: 'so', chars: ['所', '以'] }
        巨大单字砸入。

     { kind: 'photo', photo: 'img/photo.jpg', wish: '生日快乐', sub: '愿你……' }
        圆形照片砸进 + 生日帽飞入 + 标题逐字弹跳。

   每个场景可以单独覆盖节奏：
     hold      这一幕停多久（毫秒）
     gap       逐句轮播时每句之间的空档
     leaveGap  这一幕退场后到下一幕的空档
     typeSpeed 打字速度（毫秒/字）
   ========================================================================== */
(function () {
  "use strict";

  var SCENES = [
    {
      kind: "greet",
      hold: 1700,
      hi: "hi",
      name: "娇娇",
      sub: "好久不见", // 占位，待你改写
    },
    {
      kind: "big",
      hold: 1400,
      text: "今天是你生日吖", // 占位，待你改写
    },
    {
      kind: "chat",
      hold: 1500,
      typeSpeed: 45,
      send: "爱你",
      text: "生日快乐！！！超级多超级多的快乐，都给你。\n愿你新的一岁，平安顺遂,万事如意; \n想吃的东西都能吃到, 想要的都能得到。",
    },
    {
      kind: "lines",
      hold: 1100,
      gap: 420,
      // 占位，待你改写（整组都是）
      lines: [
        "好了, 说完啦",
        "但是",
        "我想，我要做点<strong>特别的</strong>",
        "因为，",
        '你对我来说很特别<span class="smile">:)</span>',
      ],
    },

    {
      kind: "para",
      hold: 2600,
      sign: "—— 那个不太会说话的人",
      // ↓↓↓ 这封信是草稿，按你自己的话说就行，长短随意
      text:
        "娇娇：\n\n" +
        "这一年, 我们有过争吵, 也有过欢笑; 悲欢离合, 喜怒哀乐, 我们零零总总,多多少少都经历过; 对于你,对于我而言,这一年都是特别的一年 \n\n" +
        "已经是认识你的第二个生日呀, 这一年对于你而言肯定是一个特别的一年: 先是经历过病痛缠身,坎坷不断; 也经历过订婚的欢喜时光;\n" +
        "我想起你因病痛而难受的模样, 也看到过你订婚时那种欢笑; 常常感慨世事无常, 希望我们可以携手相伴, 共同面对 \n" +
        "认识你之后我发现我比之前健谈了许多, 有时想到你还会不自觉的傻傻发笑\n\n" +
        "我以前不太懂别人说的「有了牵挂」是什么意思。现在懂了 —— 你的消息我会第一时间看，你半天没回，我会开始想是不是出什么事了。\n\n" +
        "虽分隔两地, 但我对于你可是时常想念呀; 希望你可以快快好起来, 一起去体验以后得岁月 \n\n" +
        "我一直是非常喜欢月亮的这意象的,「海上生明月, 天涯共此时」 抬头望月, 看到月亮就如古人般遥寄思念到远方的亲人\n\n" +
        "我不一定能给你多厉害的东西,  但我想一直陪在你身边。\n\n" +
        "生日快乐。\n" +
        "不是客套话，是真的希望你今天开心，明天也开心，一直开心下去。",
    },
    {
      kind: "lines",
      hold: 1400,
      lines: ["不知不觉又大了一岁", "娇娇有没有想我吖"],
    },

    {
      kind: "so",
      hold: 1200,
      chars: ["所", "以"],
    },
    {
      kind: "photo",
      hold: 2600,
      photo: "img/photo.jpg",
      wish: "生日快乐哦",
      sub: "但愿人长久,千里共婵娟",
    },
    {
      kind: "big",
      hold: 1300,
      text: "mua~, 亲一口💋", // 占位，待你改写
    },
    {
      kind: "lines",
      hold: 1200,
      gap: 420,
      // 第二句占位，待你改写
      lines: ["好啦，下面还有哦", "往下走，别眨眼"],
    },
  ];

  /* ★★★ 全局节奏：只改这一个数 ★★★
     SPEED  停留时长的倍率。0.5 = 快一倍，1 = 原速，2 = 慢一倍。
            只影响「每段停多久」和「换段空档」，不影响打字速度。

     每段的规则是两条路同时挂着：
       · 到点自动进下一段
       · 期间点一下屏幕，立刻进下一段
     想让人必须点：把 SPEED 调到 8 以上就够久了。 */

  var SPEED = 1.8;

  // ★ 长信打字速度：每秒打几个字。越小越慢，调这一个数就行。
  //   8 = 很慢很慢（像真的在手写）；14 = 偏慢；22 = 正常；35 = 赶时间
  var LETTER_CPS = 14;

  var TAP_HINT_DELAY = 900; // 超过这么久没点，才浮出「轻触继续」提示
  var MIN_SETTLE = 550; // 进场动画至少播这么久才接受点击，防止误触连跳

  var DEFAULT = {
    hold: 1200,
    gap: 420,
    leaveGap: 450,
    typeSpeed: 45,
    enterGap: 400,
  };

  /* ---------------------------------------------------------------------
	   引擎
	   --------------------------------------------------------------------- */
  var TOKEN = 0;
  var fast = false;
  var pending = null;

  var storyEl = document.getElementById("story");
  var skipBtn = document.getElementById("skipBtn"); // 已注释掉，可能取不到

  function wait(ms, token) {
    if (fast) return Promise.resolve(token === TOKEN);
    return new Promise(function (res) {
      var settled = false;
      var fin = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (pending === fin) pending = null;
        res(token === TOKEN);
      };
      var timer = setTimeout(fin, ms);
      pending = fin;
    });
  }

  function enter(el) {
    el.classList.remove("out");
    el.classList.add("in");
  }

  function leave(el) {
    el.classList.remove("in");
    el.classList.add("out");
  }

  function typeText(node, text, perChar, token) {
    node.innerHTML = "";
    var spans = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.textContent = text[i];
      node.appendChild(s);
      spans.push(s);
    }
    return new Promise(function (res) {
      var i = 0;
      var timer = setInterval(function () {
        if (token !== TOKEN) {
          clearInterval(timer);
          res(false);
          return;
        }
        if (i >= spans.length) {
          clearInterval(timer);
          res(true);
          return;
        }
        if (fast) {
          while (i < spans.length) {
            spans[i].classList.add("on");
            i++;
          }
          return; // 下一 tick 走收尾分支
        }
        spans[i].classList.add("on");
        i++;
      }, perChar);
    });
  }

  /* ---------------------------------------------------------------------
	   构建 DOM
	   --------------------------------------------------------------------- */
  var idSeq = 0;

  function make(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function newScene() {
    var s = make("section", "scene");
    s.id = "sc" + ++idSeq;
    storyEl.appendChild(s);
    return s;
  }

  function build(sc) {
    var s, i;

    if (sc.kind === "greet") {
      s = newScene();
      var h1 = make("h1", "s-greet");
      var w1 = make("span", "s-word");
      w1.textContent = sc.hi || "";
      var w2 = make("span", "s-word");
      w2.textContent = sc.name || "";
      w2.style.setProperty("--d", "0.13s");
      h1.appendChild(w1);
      h1.appendChild(w2);
      s.appendChild(h1);
      if (sc.sub) {
        var sub = make("p", "s-sub");
        sub.textContent = sc.sub;
        s.appendChild(sub);
      }
    } else if (sc.kind === "big") {
      s = newScene();
      var p = make("p", "s-big");
      p.textContent = sc.text || "";
      s.appendChild(p);
    } else if (sc.kind === "para") {
      // 长信：卡纸 + 可滚动 + 逐字打出
      s = newScene();
      var card = make("div", "letter");
      var pa = make("p", "s-para");
      card.appendChild(pa);
      s.appendChild(card);
      if (sc.sign) {
        var sign = make("p", "letter-sign");
        sign.textContent = sc.sign;
        s.appendChild(sign);
      }
    } else if (sc.kind === "chat") {
      s = newScene();
      var box = make("div", "fakebox");
      var txt = make("p", "fakebox-text");
      var btn = make("p", "fake-btn");
      btn.textContent = sc.send || "发送";
      box.appendChild(txt);
      box.appendChild(btn);
      s.appendChild(box);
    } else if (sc.kind === "lines") {
      s = newScene();
      sc.els = [];
      for (i = 0; i < sc.lines.length; i++) {
        var line = make("p", "idea");
        line.innerHTML = sc.lines[i];
        s.appendChild(line);
        sc.els.push(line);
      }
    } else if (sc.kind === "so") {
      s = newScene();
      var h2 = make("h2", "s-so");
      for (i = 0; i < sc.chars.length; i++) {
        var c = make("span", "so-char");
        c.textContent = sc.chars[i];
        if (i > 0) c.style.setProperty("--d", (i * 0.1).toFixed(2) + "s");
        h2.appendChild(c);
      }
      s.appendChild(h2);
    } else if (sc.kind === "photo") {
      s = newScene();
      var wrap = make("div", "photo-wrap");
      var img = make("img", "photo");
      img.src = sc.photo || "img/photo.jpg";
      img.alt = "";
      wrap.appendChild(img);
      wrap.appendChild(make("i", "hat"));
      s.appendChild(wrap);

      var wh = make("h3", "wish-hbd");
      var wish = sc.wish || "生日快乐";
      for (i = 0; i < wish.length; i++) {
        var ch = make("span", "ch");
        ch.textContent = wish[i];
        ch.style.setProperty("--d", (0.45 + i * 0.09).toFixed(2) + "s");
        wh.appendChild(ch);
      }
      s.appendChild(wh);

      if (sc.sub) {
        var wsub = make("p", "wish-sub");
        wsub.textContent = sc.sub;
        s.appendChild(wsub);
      }
    }

    sc.el = s;
  }

  /* ---------------------------------------------------------------------
	   逐幕播放
	   --------------------------------------------------------------------- */
  // ---- 点击飘字：手法搬自 love/js/love.js ----
  // 每次点击在指针位置吐一个「符号+短语+符号」，往上飘、放大、淡出，颜色随机。
  var FLOAT_SYMBOLS = ["❤", "❤️", "💘", "💞", "💖", "🌹", "🌸", "💌", "🎈", "✨"];
  var FLOAT_WORDS = [
    "生日快乐",
    "今天你最大",
    "要一直开心",
    "岁岁平安",
    "万事顺意",
    "心想事成",
    "你笑起来真好看",
    "愿你被偏爱",
    "一直在",
    "慢慢来",
  ];
  var floatIdx = 0;
  var floatLive = 0;
  var storyRunning = true;

  function floatText(cx, cy) {
    if (!storyRunning || floatLive > 24) return;

    var sym = FLOAT_SYMBOLS[(Math.random() * FLOAT_SYMBOLS.length) | 0];
    var word = FLOAT_WORDS[floatIdx++ % FLOAT_WORDS.length];

    var el = document.createElement("b");
    el.onselectstart = function () {
      return false;
    };
    el.textContent = sym + word + sym;
    el.style.cssText =
      "position:fixed;left:0;top:0;z-index:200;pointer-events:none;" +
      "font-size:16px;line-height:1;white-space:nowrap;color:rgb(" +
      ((Math.random() * 255) | 0) +
      "," +
      ((Math.random() * 255) | 0) +
      "," +
      ((Math.random() * 255) | 0) +
      ")";
    document.body.appendChild(el);
    floatLive++;

    var x = cx,
      y = cy,
      a = 1,
      sc = 1.2;
    var t0 = performance.now();

    function step(now) {
      var dt = Math.min((now - t0) / 1000, 0.05);
      t0 = now;
      a -= dt * 1.05;
      sc += dt * 0.13;
      y -= dt * 62;
      if (a <= 0) {
        el.remove();
        floatLive--;
        return;
      }
      el.style.opacity = a;
      el.style.transform =
        "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%) scale(" + sc + ")";
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---- 推进：定时器到点 or 点一下，谁先来算谁 ----
  var tapEl = document.getElementById("tapHint");

  function showTapHint(on) {
    if (tapEl) tapEl.classList.toggle("on", !!on);
  }

  function raceAdvance(ms, token) {
    return new Promise(function (res) {
      var done = false;
      var timer = null;
      var hintTimer = null;

      function fin() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        clearTimeout(hintTimer);
        document.removeEventListener("pointerdown", onTap, true);
        showTapHint(false);
        res(token === TOKEN);
      }
      function onTap(e) {
        if (e.target && e.target.closest && e.target.closest(".bgm")) return;
        fin();
      }

      timer = setTimeout(fin, ms);
      hintTimer = setTimeout(
        function () {
          showTapHint(true);
        },
        Math.min(TAP_HINT_DELAY, ms),
      );
      document.addEventListener("pointerdown", onTap, true);
    });
  }

  // 一段的停留 = 先让进场动画播完，然后「自动到点」和「点击」竞速
  async function dwell(ms, token) {
    var total = ms * SPEED;
    if (!(await wait(Math.min(MIN_SETTLE, total), token))) return false;
    return await raceAdvance(Math.max(0, total - MIN_SETTLE), token);
  }

  function holdOf(sc) {
    return sc.hold || DEFAULT.hold;
  }
  function gapOf(sc) {
    return sc.gap || DEFAULT.gap;
  }

  // 长文本打字机：整段一次性铺开太贵，用 textContent 切片而不是逐字建 span。
  // 打字途中点一下 = 立刻写完全部；写完之后再点一下才是翻页（由 dwell 负责）。
  function typeLong(sc, token) {
    var node = sc.el.querySelector(".s-para");
    var card = sc.el.querySelector(".letter");
    var text = sc.text || "";
    var cps = sc.cps || LETTER_CPS; // 单幕可以覆盖全局速度
    node.textContent = "";
    node.classList.add("typing");

    var shown = 0;
    var t0 = performance.now();

    return new Promise(function (res) {
      var done = false;

      function unfollow() {
        document.removeEventListener("pointerdown", onTap, true);
        node.classList.remove("typing");
      }
      function toEnd() {
        if (card) card.scrollTop = card.scrollHeight;
      }
      function finish() {
        if (done) return;
        done = true;
        unfollow();
        node.textContent = text;
        toEnd();
        res(token === TOKEN);
      }
      function onTap(e) {
        if (e.target && e.target.closest && e.target.closest(".bgm")) return;
        finish(); // 点一下直接写完
      }
      function step(now) {
        if (token !== TOKEN) {
          done = true;
          unfollow();
          res(false);
          return;
        }
        if (done) return;
        var want = Math.floor(((now - t0) / 1000) * cps);
        if (want > shown) {
          shown = Math.min(want, text.length);
          node.textContent = text.slice(0, shown);
          toEnd();
        }
        if (shown >= text.length) {
          finish();
          return;
        }
        requestAnimationFrame(step);
      }

      document.addEventListener("pointerdown", onTap, true);
      requestAnimationFrame(step);
    });
  }

  async function playLine(el, ms, gp, token, keep) {
    el.classList.remove("leave");
    el.classList.add("show");
    if (!(await dwell(ms, token))) return false;
    if (keep) return true;
    el.classList.remove("show");
    el.classList.add("leave");
    return await wait(gp * SPEED, token);
  }

  async function playScene(sc, token) {
    enter(sc.el);
    var ok = true;

    if (sc.kind === "chat") {
      if (!(await wait(650 * SPEED, token))) return false;
      ok = await typeText(
        sc.el.querySelector(".fakebox-text"),
        sc.text || "",
        sc.typeSpeed || DEFAULT.typeSpeed,
        token,
      );
      if (!ok) return false;
      if (!(await wait(320 * SPEED, token))) return false;
      sc.el.querySelector(".fake-btn").classList.add("tapped");
      ok = await dwell(holdOf(sc), token);
    } else if (sc.kind === "lines") {
      if (!(await wait((sc.enterGap || DEFAULT.enterGap) * SPEED, token))) return false;
      for (var i = 0; i < sc.els.length; i++) {
        var keep = i === sc.els.length - 1;
        ok = await playLine(sc.els[i], holdOf(sc), gapOf(sc), token, keep);
        if (!ok) return false;
      }
    } else if (sc.kind === "para") {
      if (!(await wait(420 * SPEED, token))) return false;
      ok = await typeLong(sc, token);
      if (!ok) return false;
      ok = await dwell(holdOf(sc), token);
    } else {
      ok = await dwell(holdOf(sc), token);
    }

    if (!ok) return false;
    leave(sc.el);
    return await wait((sc.leaveGap || DEFAULT.leaveGap) * SPEED, token);
  }

  async function run() {
    var token = ++TOKEN;
    fast = false;

    for (var i = 0; i < SCENES.length; i++) {
      if (!(await playScene(SCENES[i], token))) return;
    }
    finish();
  }

  function finish() {
    TOKEN++;
    storyRunning = false;
    showTapHint(false);
    if (skipBtn) skipBtn.classList.remove("on");
    storyEl.style.transition = "opacity 0.9s ease";
    storyEl.style.opacity = "0";
    setTimeout(function () {
      storyEl.style.display = "none";
    }, 950);
    if (window.__bgmSwitch) window.__bgmSwitch(); // 轻音乐淡出，生日歌淡入
    if (window.__startShow) window.__startShow();
  }

  function boot() {
    for (var i = 0; i < SCENES.length; i++) build(SCENES[i]);

    if (skipBtn) {
      skipBtn.classList.add("on");
      skipBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        fast = true;
        if (pending) pending();
      });
    }

    // 叙事期间任何点击都飘字（♪ 按钮除外）
    document.addEventListener(
      "pointerdown",
      function (e) {
        if (e.target && e.target.closest && e.target.closest(".bgm")) return;
        floatText(e.clientX, e.clientY);
      },
      true,
    );

    var splash = document.getElementById("splash");
    var go = function () {
      splash.removeEventListener("pointerdown", go);
      splash.classList.add("gone");
      setTimeout(function () {
        splash.style.display = "none";
      }, 1000);
      // 轻触这一帧必须把两条音轨都「用掉」：轻音乐直接起，
      // 生日歌在 demo.js 里以 0 音量预热，切换时才不会被 iOS 拦
      if (window.__bgmStartStory) window.__bgmStartStory();
      run();
    };
    splash.addEventListener("pointerdown", go);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
