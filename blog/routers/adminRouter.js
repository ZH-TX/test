//引入express模块
const express=require('express');
//引入连接池模块
const pool=require('../pool.js');
//创建空路由
var router=express.Router();
//1.管理员登录
router.post('/login',(req,res)=>{
	//获取用户名密码
	var obj=req.body;
	var aname=obj.a_name;
	var apwd=obj.a_pwd;
	//检查用户是否存在
	pool.query('SELECT * FROM lmx_admin WHERE a_name=? AND a_pwd=?',[aname,apwd],(err,result)=>{
		if(err) throw err;
		if(result.length>0){
			res.send('1');
		}else{
			res.send('0');
		}
	})
});
//获取最新数据
router.get('/getInfo',(req,res)=>{
	var today=new Date().toLocaleDateString();
	var sql='SELECT COUNT(*) AS todayMsg FROM lmx_msg WHERE m_date=? AND m_name !="LingMX";';//今日留言
	sql+='SELECT COUNT(*) AS todayWord FROM lmx_word WHERE w_date=?;';//今日文章
	sql+='SELECT COUNT(*) AS allWord FROM lmx_word;';//所有文章
	sql+='SELECT COUNT(*) AS allMsg FROM lmx_msg WHERE m_name !="LingMX";';//所有留言
	sql+='SELECT * FROM lmx_msg WHERE m_name !="LingMX" ORDER BY m_date DESC LIMIT 0,4;';//最新留言
	sql+='SELECT * FROM lmx_word ORDER BY w_date DESC LIMIT 0,4;';//最新文章
	sql+='SELECT SUM(w_read) AS sumRead FROM lmx_word';
	pool.query(sql,[today,today],(err,result)=>{
		if(err) throw err;
		res.send(result);
	});
});
module.exports=router;