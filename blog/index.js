//引入express模块
const express=require('express');
//引入body-parser
const bodyParser=require('body-parser');
//引入模块
const msgRouter=require('./routers/msgRouter.js');
const adminRouter=require('./routers/adminRouter.js');
const wordRouter=require('./routers/wordRouter.js');
//创建web服务器
var server=express();
//监听端口
server.listen(6688,()=>{
	console.log('启动了！！！');
});
//托管静态资源到public
server.use(express.static('public'));
//配置中间件
server.use(bodyParser.urlencoded({
	extended:false
}));
//挂载msg
server.use('/msg',msgRouter);
//挂载user
server.use('/admin',adminRouter);
//挂载word
server.use('/word',wordRouter);

