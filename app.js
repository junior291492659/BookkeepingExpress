let express = require("express");
let bodyParser = require("body-parser");
let router = require("./router/router");
// let fs = require("fs");

let app = express();

//设置跨域
app.all("*", function(req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization-Token");// header('Access-Control-Allow-Headers:x-requested-with,content-type,Authorization')
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

/// 配置解析表单 POST 请求体插件
//（注意：一定要在 app.use(router) 之前 ）
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//把路由挂载到app中
app.use(router);

app.listen(3000, () => {
  console.log("running, listenning port 3000s");
});
