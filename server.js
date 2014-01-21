var app=require('./config/app');
var http=require('http');
var url=require('url');
var mysql=require('mysql');
var redis=require('redis');

function onRquest(req,res){
	var _url=req.url;
	console.log("url:%s",_url);
	var pathName=url.parse(_url).pathname;
	console.log("pathname:%s",pathName);
	operateRedis();
	queryDb(res);
}

//查询数据
function queryDb(res){
	var con=mysql.createConnection(app.Config.mysql);
	con.query("SELECT * FROM user_table LIMIT 0,1",function(err,rows){
		if(!err){
			var uid=rows[0].user_id;
			var name=rows[0].user_name;
			var data = {'uid': uid, 'name': name};
			res.writeHead(200,{"content-type":"application/json"});
			res.write(JSON.stringify(data));
			res.end();
			con.destroy();
		}
		else{
			console.log("数据库连接异常,错误详情：%s",JSON.stringify(err));
		}
	});
}

//插入数据
function insertDb(){
	var con=mysql.createConnection(app.Config.mysql);
	con.query("INSERT INTO user_table (user_name,user_passwd) VALUES ('admin','admin')",function(err,rows){
		if(!err){
			console.log("插入数据成功!");
			con.destroy();
		}
		else{
			console.log("数据库连接异常,错误详情：%s",JSON.stringify(err));
		}
	});
}

//操作redis
function operateRedis(){
	var client=redis.createClient(app.Config.redis.port,app.Config.redis.host);
	client.on("error",function(err){
		console.log("Redis[" + client.host + ":" + client.port + " ]发生错误，错误详情： " + JSON.stringify(err));
		return false;
	})
	client.set("password","admin",redis.print);
	client.get("password", function(err, reply){  
        console.log(reply.toString());  
    });  
    client.quit(function (err, res) {
    	console.log("Exiting from quit command.");
    });
}


http.createServer(onRquest).listen(app.Config.port);
