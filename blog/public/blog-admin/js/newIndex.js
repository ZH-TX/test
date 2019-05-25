function addMenu(){
	if($('menu') == null){
		var html=`<div id="menu">
			<div class="menuCont">
				<ul>
					<li><img src="img/lingmx-logo.png"></li>
					<li><a href="javascript:changeCount(0)">后台主页</a></li>
					<li><a href="javascript:changeCount(-90)">新建文章</a></li>
					<li><a href="javascript:changeCount(-180)">编辑文章</a></li>
					<li><a href="javascript:changeCount(-270)">编辑留言</a></li>
					<li><a href="../index.html">返回博客</a></li>
				</ul>
			</div>
		</div>`
		document.body.innerHTML+=html;
	}
}