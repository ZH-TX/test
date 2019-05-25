function $(id) {
	return document.getElementById(id);
}
//当网页加载完成后执行
(function(){
	getMsg(1)
})()
//ajax兼容代码
function createXhr() {
	var xhr = null;
	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		xhr = new ActiveXObject("Microsoft.XMLHttp");
	}
	return xhr;
}
//生成折叠留言按钮
function downmsg() {
	if($('downmsg').innerText=='折叠留言'){
		$('cont').style.height = '0';
		$('downmsg').innerHTML = "展开留言";
		$('upmsg').src = 'img/down.png';
	}else {
		var msgheight=$("cont").getAttribute("data-height");
		$('cont').style.height = `${msgheight}px`;
		$('downmsg').innerHTML = "折叠留言";
		$('upmsg').src = 'img/up.png';
	}
}
//随机生成头像
function touXiang(name) {
	if(name=='LingMX'){
		return 'img/lmx.jpg';
	}else{
		var number = Math.floor(Math.random() * 17);
		return 'img/touxiang' + number + '.jpg';
	}
	
}
//获取所有的留言
function getMsg(currentPage) {
	var xhr = createXhr();
	xhr.open('get', '/msg/getMsg?currentPage=' + currentPage, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var res = JSON.parse(xhr.responseText);
			var data = res.data;
			var div = '';
			//遍历数据并添加到div中
			for (var i = 0; i < data.length; i++) {
				var msg = data[i];
				div += `<div class="row r-0 msgbox mt-2">`;
					div += `<div class="col-2 left p-3 mt-3 mb-3 text-center">`;
						div += '<img src="' + touXiang(msg.m_name) + '">';
					div += '</div>';
					div += `<div class="col-10 msgcont">`;
						div += '<h4>' + msg.m_title +'<small>——'+msg.m_name + '</small></h4>';
						div += '<p class="pt-1 pb-1">'+msg.m_cont+'</p>';
						div += '<p><small>' + msg.m_date + '<a href="">回复</a>' + '</small></p>';
					div += '</div>';
				div += '</div>';
			}
			//把结果放到cont中
			$('cont').innerHTML = '<h3>' + res.total + '条留言' + '</h3>';
			$('cont').innerHTML += div;
			//添加分页
			$('cont').innerHTML += '<div id="page"></div>';
			var pageHTML = "";
			var page = res.totalPage;
			pageHTML = "<ul>";
			//判断页码，如果当前页码大于1则显示上一页，否则给出提示
			if (currentPage > 1) {
				pageHTML += "<li class='up' onclick='getMsg(" + (Number(currentPage) - 1) + ")'>上一页</li>";
				pageHTML += "<li onclick='getMsg(" + (Number(currentPage) - 1) + ")'>" + (Number(currentPage) - 1) + "</li>";
			}else{
				pageHTML += '<li class="up" onclick="alert(\'已经是第一页了哦\')">上一页</li>';
			}
			//添加页码按钮
			pageHTML += "<li onclick='getMsg(" + currentPage + ")' class='active'>" + currentPage + "</li>";
			//判断当前页码是否小鱼总页数，小与则添加下一页，否则给出提示
			if (currentPage < page) {
				pageHTML += "<li onclick='getMsg(" + (Number(currentPage) + 1) + ")'>" + (Number(currentPage) + 1) + "</li>";
				pageHTML += "<li class='down' onclick='getMsg(" + (Number(currentPage) + 1) + ")'>下一页</li>";
			}else{
				pageHTML += '<li class="up" onclick="alert(\'已经是最后一页了哦\')">下一页</li>';
			}
			pageHTML += "</ul>";
			$('page').innerHTML = pageHTML;
			$("cont").removeAttribute("style");
			var msgHeight=$("cont").clientHeight;
			$("cont").setAttribute("data-height",msgHeight);
			console.log(msgHeight);
			$('cont').style.height = `${msgHeight}px`;
		}
	}
	xhr.send(null);
}
//留言检查
//昵称为空处理
function nameCheck(){
	if(!$('u_name').value){
		$('u_name').value='昵称不能为空！';
		$('u_name').style.color='#ff0000';
	}else if($('u_name').value.length>16){
		alert('昵称过长');
		$('u_name').value='';
	}
}
function namePrompt(){
	if($('u_name').value=='昵称不能为空！'){
		$('u_name').value='';
		$('u_name').placeholder='昵称最长16个字符';
		$('u_name').style.color='#797979';
	}
}
//邮箱为空处理
function emailCheck(){
	if(!$('u_email').value){
		$('u_email').value='邮箱不能为空！';
		$('u_email').style.color='#ff0000';
	}else{
		var email=$('u_email').value;
		var i=email.indexOf('@');
		if(i<0){
			alert('邮箱格式不正确！');
		}
	}
}
function emailPrompt(){
	if($('u_email').value=='邮箱不能为空！'){
		$('u_email').value='';
		$('u_email').style.color='#797979';
	}
}
//标题为空处理
function titleCheck(){
	if(!$('m_title').value){
		$('m_title').value='标题不能为空！';
		$('m_title').style.color='#ff0000';
	}
}
function titlePrompt(){
	if($('m_title').value=='标题不能为空！'){
		$('m_title').value='';
		$('m_title').style.color='#797979';
	}
}
//内容为空处理
function contCheck(){
	if(!$('m_cont').value){
		$('m_cont').value='内容不能为空！';
		$('m_cont').style.color='#ff0000';
	}
}
function contPrompt(){
	if($('m_cont').value=='内容不能为空！'){
		$('m_cont').value='';
		$('m_cont').style.color='#797979';
	}
}
//提交留言
function subMsg(){
	//获取留言内容 
	var m_name=$('u_name').value;
	var m_email=$('u_email').value;
	var m_title=$('m_title').value;
	var m_cont='<p>'+$('m_cont').value+'</p>';
	//判断是否为空
	if(m_name=='昵称不能为空！'){
		return;
	}
	if(m_email=='邮箱不能为空！'){
		return;
	}else if(m_email.indexOf('@')<0){
		alert('邮箱格式不正确！');
		return;
	}
	if(m_title=='标题不能为空！'){
		return;
	}
	if(m_cont=='内容不能为空！'){
		return;
	}
	//提交留言数据
	var xhr=new XMLHttpRequest();
	xhr.open('post','/msg/subMsg',true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4&&xhr.status==200){
			var res=xhr.responseText;
			//分析返回过来的结果并给出响应
			if(res==1){
				alert('捕获成功get~');
				window.location.replace("msg.html");
			}else{
				alert('捕获失败，请联系管理员');
				window.location.replace("msg.html");
			}
		}
	}
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	var formdata = 'm_name=' + m_name + '&m_email=' + m_email+ '&m_title=' + m_title+ '&m_cont=' + m_cont;
	xhr.send(formdata);
}
