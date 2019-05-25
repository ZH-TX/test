window.onload=function(){
	setTimeout('seyHello()',500)
}; 
function $(id){
	return document.getElementById(id);
}
//打开首页时的弹出层
function seyHello(){
	if(window.innerWidth>767){
		var height=window.innerHeight;
		$('hello').style.cssText='height: '+height+'px;padding-top:'+height/3+'px;';
		if(newDate()<=5){
			$('hello').innerHTML='深夜了<p>'+jitang()+'</p>';
		}else if(newDate()<=8){
			$('hello').innerHTML='早上好，朋友<p>'+jitang()+'</p>';
		}else if(newDate()<=11){
			$('hello').innerHTML='上午好，朋友<p>'+jitang()+'</p>';
		}else if(newDate()<=14){
			$('hello').innerHTML='中午好，朋友<p>'+jitang()+'</p>';
		}else if(newDate()<=18){
			$('hello').innerHTML='下午好，朋友<p>'+jitang()+'</p>';
		}else if(newDate()<=22){
			$('hello').innerHTML='晚上好，朋友<p>'+jitang()+'</p>';
		}else if(newDate()<=23){
			$('hello').innerHTML='夜已深，记得早点睡觉，朋友';
		}
		setTimeout(()=>$('hello').style.cssText+="opacity: 1;",1000);
		setTimeout(()=>$('hello').style.cssText+="opacity: 0;",2500);
		setTimeout(()=>$('hello').style.cssText="display:none",3500);
	}
}
//获取当前的时间
function newDate(){
	var newDate=new Date();
	var hh=newDate.getHours();
	return hh;
}
//随机选择一句鸡汤
function jitang(){
	var arr=["有时候，人生中最艰难的事，反而锻造了最坚强的你","做什么事情的时候，一切跟随自己的心，但记得带上理智","宽恕无法改变过去，却能够改变未来","人生只有回不去的过去，没有过不去的当下","即使能力有限，也不要忘记有梦想的自己","你只有接受了过去和现在的模样，才会有能量去追寻自己的未来","如果你一直去追寻昨天的问题，那你也会错过明天的答案","无论我此时是如何的彷徨迷茫，最终，我都要过上自己想要的生活","人生就像一杯茶，不会苦一辈子，但总会苦一阵子","你坚持下来了，而别人坚持不下来，这就是你的资本","君子的力量永远是行动的力量，而不是语言的力量","生活就像是一盘巧克力，你永远不知道会碰到什么味道","世界上最远的距离，不是爱，不是恨，而是熟悉的人，渐渐变得陌生","能救你脱出苦海的只有你自己。让自己变得更好，才是唯一的出路","有多少人以友谊的名义，爱着一个人，认为拥有，就是失去的开始","身健如山，心静似水，淡泊名利。这是人生的最高境界，谁能活得如此境界，谁的一生就活得自在"];
	var number=Math.floor(Math.random()*arr.length);
	return(arr[number]);
}