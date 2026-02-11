(function () {
  var a_idx = 0;
  window.onclick = function (event) {
    var arr = new Array(
      "刘娇",
      "可爱",
      "又漂亮",
      "喜欢你",
      "陪你",
      "一起",
      "共度",
      "余生",
      "文静又有点小怂",
      "刘娇",
      "你是那天上的明月",
      "是会发光的星星",
      "你好似一首诗",
      "朦胧",
      "又迷人",
      "你好似一本书",
      "我想一直放在身边",
      "期待下一轮的春夏秋冬与你",
      "执子之手",
      "与子偕老",
      "一起经历更多的美好时光",
      "岁月静好，安暖相伴，不早不晚，刚好是你",
      "手机向下滑动,或者键盘按↓, 继续查看哦~~",
      "手机向下滑动,或者键盘按↓, 继续查看哦~~"
    );
    let strGraph = "❤";
    const graphArr = ["❤", "❤️ ", "💘", "💞", "💖", "🌹", "🌸", "💌", "🎈", "✨"];
    let num = Math.floor(Math.random() * graphArr.length);
    strGraph = graphArr[num];

    var heart = document.createElement("b");
    heart.onselectstart = new Function("event.returnValue=false");

    document.body.appendChild(heart).innerHTML = strGraph + arr[a_idx] + strGraph;
    a_idx = (a_idx + 1) % arr.length;
    heart.style.cssText = "position: fixed;left:-100%;";

    var f = 16,
      x = event.clientX - f / 2,
      y = event.clientY - f,
      c = randomColor(),
      a = 2,
      s = 1.2;

    var timer = setInterval(function () {
      if (a <= 0) {
        if (a_idx === arr.length - 1) {
        }
        document.body.removeChild(heart);
        clearInterval(timer);
      } else {
        heart.style.cssText =
          "font-size:16px;cursor: default;position: fixed;color:" +
          c +
          ";left:" +
          x +
          "px;top:" +
          y +
          "px;opacity:" +
          a +
          ";transform:scale(" +
          s +
          ");";

        y--;
        a -= 0.016;
        s += 0.002;
      }
    }, 15);
  };
  function randomColor() {
    return (
      "rgb(" +
      ~~(Math.random() * 255) +
      "," +
      ~~(Math.random() * 255) +
      "," +
      ~~(Math.random() * 255) +
      ")"
    );
  }

  Flowtime.showProgress(true);
  Flowtime.start();
})();

