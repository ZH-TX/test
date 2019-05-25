//动态改变iframe高度
function changeFrameHight() {
	try {
		var a = window.frames[0].window.document.body.scrollHeight - 2;
		hIframe.style.height = a + "px";
		var b = window.frames[1].window.document.body.scrollHeight;
		hIframe2.style.height = b + "px";
	} catch (e) {;
	}
}
//当页面加载完成后执行的函数
(function() {
	setTimeout(() => {
		$('pl1').style.cssText = 'd: path("M 0 0 L 50 50 L 0 100");';
		$('pl2').style.cssText = 'd: path("M 0 100 L 50 50 L 0 33.3");';
		$('pl3').style.cssText = 'd: path("M 0 100 L 50 50 L 0 66.6");';
		$('pr1').style.cssText = 'd: path("M 100 0 L 50 50 L 100 100");';
		$('pr2').style.cssText = 'd: path("M 100 100 L 50 50 L 100 33.3");';
		$('pr3').style.cssText = 'd: path("M 100 100 L 50 50 L 100 66.6");';
	}, 100)
	changeHight();
})();
//当窗口大小改变时
window.onresize = function() {
	changeFrameHight();
	addLeftMenu(); //添加小屏时左侧菜单
	addMenu(); //添加大屏时右侧菜单
	changeHight(); //设置header的高度
}
//动态设置header的高度
function changeHight() {
	$("header").style.height = $("header").children[0].scrollHeight + "px";
}
//创建搜索窗口
if ($('search') == null) {
	var searchObj = document.body;
	var html = "";
	html += "<div id='search' onclick='offSearch()'>";
	html +=
		'<div id="search_cont"><input type="text" id="seatch_ipt" placeholder="请输入关键词"><img src="img/search.png" width="30px" onclick="searchWord(delHtmlTab(seatch_ipt.value),1)"></div>';
	html += "</div>";
	searchObj.innerHTML += html;
}
//创建登录窗口
if ($('loadIn') == null) {
	var html = "";
	html += "<div id='loadIn'>";
	html +=
		'<div id="load_form"><div><img src="img/off.png" onclick="offload()"></div><h3>管理员登录</h3><input type="text" id="a_name" placeholder="名称"><input type="password" id="a_pwd" placeholder="密码"><br><span id="showLoad"></span><input type="button" class="form_btn" onclick="loadin()" value="> System Start <" /></div>';
	html += "</div>";
	searchObj.innerHTML += html;
}
//创建菜单侧边栏
function addMenu() {
	if ($('menu') == null) {
		var html =
			`<div id="menu">
			<div class="menuCont">
				<ul>
					<li><img src="img/lingmx-logo.png"></li>
					<li><a href="index.html">首页</a></li>
					<li><a href="web.html?ojbk1">Web前端</a></li>
					<li><a href="web.html?ojbk2">闲文杂谈</a></li>
					<li><a href="web.html?ojbk3">否头笑谱</a></li>
					<li><a href="web.html?ojbk4">U3D记录</a></li>
					<li><a href="msg.html">足迹</a></li>
					<li><a href="javascript:loadIn()"><img src="img/admin.png"> 登录</a></li>
				</ul>
			</div>
		</div>`
		searchObj.innerHTML += html;

	}
}
if (window.innerWidth < 991) {
	addMenu();
}
//创建返回顶部
function addLeftMenu() {
	if (window.innerWidth > 767) {
		if ($('zn') == null) {
			var html =
				`<audio src="music.mp3" preload id="music1" hidden loop></audio>
				<div id="zn">
			<img src="img/nav/qqq.png" id="musicImg" width="100">
			<ul id="zn_nav">
				<li title="首页">
					<a href="index.html"><img src="img/nav/home.png" alt="首页"></a>
				</li>
				<li title="web前端">
					<a href="web.html?ojbk1"><img src="img/nav/www.png" alt="web前端"></a>
				</li>
				<li title="闲文杂谈">
					<a href="web.html?ojbk2"><img src="img/nav/leisure.png" alt="闲文杂谈"></a>
				</li>
				<li title="否头笑谱">
					<a href="web.html?ojbk3"><img src="img/nav/Ps.png" alt="否头笑谱"></a>
				</li>
				<li title="U3D记录">
					<a href="web.html?ojbk4"><img src="img/nav/unity.png" alt="U3D记录"></a>
				</li>
				<li title="足迹">
					<a href="msg.html"><img src="img/nav/talk.png" alt="足迹"></a>
				</li>
				<li title="音乐"><img src="img/nav/music.png" alt="音乐"></li>
			</ul>
			<div id="InfoMsg">
				<span>00:00/00:00</span><br>
				<span></span>
			</div>
		</div>`;
			searchObj.innerHTML += html;
		}
	} else {
		if ($('zn') != null) {
			searchObj.removeChild(zn);
		}
	}
}
addLeftMenu();

