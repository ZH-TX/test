function $(id){
	return document.getElementById(id);
}
window.onload=function(){
	getInfo();
	getWordList(1);
	getMsgList(1,15);
	addMenu();
	changeCount(0);
	$('pl1').style.cssText='d: path("M 0 0 L 50 50 L 0 100");';
	$('pl2').style.cssText='d: path("M 0 100 L 50 50 L 0 33.3");';
	$('pl3').style.cssText='d: path("M 0 100 L 50 50 L 0 66.6");';
	$('pr1').style.cssText='d: path("M 100 0 L 50 50 L 100 100");';
	$('pr2').style.cssText='d: path("M 100 100 L 50 50 L 100 33.3");';
	$('pr3').style.cssText='d: path("M 100 100 L 50 50 L 100 66.6");';
}
//导航栏方法
function changeCount(i){
	$('cont_list').style.cssText = 'transform: rotateY(' + i + 'deg);-ms-transform: rotateY(' + i + 'deg);-moz-transform: rotateY(' + i + 'deg);-webkit-transform: rotateY(' + i + 'deg);-o-transform: rotateY(' + i + 'deg);';
	$('cont_list').setAttribute("data-rotateY",i);
	if($('nwTitle').value){$('nwTitle').value=''; $('nwTitle').style.color='#797979';};
	if($('nwCont').value){$('nwCont').value='';};
	changeHeight();
}
window.onresize=changeHeight;
function changeHeight(){
	var thisHight=$('cont_list').getAttribute("data-rotateY");
	$("content").removeAttribute("style");
	switch (thisHight){
		case '0':
			$("content").style.height=$("cont1").offsetHeight+"px";
			break;
		case '-90':
			$("content").style.height=$("cont2").offsetHeight+"px";
			break;
		case '-180':
			$("content").style.height=$("cont3").offsetHeight+"px";
			break;
		case '-270':
			$("content").style.height=$("cont4").offsetHeight+"px";
			break;
	}
	
}

