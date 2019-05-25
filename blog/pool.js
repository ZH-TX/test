//创建连接池
const mysql=require('mysql');
//建立数据库连接
var pool=mysql.createPool({
	host:'127.0.0.1',
	port:'3306',
	user:'root',
	password:'',
	database:'lmx',
	connectionLimit:20,
	multipleStatements: true  //允许执行多条SQL语句
});
//导出连接池对象
module.exports=pool;