var musicImg = document.getElementById('musicImg'); //获取图片对象
var musicObj = document.getElementById('music1'); //获取audio媒体对象
musicObj.volume = '0.5';
var InfoObj = document.getElementById('InfoMsg');
var nav = document.getElementById('zn_nav');
var playBtn = nav.children[nav.children.length - 1];
var navSwitch = false;
musicImg.onclick = function() {
	if (!navSwitch) {
		nav.style.display = 'block';

		navSwitch = true;
	} else {
		nav.style.display = 'none';

		navSwitch = false;
	}

}
playBtn.onclick = function() {
	//判断musicObj对象是否存在
	if (musicObj !== null) {
		var t = setInterval(() => {
			InfoMsg.children[0].innerHTML = addTime();
		}, 1000)
		//判断播放是否已暂停 paused 在播放器播放的时候返回false
		if (musicObj.paused) { //如果已暂停
			musicObj.play(); //播放
			this.classList.add('active');
			musicImg.src = 'img/nav/qq2q.gif';
			InfoObj.style.display = 'block';
			setTimeout(() => {
				InfoObj.style.opacity = '1';
			}, 100);

			setInterval(t);
		} else { //否则
			musicObj.pause(); //暂停播放
			this.classList.remove('active');
			musicImg.src = 'img/nav/qqq.png';
			InfoObj.style.opacity = '0';
			setTimeout(() => {
				InfoObj.style.display = 'none';
			}, 500);
			clearInterval(t);
		}
	}
}

function addTime() {
	var allTime = parseInt(musicObj.duration);
	var nowTime = parseInt(musicObj.currentTime);
	var allMid = parseInt((musicObj.duration - musicObj.duration % 60) / 60);
	if (allMid < 10) {
		allMid = "0" + allMid
	}
	var nowMid = parseInt((musicObj.currentTime - musicObj.currentTime % 60) / 60);
	if (nowMid < 10) {
		nowMid = "0" + nowMid
	}
	var allSec = parseInt(musicObj.duration % 60);
	if (allSec < 10) {
		allSec = "0" + allSec
	}
	var nowSec = parseInt(musicObj.currentTime % 60);
	if (nowSec < 10) {
		nowSec = "0" + nowSec
	}
	return `${nowMid}:${nowSec}/${allMid}:${allSec}`;
}
// 同步显示歌词
var str =
	"00:00,苏幕遮;00:01,作词 : 边疆 作曲 : 金志文;00:20,薄汗轻衣点缀这泼墨画山水;00:23,慵整纤纤手叫洛阳纸贵;00:27,可怜落花叩玉枕 拂袖人还昏睡;00:35,清风微寒惹一厢粉黛又愁眉;00:39,对镜梳妆探听人声鼎沸;00:43,多情自是多沾惹;00:47,梦断不成归 几分憔悴;00:51,锦瑟无端声悔 赢得满行泪;00:54,直道君心不美 日夜东流水;01:00,思悠悠 恨悠悠 何时方始休 半江信半江愁;01:07,觥筹恍惚交杯 劝留几小辈;01:11,棋逢红颜一醉 千军万马退;01:16,剪不断 理还乱 哽咽锁清喉 饮曲肝肠碎;01:28,清风微寒惹一厢粉黛又愁眉;01:31,对镜梳妆探听人声鼎沸;01:35,多情自是多沾惹 浓香吹尽为谁;01:39,梦断不成归 几分憔悴;01:44,;01:44,秋色连波波上寒烟翠 山映斜阳天接水;01:50,芳草无情 更在斜阳外;01:59,夜夜好梦留人睡 楼高休独倚;02:08,酒入谁人愁肠 化作相思泪;02:19,锦瑟无端声悔 赢得满行泪;02:22,直道君心不美 日夜东流水;02:27,思悠悠 恨悠悠 何时方始休 半江信半江愁;02:35,觥筹恍惚交杯 劝留几小辈;02:38,棋逢红颜一醉 千军万马退;02:43,剪不断 理还乱 哽咽锁清喉 饮曲肝肠碎;02:56,;03:18,";
