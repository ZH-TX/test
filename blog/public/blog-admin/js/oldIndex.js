function changeNavList(id){
	var contList=document.getElementById("cont_list").children;
	for(disClass of contList){
		disClass.style.display="none";
	}
	contList[id].style.display="block";
	$('cont_list').setAttribute("data-rotateY",id*-90);
	changeHeight();
}
function addMenu(){
	if($('menu') == null){
		var html=`<div id="menu">
			<div class="menuCont">
				<ul>
					<li><img src="img/lingmx-logo.png"></li>
					<li><a href="javascript:changeNavList(0)">后台主页</a></li>
					<li><a href="javascript:changeNavList(1)">新建文章</a></li>
					<li><a href="javascript:changeNavList(2)">编辑文章</a></li>
					<li><a href="javascript:changeNavList(3)">编辑留言</a></li>
					<li><a href="../index.html">返回博客</a></li>
				</ul>
			</div>
		</div>`
		document.body.innerHTML+=html;
	}
}