//弹出菜单栏
function menu(){
	$("menu").style.display="block";
	setTimeout(()=>{$("menu").children[0].style.left="0px"},100);
	$("menu").addEventListener("click",function(){
		$("menu").children[0].style.left="-12.5rem"
		setTimeout(()=>{$("menu").style.display="none"},500);
	})
}
//下面是内容区域方法
//后台首页获取数据方法
function getInfo(){
	var xhr=new XMLHttpRequest();
	xhr.open('get','/admin/getInfo',true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4&&xhr.status==200){
			var res=JSON.parse(xhr.responseText);
			$('todayMsg').innerHTML=res[0][0].todayMsg;
			$('msgGains').innerHTML=res[3][0].allMsg;
			$('todayWord').innerHTML=res[1][0].todayWord;
			$('wordGains').innerHTML=res[2][0].allWord;
			$('MsgCont1').innerHTML=res[4][0].m_cont+'<p align="right">——'+res[4][0].m_name+' '+res[4][0].m_date+'</p><hr>'+res[4][1].m_cont+'<p align="right">——'+res[4][1].m_name+'&nbsp;'+res[4][1].m_date+'</p>';
			$('MsgCont2').innerHTML=res[4][2].m_cont+'<p align="right">——'+res[4][2].m_name+' '+res[4][2].m_date+'</p><hr>'+res[4][3].m_cont+'<p align="right">——'+res[4][3].m_name+'&nbsp;'+res[4][3].m_date+'</p>';
			$('todayVisitor').innerHTML='1';
			$('visitorGains').innerHTML=res[6][0].sumRead;
			$('MsgCont1').style.cssText='display:block;opacity: 1;';
			$('MsgCont2').style.cssText='display:none;opacity: 0;';
			$('WordCont1').innerHTML=delHtmlTag(res[5][0].w_cont)+'<p align="right">——'+res[5][0].w_date+'</p>';
			$('WordCont2').innerHTML=delHtmlTag(res[5][1].w_cont)+'<p align="right">——'+res[5][1].w_date+'</p>';
			$('WordCont3').innerHTML=delHtmlTag(res[5][2].w_cont)+'<p align="right">——'+res[5][2].w_date+'</p>';
			$('WordCont4').innerHTML=delHtmlTag(res[5][3].w_cont)+'<p align="right">——'+res[5][3].w_date+'</p>';
			$('WordCont1').style.cssText='display:block;opacity: 1;';
			$('WordCont2').style.cssText='display:block;opacity: 1;';
			$('WordCont3').style.cssText='display:none;opacity: 0;';
			$('WordCont4').style.cssText='display:none;opacity: 0;';
			$("content").style.height=$("content").scrollHeight+"px";
		}
	}
	xhr.send(null);
}
//首页留言切换
function changeMsgInfo(){
	$('MsgCont1').style.opacity=changeOpa(MsgCont1);
	$('MsgCont2').style.opacity=changeOpa(MsgCont2);
	setTimeout(()=>{
		$('MsgCont1').style.display=changeMsg(MsgCont1);
		$('MsgCont2').style.display=changeMsg(MsgCont2);
	},500);
}
function changeWordInfo(){
	$('WordCont1').style.opacity=changeOpa(WordCont1);
	$('WordCont2').style.opacity=changeOpa(WordCont2);
	$('WordCont3').style.opacity=changeOpa(WordCont3);
	$('WordCont4').style.opacity=changeOpa(WordCont4);
	setTimeout(()=>{
		$('WordCont1').style.display=changeMsg(WordCont1);
		$('WordCont2').style.display=changeMsg(WordCont2);
		$('WordCont3').style.display=changeMsg(WordCont3);
		$('WordCont4').style.display=changeMsg(WordCont4);
	},500);
}
function changeMsg(id){
	var theStyle=id.style.display;
	return theStyle=='block' ? 'none' : 'block' ;
}
function changeOpa(id){
	var theOpa=id.style.opacity;
	return theOpa=='1' ? '0' : '1' ;
}
function delHtmlTag(str){
  return str.replace(/<[^>]+>/g,"");
}
//查看效果方法
function showCont(){
	var height = window.innerHeight;
	var wordBox= window.showFrame.document.getElementById("cont");
	var titleBox = window.showFrame.document.getElementById("c_title");
	var title=$('nwTitle').value;
	var word=$('nwCont').value;
	if(!title){title='效果展示页面'}
	wordBox.innerHTML=word;
	titleBox.innerHTML=title;
	$('showCont').style.cssText='display:block;';
	if(window.innerWidth<991){
		$('showCont').firstElementChild.style.width='100%';
	}
	$('showCont').style.cssText+='height:'+height+'px';
	setTimeout(()=>{$('showCont').style.cssText+='opacity:1;';},300);
}
//新建文章排版方法
function inputP(){
	$('nwCont').value+="<p></p>";//点击添加P标签
}
function inputBr(){
	$('nwCont').value+="<br>";//添加br标签
}
function inputStrong(){
	$('nwCont').value+="<strong></strong>";//添加strong标签
}
function inputHr(){
	$('nwCont').value+="<hr>";//添加hr标签
}
function inputUl(){
	$('nwCont').value+="<ul><li></li></ul>";//添加列表标签
}
function inputHx(i){
	$('nwCont').value+="<h"+i+"></h"+i+">";//点击添加标题标签
}
//隐藏效果显示
function offShowCont(){
	$('showCont').style.cssText+='opacity:0';
	setTimeout(()=>{$('showCont').style.cssText+='display:none';},500);
}
//提交新的文章
function subWord(){
	var w_title=$('nwTitle').value;
	if(!w_title){return};
	var family_id=$('nwClass').value;
	var w_cont=$('nwCont').value;
	var w_isAuthor=	$('isAuthor').checked ? '1' : '0';
	var xhr=new XMLHttpRequest();
	xhr.open('post','/word/subWord',true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4&&xhr.status==200){
			var res=xhr.responseText;
			if(res=='1'){
				alert('发布成功！');
				window.location.replace("index.html");
			}else{
				alert('发布失败...请联系管理员');
			}
		}
	}
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	var formdata='w_title='+w_title+'&family_id='+family_id+'&w_cont='+w_cont+'&w_isAuthor='+w_isAuthor;
	xhr.send(formdata);
}
//检查文章标题是否为空
function checkTitle(){
	if(!$('nwTitle').value){
		$('nwTitle').value='标题不能为空！';
		$('nwTitle').style.color='#ff0000';
	}
}
//文章标题提示
function titlePrompt(){
	if($('nwTitle').value=='标题不能为空！'){
		$('nwTitle').value='';
		$('nwTitle').style.color='#797979';
	}
}
//获取文章列表
function getWordList(currentPage) {
	var xhr = new XMLHttpRequest();
	xhr.open('get', '/word/getWordList?currentPage=' + currentPage, true);
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 && xhr.status == 200) {
			var res = JSON.parse(xhr.responseText);
			var data = res.data;
			var html = '';
			for(var i = 0; i < data.length; i++) {
				var word = data[i];
				html+='<tr><td width="40px">'+word.w_id+'</td><td>'+word.w_date+'</td><td>'+word.w_title+'</td><td>'+isAuthor()+'</td>';
				html+='<td><button class="btn btn-sm btn-success" onclick="updateWord('+word.w_id+')">修改</button><button class="btn btn-sm btn-danger" onclick="deleteWord('+word.w_id+')">删除</button></td></tr>'
				function isAuthor() {
					if(word.w_isAuthor == 1) {
						return '<span class="cont_y">原创</span>';
					} else {
						return '<span class="cont_y nomy">转载</span>';
					}
				}
			}
			$('listBody').innerHTML = html;
			var pageHTML = '';
			var page = res.totalPage;
			pageHTML = "<ul>"
			if(currentPage > 1) {
				pageHTML += "<li class='up' onclick='getWordList(" + (Number(currentPage) - 1)  + ")'>上一页</li>";
				pageHTML += "<li onclick='getWordList(" + (Number(currentPage) - 1)  + ")'>" + (Number(currentPage) - 1) + "</li>";
			} else {
				pageHTML += '<li class="up" onclick="alert(\'已经是第一页了哦\')">上一页</li>';
			}
			pageHTML += "<li onclick='getWordList(" + currentPage + ")' class='active'>" + currentPage + "</li>";
			if(currentPage < page) {
				pageHTML += "<li onclick='getWordList(" + (Number(currentPage) + 1)  + ")'>" + (Number(currentPage) + 1) + "</li>";
				pageHTML += "<li class='down' onclick='getWordList(" + (Number(currentPage) + 1)  + ")'>下一页</li>";
			} else {
				pageHTML += '<li class="down" onclick="alert(\'已经是最后一页了哦\')">下一页</li>';
			}
			pageHTML += "</ul>";
			$('listPage').innerHTML = pageHTML;
		}
	}
	xhr.send(null);
}
//删除文章
function deleteWord(id){
	if(confirm(`确认要删除 id为:${id} 的文章吗`)==true){
		var xhr=new XMLHttpRequest();
		xhr.open('get','/word/deleteWord?w_id='+id,true);
		xhr.onreadystatechange=function(){
			if(xhr.readyState==4&&xhr.status==200){
				var res=xhr.responseText;
				if(res=='1'){
					alert('删除成功!');
					getWordList(1);
				}else{
					alert('删除失败，请联系管理员');
				}
			}
		}
		xhr.send(null);
	}
}
//修改文章-显示修改界面
function updateWord(id){
	var xhr=new XMLHttpRequest();
	xhr.open('get','/word/w?wid='+id,true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4&&xhr.status==200){
			var res=JSON.parse(xhr.responseText);
			var height = window.innerHeight;
			$('updateWord').style.cssText="display:block;height:"+height+"px;";
			if(window.innerWidth<991){
				$("upWord").style.width="100%";
			}
			setTimeout(()=>{$('updateWord').style.cssText+="opacity:1;";},100);
			var i=res[0].family_id;
			var updateClass=$('upClass').getElementsByTagName('option')[i-1];
			updateClass.selected=true;
			$('upTitle').value=res[0].w_title;
			$('upCont').value=res[0].w_cont;
			$('wid').value=res[0].w_id;
		}
	}
	xhr.send(null);
}
//修改-检查文章标题是否为空
function checkUpTitle(){
	if(!$('upTitle').value){
		$('upTitle').value='标题不能为空！';
		$('upTitle').style.color='#ff0000';
	}
}
//修改-文章标题提示
function titleUpPrompt(){
	if($('upTitle').value=='标题不能为空！'){
		$('upTitle').value='';
		$('upTitle').style.color='#797979';
	}
}
//提交修改
function subupWord(){
	var w_id=$('wid').value;
	var family_id=$('upClass').value;
	var w_cont=$('upCont').value;
	var w_title=$('upTitle').value;
	var xhr=new XMLHttpRequest();
	xhr.open('post','/word/updateWord',true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4&&xhr.status==200){
			var res=xhr.responseText;
			if(res=='1'){
				alert('修改成功！');
				window.location.replace("index.html");
			}else{
				alert('修改失败...请联系管理员');
			}
		}
	}
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	var formdata='w_title='+w_title+'&family_id='+family_id+'&w_cont='+w_cont+'&w_id='+w_id;
	xhr.send(formdata);
}
//隐藏修改界面
function stopOffUpdate(){//阻止事件冒泡
	window.event ? window.event.cancelBubble = true : e.stopPropagation();
}
function offUpDateWord(){//隐藏界面 
	$('updateWord').style.opacity="0";
	$('updateWord').style.height="0";
	setTimeout(()=>{$('updateWord').style.cssText+="display:none;"},500);
	$('upCont').value='';
	$('upTitle').value='';
	$('upTitle').style.color='#797979';
}
//获取留言列表
function getMsgList(currentPage,pageSize) {
	var xhr = new XMLHttpRequest();
	xhr.open('get', '/msg/getMsg?currentPage=' + currentPage+'&pageSize='+pageSize, true);
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 && xhr.status == 200) {
			var res = JSON.parse(xhr.responseText);
			var data = res.data;
			var html = '';
			for(var i = 0; i < data.length; i++) {
				var msg = data[i];
				html+='<tr><td width="40px">'+msg.m_id+'</td><td>'+msg.m_date+'</td><td>'+msg.m_title+'</td><td>'+msg.m_name+'</td>';
				html+='<td><button class="btn btn-sm btn-success" onclick="replyMsg('+msg.m_id+')">回复</button><button class="btn btn-sm btn-danger" onclick="deleteMsg('+msg.m_id+')">删除</button></td></tr>'
			}
			$('msgBody').innerHTML = html;
			var pageHTML = '';
			var page = res.totalPage;
			pageHTML = "<ul>"
			if(currentPage > 1) {
				pageHTML += "<li class='up' onclick='getMsgList(" + (Number(currentPage) - 1) +','+pageSize + ")'>上一页</li>";
				pageHTML += "<li onclick='getMsgList(" + (Number(currentPage) - 1) +','+pageSize  + ")'>" + (Number(currentPage) - 1) + "</li>";
			} else {
				pageHTML += '<li class="up" onclick="alert(\'已经是第一页了哦\')">上一页</li>';
			}
			pageHTML += "<li onclick='getMsgList(" + currentPage+','+pageSize  + ")' class='active'>" + currentPage + "</li>";
			if(currentPage < page) {
				pageHTML += "<li onclick='getMsgList(" + (Number(currentPage) + 1) +','+pageSize  + ")'>" + (Number(currentPage) + 1) + "</li>";
				pageHTML += "<li class='down' onclick='getMsgList(" + (Number(currentPage) + 1)+','+pageSize  + ")'>下一页</li>";
			} else {
				pageHTML += '<li class="down" onclick="alert(\'已经是最后一页了哦\')">下一页</li>';
			}
			pageHTML += "</ul>";
			$('msgPage').innerHTML = pageHTML;
		}
	}
	xhr.send(null);
}
//回复留言-获取要回复的留言
function replyMsg(id){
	var xhr=new XMLHttpRequest();
	xhr.open('get','/msg/getThisMsg?m_id='+id,true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4&&xhr.status==200){
			var res=JSON.parse(xhr.responseText);
			var height = window.innerHeight;
			$('replyMsg').style.cssText="display:block;height:"+height+"px;";
			if(window.innerWidth<991){
				$("orgMsg").style.width="100%";
			}
			setTimeout(()=>{$('replyMsg').style.cssText+="opacity:1;";},100);
			$('msgName').innerHTML=res.m_name;
			$('msgTitle').innerHTML=res.m_title;
			$('msgCount').innerHTML=res.m_cont;
		}
	}
	xhr.send(null);
}
//回复留言-提交回复内容
function subReplyMsg(){
	var orgMsg='<blockquote>'+$('msgCount').innerHTML.substr(0,20)+'...</blockquote>';//原本留言内容
	var replyCount='<p>'+$('replyCount').value+'</p>';//回复的内容
	var m_cont=orgMsg+replyCount;//拼接成新的留言内容
	var m_title='回复：'+$('msgName').innerHTML;//回复的名称内容
	var m_name='LingMX';
	var xhr=new XMLHttpRequest();
	xhr.open('POST','/msg/subMsg',true);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4&&xhr.status==200){
			var res=xhr.responseText;
			if(res==1){
				alert('回复成功get~');
				window.location.replace("index.html");
			}else{
				alert('捕获失败，请联系管理员');
				window.location.replace("index.html");
			}
		}
	}
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	var formdata='m_name='+m_name+'&m_title='+m_title+'&m_cont='+m_cont;
	xhr.send(formdata);
}
//隐藏回复留言界面
function stopOffReply(){//阻止事件冒泡
	window.event ? window.event.cancelBubble = true : e.stopPropagation();
}
function offReply(){//隐藏界面 
	$('replyMsg').style.opacity="0";
	$('replyMsg').style.height="0";
	setTimeout(()=>{$('replyMsg').style.cssText+="display:none;"},500);
	$('replyCount').value='';
}
//删除留言
function deleteMsg(id){
	if(confirm(`确认要删除 id为:${id} 的留言吗`)==true){
		var xhr=new XMLHttpRequest();
		xhr.open('get','/msg/deleteMsg?m_id='+id,true);
		xhr.onreadystatechange=function(){
			if(xhr.readyState==4&&xhr.status==200){
				var res=xhr.responseText;
				if(res=='1'){
					alert('删除成功!');
					getMsgList(1,15);
				}else{
					alert('删除失败，请联系管理员');
				}
			}
		}
		xhr.send(null);
	}
}
