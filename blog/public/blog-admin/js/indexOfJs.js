//获取浏览器信息
var ua = navigator.userAgent;
var browser = 'Chrome';
//判断浏览器的Chrome内核版本
if (ua.indexOf('Chrome') != -1 ||ua.indexOf('iPhone')!=-1){
	var i = ua.indexOf(browser);
	i = i + browser.length + 1;
	version = parseFloat(ua.slice(i, i + 3));
	//如果谷歌内核低于70，则使用OldIdnex脚本
	if (version < 70 || ua.indexOf('iPhone')!=-1) {
		var navsObj=document.getElementById("nav_bir").getElementsByTagName('a');
		for(var i=0;i<navsObj.length-1;i++){
			navsObj[i].href=`javascript:changeNavList(${i})`;
		}
		var $script = document.createElement('script');
        $script.setAttribute("type", "text/javascript");
        $script.setAttribute("src", "js/oldIndex.js");
        document.getElementsByTagName("body").item(0).appendChild($script);
		console.log(`您当前浏览器暂不支持本样式,已为您加载${$script.getAttribute("src")}样式`);
	} else {
		//否则，使用newIndex脚本
		var $script = document.createElement('script');
		$script.setAttribute("type", "text/javascript");
		$script.setAttribute("src", "js/newIndex.js");
		document.getElementsByTagName("body").item(0).appendChild($script);
		console.log(`您当前浏览器支持本样式,已加载样式${$script.getAttribute("src")}`)
	}
} else {
	//非谷歌内核的使用newIndex脚本
	var $script = document.createElement('script');
	$script.setAttribute("type", "text/javascript");
	$script.setAttribute("src", "js/newIndex.js");
	document.getElementsByTagName("body").item(0).appendChild($script);
}
