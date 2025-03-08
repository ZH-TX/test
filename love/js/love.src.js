Flowtime.showProgress(true);
Flowtime.start();

// Flowtime.addEventListener("flowtimenavigation", onNavigation, false);

// function onNavigation(e) {
// 	if (e.progress == 2) {
// 		player.pause();
// 	}
// }


$(function () {

	$(".nojavascript").remove();
	setInterval(function () {
		$(".showtip").removeClass("showtip").hide().siblings("span").addClass("showtip").fadeIn();
	}, 5000);
	$("#write-submit").click(function () {
		var textArr = {};
		for (var i = 1; i < 79; i++) {
			textArr[i] = $("#text-" + i).text();
		}
		$(".write-ok").fadeIn();
		$("#text-href").focus();
		$("#back").click(function () {
			$(".write-ok").fadeOut();
		});
		$("#write-post").click(function () {
			var textHref = $("#text-href").text(),
				textMusic = $("#text-music").text();
			if (textHref.replace(/\s+/g, "") == "") {
				$("#write-url i").text("←不能为空").fadeIn();
				$("#text-href").focus();
				setTimeout(function () {
					$("#write-url i").fadeOut();
				}, 3000);
			} else if (!/^[\w\-]{3,30}$/.test(textHref)) {
				$("#write-url i").text("←格式不正确").fadeIn();
				$("#text-href").focus();
				setTimeout(function () {
					$("#write-url i").fadeOut();
				}, 3000);
			} else if (textMusic.replace(/\s+/g, "") == "") {
				$("#write-mp3 i").text("←不能为空").fadeIn();
				$("#text-music").focus();
				setTimeout(function () {
					$("#write-mp3 i").fadeOut();
				}, 3000);
			} else if (!/^(http|https):\/\/+([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?$/.test(textMusic)) {
				$("#write-mp3 i").text("←不允许的链接").fadeIn();
				$("#text-music").focus();
				setTimeout(function () {
					$("#write-mp3 i").fadeOut();
				}, 3000);
			} else {
				$("#back").html('<img src="img/loading.gif" alt="loading">');
				$("#write-post").text("页面生成中...").attr("disabled", true).addClass("disabled");
				$.post("love.php?add", {
						textHref: textHref,
						textMusic: textMusic,
						textArr: textArr
					},
					function (data) {
						if (data['status'] == 1) {
							$("#back").hide();
							$(".write-ok p").hide()
							$(".write-ok div button").hide();
							$(".write-ok div h2").hide().text("成功生成表❤白页面").fadeIn();
							$("#write-url").html('您的表白链接是：<a href="' + data['url'] + '" target="_blank">' + data['url'] + '</a>').fadeIn();
							$(".write-share").css("display", "inline-block").children("p").show();
						} else if (data['status'] == 0) {
							$("#write-url i").text(data['msg']).fadeIn();
							$("#text-href").focus();
							setTimeout(function () {
								$("#write-url i").fadeOut();
							}, 3000);
							$("#back").text("重新修改");
							$("#write-post").text("❤ 生成表白页面").attr("disabled", false).removeClass("disabled");
						}
					}, "json");
			}
		});
	});
	// var bgmMusic = document.getElementById("bgmMusic");
	// $("#on").click(function () {
	// 	bgmMusic.pause();
	// 	$("#on").hide(200);
	// 	$("#off").css({
	// 		"display": "inline-block"
	// 	}, 300);
	// });
	// $("#off").click(function () {
	// 	bgmMusic.play();
	// 	$("#off").hide(200);
	// 	$("#on").css({
	// 		"display": "inline-block"
	// 	}, 300);
	// });
	var sharetext = $("#text-75").text() + "love" + $("#text-76").text() + $("#text-77").text();
	sharedesc = $("#text-1").text() + $("#text-2").text() + $("#text-3").text() + $("#text-4").text() + $("#text-5").text() + $("#text-6").text() + $("#text-7").text() + $("#text-8").text() + "......",
		shareurl = $("#write-url u").eq(0).text();
})