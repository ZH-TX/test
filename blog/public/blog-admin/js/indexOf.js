//获取浏览器信息
var ua = navigator.userAgent;
var browser = 'Chrome';
//判断浏览器的Chrome内核版本
if (ua.indexOf('Chrome') != -1||ua.indexOf('iPhone')!=-1) {
	var i = ua.indexOf(browser);
	i = i + browser.length + 1;
	version = parseFloat(ua.slice(i, i + 3));
	//如果谷歌内核低于70，则使用oldIndex样式表
	if (version < 70||ua.indexOf('iPhone')!=-1) {
		var $link = document.createElement("link");
		$link.setAttribute("rel", "stylesheet");
		$link.setAttribute("type", "text/css");
		$link.setAttribute("href", "css/oldIndex.css");
		document.getElementsByTagName("head")[0].appendChild($link);
		console.log(`您当前浏览器暂不支持本样式,已为您加载${$link.getAttribute("href")}样式`);
	} else {
		//否则，使用index样式表
		var $link = document.createElement("link");
		$link.setAttribute("rel", "stylesheet");
		$link.setAttribute("type", "text/css");
		$link.setAttribute("href", "css/index.css");
		document.getElementsByTagName("head")[0].appendChild($link);
		console.log(`您当前浏览器支持本样式,已加载样式${$link.getAttribute("href")}`)
	}
} else {
	//非谷歌内核的使用index样式表
	var $link = document.createElement("link");
	$link.setAttribute("rel", "stylesheet");
	$link.setAttribute("type", "text/css");
	$link.setAttribute("href", "css/index.css");
	document.getElementsByTagName("head")[0].appendChild($link);
}
