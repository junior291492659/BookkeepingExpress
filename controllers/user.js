let User = require("../models/user");
let jwt = require("jsonwebtoken"); //用来生成token
let expenseController = require("./expense")

let userController = {};

// 注册
userController.register = (req, res, value) => {
  // value: req.body
  return User.findOne({ username: value.username }, (err, data) => {
    if (err) {
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误"
      });
    }

    console.log("in User findOne");

    // return res.status(401).json({
    //   errCode: 4001,
    //   message: "服务器错误"
    // });

    if (data) {
      // 用户名已经存在
      return res.status(200).json({
        errCode: 200,
        message: "用户名已经存在"
      });
    }

    new User(value)
      .save()
      .then(success => {
        console.log("存储成功");
        //生成token
        let token = createToken(value); 

        //生成相应的数据表格
        expenseController.createExpensesCollection(value.username)
        return res.status(200).json({
          errCode: 0,
          message: "注册成功",
          "Authentication-Token": token
        });
      })
      .catch(error => {
        console.log("服务器错误");
        return res.status(500).json({
          errCode: 500,
          message: "Internal error."
        });
      });
  });
};

// 登录
userController.login = (req, res) => {
  console.log("in login part");
  User.findOne({
    username: req.body.username,
    password: req.body.password
  })
    .then(data => {
      if (data) {
        let token = createToken(data); //生成token
        return res.status(200).json({
          errCode: 0,
          message: "登录成功",
          "Authentication-Token": token
        });
      } else {
        return res.status(200).json({
          errCode: 400,
          message: "用户名或密码不正确"
        });
      }
    })
    .catch(err => {
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误"
      });
    });
};

// 检测是否登录
userController.checkLogin = (req, res) => {
  console.log("in check login part");
  let decodeRes = verifyToken(req, res);
  if (decodeRes) {
    console.log("token 验证成功了");
    res.status(200).json({
      errCode: 0,
      message: "获取数据成功",
      data: { date: "2020-3-6" }
    });
  }
};

userController.getData = function(req, res, value) {
  let decodeRes = verifyToken(req, res);
  if (decodeRes) {
    console.log("token 验证成功了");
    res.status(200).json({
      errCode: 0,
      message: "获取数据成功",
      data: { date: "2020-3-5" }
    });
  }
};

let createToken = function(body) {
  console.log("in create token");
  let content = { username: body.username, password: body.password }; // 要生成token的主题信息
  let secretOrPrivateKey = "jwt_junior"; // 这是加密的key（密钥）
  let token = jwt.sign(content, secretOrPrivateKey, {
    expiresIn: 60 * 60 * 1 //60 * 60 * 1 // 1小时过期
  });

  return token;
};

let verifyToken = function(req, res) {
  let token = req.get("Authorization-Token"); // 从Authorization中获取token
  let secretOrPrivateKey = "jwt_junior"; // 这是加密的key（密钥）
  console.log("正在验证");
  return jwt.verify(token, secretOrPrivateKey, (err, decode) => {
    if (err) {
      //  时间失效的时候 || 伪造的token
      console.log("验证失败");
      res.status(200).json({
        //直接返回响应
        errCode: 100,
        message: "无效的token或者token已过期"
      });
    }

    if (decode) {
      console.log("没有失败");
      console.log("in decode");
      console.log(decode);
      return decode;
    }
    // } else {
    //     res.send({'status':10000});
    // }
  });
};

module.exports = userController;
