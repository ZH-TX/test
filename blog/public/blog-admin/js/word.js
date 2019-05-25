function $(id){
	return document.getElementById(id);
}
window.onload=function(){
	$('pl1').style.cssText='d: path("M 0 0 L 50 50 L 0 100");';
	$('pl2').style.cssText='d: path("M 0 100 L 50 50 L 0 33.3");';
	$('pl3').style.cssText='d: path("M 0 100 L 50 50 L 0 66.6");';
	$('pr1').style.cssText='d: path("M 100 0 L 50 50 L 100 100");';
	$('pr2').style.cssText='d: path("M 100 100 L 50 50 L 100 33.3");';
	$('pr3').style.cssText='d: path("M 100 100 L 50 50 L 100 66.6");';
}
