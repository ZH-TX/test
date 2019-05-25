//引入express模块
const express=require('express');
//引入连接池模块
const pool=require('../pool.js');
//创建空路由
var router=express();
//1.根据传递过来的type获取相关文章
router.get('/getWord',(req,res)=>{
	//接收传递过来的数据
	var currentPage=req.query.currentPage;
	if(!currentPage){
		currentPage=1;//设置默认页码
	}
	var pageSize=6;//设置每页显示的数目
	var type=req.query.type;//接收type  
	var start=(currentPage-1)*pageSize;//计算开始的下标
	var ary,total;
	//执行SQL语句
	pool.query('SELECT * FROM lmx_word WHERE family_id = ? ORDER BY w_id DESC LIMIT ?,?;SELECT COUNT(*) AS total FROM lmx_word WHERE family_id = ?',[type,start,pageSize,type],(err,result)=>{
		if(err) throw err;
		ary=result[0];//接收文章列表
		total=result[1][0].total.toString();//接收文章总数
		var totalPage=Math.ceil(total/pageSize);//计算总页数
		var output={"total":total,"totalPage":totalPage,"data":ary};//拼接数据
		res.send(output);//发出响应
	})
});
//2.获取具体的文章
router.get('/w',(req,res)=>{
	var w_id=req.query.wid;//获取传递过来的文章id
	pool.query('SELECT * FROM lmx_word WHERE w_id=?;UPDATE lmx_word SET w_read = w_read+1 WHERE w_id = ?',[w_id,w_id],(err,result)=>{
		if(err) throw err;
		res.send(result[0]);
	});
});
//3.搜索含有关键词的文章
router.get('/search',(req,res)=>{
	//获取传递过来的页码
	var currentPage=req.query.currentPage;
	//获取传递过来的关键词
	var name=req.query.name;
	if(!currentPage){
	}
	var pageSize=6;
	var start=(currentPage-1)*pageSize;
	var ary,total;
	//查询所有含有该关键词的文章
	pool.query('SELECT * FROM lmx_word WHERE w_title LIKE ? ORDER BY w_date DESC LIMIT ?,?;SELECT COUNT(*) AS total FROM lmx_word WHERE w_title LIKE ?',['%'+name+'%',start,pageSize,'%'+name+'%'],(err,result)=>{
		if(err) throw err;
		ary=result[0];//接收相关文章列表
		total=result[1][0].total.toString();//接收相关文章总数
		var totalPage=Math.ceil(total/pageSize);//获取开始的下标
		var output={"total":total,"totalPage":totalPage,"data":ary};//拼接结果
		res.send(output);//响应数据
	});
});
//4.查询所有文章
router.get('/getWordList',(req,res)=>{
	//接收传递过来的数据
	var currentPage=req.query.currentPage;
	if(!currentPage){
		currentPage=1;//设置默认页码
	}
	var pageSize=15;//设置每页显示的数目
	var start=(currentPage-1)*pageSize;//计算开始的下标
	var ary,total;
	//执行SQL语句
	pool.query('SELECT * FROM lmx_word ORDER BY w_id DESC LIMIT ?,?;SELECT COUNT(*) AS total FROM lmx_word',[start,pageSize],(err,result)=>{
		if(err) throw err;
		ary=result[0];//接收文章列表
		total=result[1][0].total.toString();//接收文章总数
		var totalPage=Math.ceil(total/pageSize);//计算总页数
		var output={"total":total,"totalPage":totalPage,"data":ary};//拼接数据
		res.send(output);//发出响应
	})
});
//5.发布文章
router.post('/subWord',(req,res)=>{
	var msg=req.body;
	var today=new Date();//获取当前时间
	msg.w_date=`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;//拼接日期
	pool.query('INSERT INTO lmx_word SET ?',[msg],(err,result)=>{
		if(err) throw err;
		if(result.affectedRows>0){
			res.send('1');
		}else{
			res.send('0');
		}
	})
	
});
//6.修改文章
router.post('/updateWord',(req,res)=>{
	var w_id=req.body.w_id;
	var w_cont=req.body.w_cont;
	var w_title=req.body.w_title;
	var family_id=req.body.family_id;
	pool.query('UPDATE lmx_word SET w_cont=?,w_title=?,family_id=? WHERE w_id=?',[w_cont,w_title,family_id,w_id],(err,result)=>{
		if(err) throw err;
		if(result.affectedRows>0){
			res.send('1');
		}else{
			res.send('0');
		}
	})
});
//7.删除文章
router.get('/deleteWord',(req,res)=>{
	var w_id=req.query.w_id;
	pool.query('DELETE FROM lmx_word WHERE w_id=?',[w_id],(err,result)=>{
		if(err) throw err;
		if(result.affectedRows>0){
			res.send('1');
		}else{
			res.send('0');
		}
	})
});
module.exports=router;