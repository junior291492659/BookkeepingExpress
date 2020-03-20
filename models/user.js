let mongoose = require("mongoose");

//连接数据库
mongoose.connect("mongodb://localhost/testajax", { useNewUrlParser: true });

let Schema = mongoose.Schema;
let userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdTime: {
    type: Date,
    // 注意：这里不要写 Date.now() 因为会即刻调用
    // 这里直接给了一个方法：Date.now
    // 当你去 new Model 的时候，如果你没有传递 create_time ，则 mongoose 就会调用 default 指定的Date.now 方法，使用其返回值作为默认值
    default: Date.now
  },
  lastModifiedTime: {
    type: Date,
    default: Date.now
  }
});

let User = mongoose.model("User", userSchema);

// User.findOne({
//   // $and: [
//   //   {
//   //     name: "ewq"
//   //   },
//   //   {
//   //     password: "66678" 
//   //   }
//   // ]
//   username:"junior",
//   password:"666"
// })
//   .then(data => {
//     if (data){
//       console.log("找到啦");
//     console.log(data);
//     console.log(data.createdTime.getMonth());
//     console.log(data.createdTime.getDate());
//     console.log(data.createdTime.getHours());
//     console.log(data.createdTime.getMinutes());
//     }
//     else {
//       console.log("没找到");
//     }
//   })
//   .catch(err => {
//     console.log(err);
//   });



// let user1 = new User({
//   name: "test1",
//   password: "123",
//   gender: 1
// });

// let result = user1.save().then(
//   value => {
//     console.log(value);
//   },
//   error => {
//     console.log(error);
//   }
// );
// setTimeout(()=>{
//     console.log(result);
// }, 1000);

module.exports = User;