var gcLrc = str.split(";");
var sj = 0;
setInterval(() => {
	var time = parseInt(musicObj.currentTime);
	var lrcmm = parseInt(gcLrc[sj].split(",")[0].split(":")[0]);
	var lrcss = parseInt(gcLrc[sj].split(",")[0].split(":")[1]);
	var nowTime = lrcmm * 60 + lrcss;
	if (time == nowTime) {
		var src = gcLrc[sj].split(",")[1];
		if (src.length < 1) {
			src = "♩♪♫♬♫♪♩"
		}
		InfoMsg.children[2].innerHTML = src;
		sj++;
		if (sj > 31) {
			sj = 0
		}
	}
}, 500)



function $(id) {
	return document.getElementById(id);
}
//返回顶部函数
function toTop() {
	(function smoothscroll() {
		var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
		if (currentScroll > 0) {
			window.requestAnimationFrame(smoothscroll);
			window.scrollTo(0, currentScroll - (currentScroll / 5));
		}
	})();
}
//登录弹出层
function loadIn() {
	var height = window.innerHeight;
	$('loadIn').style.cssText = 'height: ' + height + 'px;padding-top:' + height / 4 + 'px;';
	$('loadIn').style.cssText += "opacity: 1;";
	$('loadIn').onclick = function() {
		offload();
	}
	$('load_form').onclick = function() {
		window.event ? window.event.cancelBubble = true : e.stopPropagation();
	}
}
//关闭登录弹出层
function offload() {
	$('loadIn').style.cssText += "opacity: 0;";
	setTimeout(function() {
		$('loadIn').style.cssText = "height:0";
	}, 500);
}
//搜索弹出层
function search() {
	var height = window.innerHeight;
	$('search').style.cssText = 'height: ' + height + 'px;padding-top:' + height / 4 + 'px;';
	$('search').style.cssText += "opacity: 1;";
	$('seatch_ipt').focus();
	$("search_cont").onclick = function() {
		window.event ? window.event.cancelBubble = true : e.stopPropagation();
	}
}
//关闭搜索弹出层
function offSearch() {
	$('search').style.cssText += "opacity: 0;";
	setTimeout(function() {
		$('search').style.cssText = "height:0";
	}, 500);
	//清空搜索框
	$('seatch_ipt').value = '';
}
//弹出菜单栏
function menu() {
	$("menu").style.display = "block";
	setTimeout(() => {
		$("menu").children[0].style.left = "0px"
	}, 100);
	$("menu").addEventListener("click", function() {
		$("menu").children[0].style.left = "-12.5rem"
		setTimeout(() => {
			$("menu").style.display = "none"
		}, 500);
	})
}
//去除字符串中的尖括号
function delHtmlTag(str) {
	return str.replace(/<[^>]+>/g, "");
}

function delHtmlTab(str) {
	return str.replace(/\s+/, "");
}
//搜索含有关键词的文章
function searchWord(name, currentPage) {
	var xhr = new XMLHttpRequest();
	if (!name) {
		alert('请输入要查找的关键词');
		return;
	}
	xhr.open('get', '/word/search?name=' + name + '&currentPage=' + currentPage, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			$('content').innerHTML = '<div class="title"><h2>搜索：<span style="color:#f8962e;font-size:20px;line-height:30px">' +
				name + '</span> 的结果</h2><hr><p>共计：<span id="wed"></span>篇</p></div>';
			var res = JSON.parse(xhr.responseText);
			var data = res.data;
			//判断获取到的文章总数，如果大于0则添加到content中，否则返回搜索结果为0
			if (data.length > 0) {
				var search = '';
				for (var i = 0; i < data.length; i++) {
					var word = data[i];
					search += `<div class="cont_word p-2 w-100 mt-2">`;
					search += "<a class='cont_a' href='/word.html?wid=" + word.w_id + "' target='_blank'>" + isAuthor() + word.w_title +
						"</a>";
					search += "<p>" + delHtmlTag(word.w_cont).substr(0, 150) + "...</p>"
					search += '<div id="cont_date"><span id="cont_read"> ' + word.w_read + ' </span>阅读 作者：LingMX 发布时间：' + word.w_date +
						'</div>';
					search += "</div>"

					function isAuthor() {
						if (word.w_isAuthor == 1) {
							return '<span class="cont_y ml-2 mr-2">原</span>';
						} else {
							return '<span class="cont_y nomy ml-2 mr-2">转</span>';
						}
					}
				}
				$('cont').innerHTML = search;
				$('wed').innerHTML = res.total;
				var thekey = "'" + name + "'";
				$('cont').innerHTML += '<div id="page"></div>';
				var pageHTML = '';
				var page = res.totalPage;
				pageHTML = "<ul>"
				if (currentPage > 1) {
					pageHTML += '<li class="up" onclick="searchWord(' + thekey + ',' + (Number(currentPage) - 1) + ')">上一页</li>';
					pageHTML += '<li onclick="searchWord(' + thekey + ',' + (Number(currentPage) - 1) + ')">' + (Number(currentPage) -
						1) + '</li>';
				} else {
					pageHTML += '<li class="up" onclick="alert(\'已经是第一页了哦\')">上一页</li>';
				}
				pageHTML += '<li onclick="searchWord(' + thekey + ',' + currentPage + ')"class="active">' + currentPage + '</li>';
				if (currentPage < page) {
					pageHTML += '<li onclick="searchWord(' + thekey + ',' + (Number(currentPage) + 1) + ')">' + (Number(currentPage) +
						1) + '</li>';
					pageHTML += '<li class="down" onclick="searchWord(' + thekey + ',' + (Number(currentPage) + 1) + ')">下一页</li>';
				} else {
					pageHTML += '<li class="down" onclick="alert(\'已经是最后一页了哦\')">下一页</li>';
				}
				pageHTML += "</ul>";
				$('page').innerHTML = pageHTML;
				offSearch();
				if ($('form') != null) {
					$('form').innerHTML = "";
				}
			} else {
				$('cont').innerHTML = "<div class='cont_err p-2 w-100 mt-2'>Sorry,未查找到含有“<span>" + name +
					"</span>”的文章o(╥﹏╥)o</div>";
				$('wed').innerHTML = res.total;
				offSearch();
				if ($('form') != null) {
					$('form').innerHTML = "";
				}
			}
		}
	}
	xhr.send(null);
}

