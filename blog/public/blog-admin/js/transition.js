function $(id){
	return document.getElementById(id);
}
var cont="System start...Over <br> Welcome sir []~(￣▽￣)~* <br> Entering the server......";
var i=0;
window.onload=function(){
	load();
}
function load(){
	var height=window.innerHeight;
	$('bg').style.cssText='height:'+height+'px';
	str=cont.substr(0,i);
	$('cont').innerHTML=str+"_";
	
	if(i<=cont.length){
		setTimeout('load()',50);
	}else if(i>cont.length){
		window.location.replace('index.html');
	}i++;
}