(function () {
  var AUTOPLAY_KEY = "love_autoplay_mode";
  var PAGE_TIMES_KEY = "love_page_times";
  var THRESHOLD = 3;
  var TIME_WINDOW = 10000;
  var autoPlayInterval = null;
  var autoPlayEnabled = sessionStorage.getItem(AUTOPLAY_KEY) === "true";
  var currentPageIndex = null;

  /**
   * 记录翻页操作（仅在页面真正切换时）
   * 避免屏幕缩放等非翻页操作触发弹窗
   */
  function recordPageTurn() {
    if (autoPlayEnabled) return;

    // 获取当前页面索引
    var newPageIndex = getCurrentPageIndex();

    // 如果页面没有变化，说明只是重渲染（如缩放），不记录
    if (currentPageIndex === newPageIndex && currentPageIndex !== null) {
      return;
    }

    currentPageIndex = newPageIndex;

    var now = Date.now();
    var times = JSON.parse(sessionStorage.getItem(PAGE_TIMES_KEY) || "[]");

    times = times.filter(function (t) {
      return now - t < TIME_WINDOW;
    });
    times.push(now);
    sessionStorage.setItem(PAGE_TIMES_KEY, JSON.stringify(times));

    if (times.length >= THRESHOLD) {
      showAutoPlayPrompt();
    }
  }

  /**
   * 获取当前激活页面的索引
   */
  function getCurrentPageIndex() {
    var actualPage = document.querySelector(".ft-page.actual");
    if (actualPage) {
      var allPages = document.querySelectorAll(".ft-page");
      for (var i = 0; i < allPages.length; i++) {
        if (allPages[i] === actualPage) {
          return i;
        }
      }
    }
    return null;
  }

  function showAutoPlayPrompt() {
    sessionStorage.removeItem(PAGE_TIMES_KEY);

    if (document.getElementById("autoplay-prompt")) return;

    var overlay = document.createElement("div");
    overlay.id = "autoplay-prompt";
    overlay.innerHTML = [
      '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;">',
      '  <div style="background:linear-gradient(135deg,#ff6b9d,#c44569);border-radius:16px;padding:30px 40px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.3);max-width:320px;">',
      '    <div style="font-size:48px;margin-bottom:16px;">💕</div>',
      '    <p style="color:#fff;font-size:18px;margin-bottom:24px;font-family:inherit;">检测到你翻页很勤快~<br>要开启自动播放模式吗？</p>',
      '    <button id="autoplay-yes" style="background:#fff;color:#ff6b9d;border:none;padding:12px 32px;border-radius:25px;font-size:16px;cursor:pointer;margin:0 8px;">开启</button>',
      '    <button id="autoplay-no" style="background:transparent;color:#fff;border:1px solid #fff;padding:12px 24px;border-radius:25px;font-size:16px;cursor:pointer;margin:0 8px;">不用了</button>',
      "  </div>",
      "</div>",
    ].join("");
    document.body.appendChild(overlay);

    document.getElementById("autoplay-yes").onclick = function () {
      enableAutoPlay();
      overlay.remove();
    };
    document.getElementById("autoplay-no").onclick = function () {
      overlay.remove();
    };
  }

  function enableAutoPlay() {
    autoPlayEnabled = true;
    sessionStorage.setItem(AUTOPLAY_KEY, "true");
    startAutoPlay();
  }

  function startAutoPlay() {
    if (autoPlayInterval) return;
    autoPlayInterval = setInterval(function () {
      if (typeof Flowtime !== "undefined" && Flowtime.next) {
        Flowtime.next();
      }
    }, 4000);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  function onFlowtimeNavigate() {
    recordPageTurn();
  }

  if (typeof Flowtime !== "undefined") {
    Flowtime.addEventListener("ftdomloaded", function () {
      document.addEventListener("flowtimenavigation", onFlowtimeNavigate);
    });
  }

  document.addEventListener("flowtimenavigation", onFlowtimeNavigate);

  if (autoPlayEnabled) {
    startAutoPlay();
  }

  window.toggleAutoPlay = function () {
    if (autoPlayEnabled) {
      stopAutoPlay();
      autoPlayEnabled = false;
      sessionStorage.removeItem(AUTOPLAY_KEY);
    } else {
      enableAutoPlay();
    }
  };
})();

(function () {
  var photoContainer = null;
  var animationId = null;
  var angle = 0;
  var centerX, centerY, radiusX, radiusY;

  function createPhotoElement() {
    if (photoContainer) return;

    var container = document.createElement("div");
    container.id = "overview-photo-effect";
    container.innerHTML = [
      '<div class="orbit-heart" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9998;pointer-events:none;">',
      '  <svg viewBox="0 0 100 90" style="width:300px;height:270px;opacity:0.6;">',
      '    <path d="M50 88 C20 60 0 35 10 20 C20 5 35 5 50 25 C65 5 80 5 90 20 C100 35 80 60 50 88Z" fill="none" stroke="rgba(255,107,157,0.8)" stroke-width="1.5"/>',
      "  </svg>",
      '  <div class="orbiting-photo" style="position:absolute;width:60px;height:60px;border-radius:50%;overflow:hidden;box-shadow:0 0 20px rgba(255,107,157,0.8),0 0 40px rgba(255,107,157,0.4);border:3px solid #ff6b9d;">',
      '    <img src="img/jiao/03.jpg" style="width:100px;clip-path: circle(100% at 33% 10%);;" draggable="false"/>',
      "  </div>",
      '  <div class="heart-center" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:32px;">❤️</div>',
      "</div>",
    ].join("");
    document.body.appendChild(container);
    photoContainer = container;

    centerX = 150;
    centerY = 135;
    radiusX = 120;
    radiusY = 100;
  }

  function animate() {
    if (!photoContainer || !document.body.classList.contains("ft-overview")) {
      animationId = null;
      return;
    }

    angle += 0.012;

    var heartX = centerX + radiusX * Math.pow(Math.sin(angle), 3);
    var heartY =
      centerY -
      radiusY *
        (0.8125 * Math.cos(angle) -
          0.3125 * Math.cos(2 * angle) -
          0.125 * Math.cos(3 * angle) -
          0.0625 * Math.cos(4 * angle));

    var photo = photoContainer.querySelector(".orbiting-photo");
    var heartCenter = photoContainer.querySelector(".heart-center");

    if (photo) {
      photo.style.left = heartX + "px";
      photo.style.top = heartY + "px";
      photo.style.transform = "translate(-50%, -50%)";
    }

    if (heartCenter) {
      var scale = 1 + 0.1 * Math.sin(Date.now() / 500);
      heartCenter.style.transform = "translate(-50%,-50%) scale(" + scale + ")";
    }

    animationId = requestAnimationFrame(animate);
  }

  function checkOverview() {
    if (document.body.classList.contains("ft-overview")) {
      createPhotoElement();
      if (photoContainer) photoContainer.style.display = "block";
      if (!animationId) animate();
    } else {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      if (photoContainer) photoContainer.style.display = "none";
    }
  }
  setInterval(checkOverview, 1000);
})();
