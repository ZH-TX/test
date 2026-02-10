(function () {
  var a_idx = 0;
  window.onclick = function (event) {
    var arr = new Array("刘娇", "可爱", "又漂亮", "喜欢你", "陪你", "一起", "共度", "余生",
      "文静又有点小怂", "刘娇", "你是那天上的明月", "是会发光的星星",
      "你好似一首诗",
      "朦胧", "又迷人",
      "你好似一本书",
      "我想一直放在身边",
      "期待下一轮的春夏秋冬与你",
      "执子之手", "与子偕老",
      "一起经历更多的美好时光",
      "岁月静好，安暖相伴，不早不晚，刚好是你",
      "手机向下滑动,或者键盘按↓, 继续查看哦~~",
      "手机向下滑动,或者键盘按↓, 继续查看哦~~"
    );
    let strGraph = '❤';
    const graphArr = ['❤', '❤️ ', '💘', '💞', '💖', '🌹', '🌸', '💌', '🎈', '✨']
    let num = Math.floor(Math.random() * graphArr.length)
    strGraph = graphArr[num]

    var heart = document.createElement("b");
    heart.onselectstart = new Function('event.returnValue=false');

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
        heart.style.cssText = "font-size:16px;cursor: default;position: fixed;color:" +
          c + ";left:" + x + "px;top:" + y + "px;opacity:" + a + ";transform:scale(" +
          s + ");";

        y--;
        a -= 0.016;
        s += 0.002;
      }
    }, 15)

  }
  function randomColor() {
    return "rgb(" + (~~(Math.random() * 255)) + "," + (~~(Math.random() * 255)) + "," + (~~(Math.random() * 255)) + ")";
  }
  
  Flowtime.showProgress(true);
  Flowtime.start();
})();

(function() {
  var AUTOPLAY_KEY = 'love_autoplay_mode';
  var PAGE_TIMES_KEY = 'love_page_times';
  var THRESHOLD = 3;
  var TIME_WINDOW = 10000;
  var autoPlayInterval = null;
  var autoPlayEnabled = sessionStorage.getItem(AUTOPLAY_KEY) === 'true';

  function recordPageTurn() {
    if (autoPlayEnabled) return;
    
    var now = Date.now();
    var times = JSON.parse(sessionStorage.getItem(PAGE_TIMES_KEY) || '[]');
    
    times = times.filter(function(t) { return now - t < TIME_WINDOW; });
    times.push(now);
    sessionStorage.setItem(PAGE_TIMES_KEY, JSON.stringify(times));
    
    if (times.length >= THRESHOLD) {
      showAutoPlayPrompt();
    }
  }

  function showAutoPlayPrompt() {
    sessionStorage.removeItem(PAGE_TIMES_KEY);
    
    if (document.getElementById('autoplay-prompt')) return;
    
    var overlay = document.createElement('div');
    overlay.id = 'autoplay-prompt';
    overlay.innerHTML = [
      '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;">',
      '  <div style="background:linear-gradient(135deg,#ff6b9d,#c44569);border-radius:16px;padding:30px 40px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.3);max-width:320px;">',
      '    <div style="font-size:48px;margin-bottom:16px;">💕</div>',
      '    <p style="color:#fff;font-size:18px;margin-bottom:24px;font-family:inherit;">检测到你翻页很勤快~<br>要开启自动播放模式吗？</p>',
      '    <button id="autoplay-yes" style="background:#fff;color:#ff6b9d;border:none;padding:12px 32px;border-radius:25px;font-size:16px;cursor:pointer;margin:0 8px;">开启</button>',
      '    <button id="autoplay-no" style="background:transparent;color:#fff;border:1px solid #fff;padding:12px 24px;border-radius:25px;font-size:16px;cursor:pointer;margin:0 8px;">不用了</button>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    document.getElementById('autoplay-yes').onclick = function() {
      enableAutoPlay();
      overlay.remove();
    };
    document.getElementById('autoplay-no').onclick = function() {
      overlay.remove();
    };
  }

  function enableAutoPlay() {
    autoPlayEnabled = true;
    sessionStorage.setItem(AUTOPLAY_KEY, 'true');
    startAutoPlay();
  }

  function startAutoPlay() {
    if (autoPlayInterval) return;
    autoPlayInterval = setInterval(function() {
      if (typeof Flowtime !== 'undefined' && Flowtime.next) {
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

  if (typeof Flowtime !== 'undefined') {
    Flowtime.addEventListener('ftdomloaded', function() {
      document.addEventListener('flowtimenavigation', onFlowtimeNavigate);
    });
  }

  document.addEventListener('flowtimenavigation', onFlowtimeNavigate);

  if (autoPlayEnabled) {
    startAutoPlay();
  }

  window.toggleAutoPlay = function() {
    if (autoPlayEnabled) {
      stopAutoPlay();
      autoPlayEnabled = false;
      sessionStorage.removeItem(AUTOPLAY_KEY);
    } else {
      enableAutoPlay();
    }
  };
})();