//用户登录
function loadin() {
	var xhr = new XMLHttpRequest();
	xhr.open('post', '/admin/login', true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var result = xhr.responseText;
			if (result == 1) {
				alert('登录成功！');
				window.location.replace("../blog-admin/transition.html");
			} else {
				showLoad.innerHTML = "用户名或密码错误！";
			}
		}
	}
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	var data = 'a_name=' + a_name.value + '&a_pwd=' + a_pwd.value;
	xhr.send(data);
}
//根据传递的值获取相关分类的文章列表
function getWord(currentPage, type) {
	var xhr = new XMLHttpRequest();
	xhr.open('get', '/word/getWord?currentPage=' + currentPage + '&type=' + type, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var res = JSON.parse(xhr.responseText);
			var data = res.data;
			var div = '';
			for (var i = 0; i < data.length; i++) {
				var word = data[i];
				div += `<div class="cont_word p-2 w-100 mt-2">`;
				div += "<a class='cont_a' href='/word.html?wid=" + word.w_id + "' target='_blank'>" + isAuthor() + word.w_title +
					"</a>";
				div += "<p>" + delHtmlTag(word.w_cont).substr(0, 100) + "...</p>";;
				div += '<div id="cont_date"><span id="cont_read"> ' + word.w_read + ' </span>阅读 作者：LingMX 发布时间：' + word.w_date +
					'</div>';
				div += "</div>";

				function isAuthor() {
					if (word.w_isAuthor == 1) {
						return '<span class="cont_y ml-2 mr-2">原</span>';
					} else {
						return '<span class="cont_y nomy ml-2 mr-2">转</span>';
					}
				}
			}
			$('cont').innerHTML = div;
			$('wed').innerHTML = res.total;
			$('cont').innerHTML += '<div id="page"></div>';
			var pageHTML = '';
			var page = res.totalPage;
			pageHTML = "<ul>"
			if (currentPage > 1) {
				pageHTML += "<li class='up' onclick='getWord(" + (Number(currentPage) - 1) + "," + type + ")'>上一页</li>";
				pageHTML += "<li onclick='getWord(" + (Number(currentPage) - 1) + "," + type + ")'>" + (Number(currentPage) - 1) +
					"</li>";
			} else {
				pageHTML += '<li class="up" onclick="alert(\'已经是第一页了哦\')">上一页</li>';
			}
			pageHTML += "<li onclick='getWord(" + currentPage + "," + type + ")' class='active'>" + currentPage + "</li>";
			if (currentPage < page) {
				pageHTML += "<li onclick='getWord(" + (Number(currentPage) + 1) + "," + type + ")'>" + (Number(currentPage) + 1) +
					"</li>";
				pageHTML += "<li class='down' onclick='getWord(" + (Number(currentPage) + 1) + "," + type + ")'>下一页</li>";
			} else {
				pageHTML += '<li class="down" onclick="alert(\'已经是最后一页了哦\')">下一页</li>';
			}
			pageHTML += "</ul>";
			$('page').innerHTML = pageHTML;
		}
	}
	xhr.send(null);
}
