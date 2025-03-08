(function () {
  var a_idx = 0;
  window.onclick = function (event) {
    var a = new Array("❤刘娇❤", "❤可爱❤", "❤喜欢你❤", "❤陪你❤", "❤一起❤", "❤共度❤", "❤余生❤",
      "❤漂亮❤", "❤刘娇❤", "❤爱你❤", "❤执子之手❤", "❤与子偕老❤",
      "❤我什么情话都说不出来，我只想见你一面❤",
      "❤期待下一轮的春夏秋冬与你❤",
      "❤岁月静好，安暖相伴，不早不晚，刚好是你❤",
      // "有时候会生气你不理我,生气归生气，但是还是喜欢你"

    );

    var heart = document.createElement("b"); //创建b元素
    heart.onselectstart = new Function('event.returnValue=false'); //防止拖动

    document.body.appendChild(heart).innerHTML = a[a_idx]; //将b元素添加到页面上
    a_idx = (a_idx + 1) % a.length;
    heart.style.cssText = "position: fixed;left:-100%;"; //给p元素设置样式

    var f = 16, // 字体大小
      x = event.clientX - f / 2, // 横坐标
      y = event.clientY - f, // 纵坐标
      c = randomColor(), // 随机颜色
      a = 1, // 透明度
      s = 1.2; // 放大缩小

    var timer = setInterval(function () { //添加定时器
      if (a <= 0) {
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

  Flowtime.showProgress(true);
  Flowtime.start();
}());