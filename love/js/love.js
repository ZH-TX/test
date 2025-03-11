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
      // "有时候会生气你不理我,生气归生气，但是还是喜欢你"

    );
    let strGraph = '❤';
    const graphArr = ['❤', '❤️ ', '💘', '💞', '💖', '🌹', '🌸', '💌', '🎈', '✨']
    let num = Math.floor(Math.random() * graphArr.length)
    strGraph = graphArr[num]

    var heart = document.createElement("b"); //创建b元素
    heart.onselectstart = new Function('event.returnValue=false'); //防止拖动

    document.body.appendChild(heart).innerHTML = strGraph + arr[a_idx] + strGraph; //将b元素添加到页面上
    a_idx = (a_idx + 1) % arr.length;
    heart.style.cssText = "position: fixed;left:-100%;"; //给p元素设置样式

    var f = 16, // 字体大小
      x = event.clientX - f / 2, // 横坐标
      y = event.clientY - f, // 纵坐标
      c = randomColor(), // 随机颜色
      a = 2, // 透明度
      s = 1.2; // 放大缩小

    var timer = setInterval(function () { //添加定时器
      if (a <= 0) {
        if (a_idx === arr.length - 1) {
          //  TODO
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
  // 随机颜色
  function randomColor() {
    return "rgb(" + (~~(Math.random() * 255)) + "," + (~~(Math.random() * 255)) + "," + (~~(Math
      .random() * 255)) + ")";
  }
  // 等到最后一页在显示??section-9/page-4
  Flowtime.showProgress(true);
  Flowtime.start();
}());