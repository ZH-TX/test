window.onload=function(){
	getWord();
}
function $(id) {
	return document.getElementById(id);
}
function createXhr() {
	var xhr = null;
	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		xhr = new ActiveXObject("Microsoft.XMLHttp");
	}
	return xhr;
}
function getWord(){
	var thiskey=location.search;
	var xhr = createXhr();
	xhr.open('get','/word/w'+thiskey,true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4&&xhr.status==200){
			var res=JSON.parse(xhr.responseText);
			$('cont').innerHTML='<p>'+res[0].w_cont+'</p>';
			$('cont').innerHTML+='<hr style="margin:20px 0"><p align="right"><a href="msg.html">&gt;留下我的脚印&lt;</a></p>';
			$('cont').innerHTML+='<p align="right"><a href="index.html">&gt;返回首页&lt;</a></p>';
			$('c_title').innerHTML=res[0].w_title;
			document.title=res[0].w_title+"|LMX的私密小屋";
			$('wed').innerHTML='<div id="cont_date"><span id="cont_read"> '+res[0].w_read+' </span>阅读 作者：LingMX 发布时间：'+res[0].w_date+'</div>';
		}
	}
	xhr.send(null);
}
