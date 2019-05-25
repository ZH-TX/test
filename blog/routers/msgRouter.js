//引入express模块
const express=require('express');
//引入连接池模块
const pool = require('../pool.js')
//创建空路由器
var router=express.Router();
//1.获取留言
router.get('/getMsg',(req,res)=>{
	//获取传递过来的页码
	var currentPage=req.query.currentPage;
	if(!currentPage){
		currentPage=1;
	}
	currentPage=parseInt(currentPage);
	var pageSize=req.query.pageSize;
	if(!pageSize){
		pageSize=6;
	}
	pageSize=parseInt(pageSize);
	var start=(currentPage-1)*pageSize;
	var ary,total;
	//获取所有的留言
	pool.query('SELECT * FROM lmx_msg order by m_id desc limit  ?,?; SELECT COUNT(*) AS total FROM lmx_msg;',[start,pageSize],(err,result)=>{
		if(err) throw err;
		ary=result[0];//所有留言
		total=result[1][0].total.toString();//总页数
		var totalPage=Math.ceil(total/pageSize);//开始的下标
		var output={"total":total,"totalPage":totalPage,"data":ary};//拼接结果
		res.send(output);//返回结果
	})
});
//2.添加留言
router.post('/subMsg',(req,res)=>{
	var msg=req.body;
	var today=new Date();//获取当前时间
	msg.m_date=`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;//拼接日期
	pool.query('INSERT INTO lmx_msg SET ?',[msg],(err,result)=>{
		if(err) throw err;
		if(result.affectedRows>0){
			res.send('1');
		}else{
			res.send('0');
		}
	})
})
//3.回复留言
//3.1根据传递来的id获取留言
router.get('/getThisMsg',(req,res)=>{
	var m_id=req.query.m_id;
	pool.query('SELECT * FROM lmx_msg WHERE m_id=?',[m_id],(err,result)=>{
		if(err) throw err;
		res.send(result[0]);
	})
});
//4.删除留言
router.get('/deleteMsg',(req,res)=>{
	var m_id=req.query.m_id;
	pool.query('DELETE FROM lmx_msg WHERE m_id=?',[m_id],(err,result)=>{
		if(err) throw err;
		if(result.affectedRows>0){
			res.send('1');
		}else{
			res.send('0');
		}
	})
});
//导出路由器
module.exports=router;






