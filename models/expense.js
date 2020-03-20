let mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

//连接数据库
mongoose.connect("mongodb://localhost/testajax", { useNewUrlParser: true });

let Schema = mongoose.Schema;
let expenseSchema = new Schema({
  id: {type: String, required: true},
  date: { type: Date, default: Date.now, required: true },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  amount: { type: Number, required: true },
 description: {type: String, default:""}
});

// let Expense = mongoose.model("Expense", expenseSchema);


// let expense1 = new Expense({
//   date: new Date(),
//   name: "食物",
//   color: "#5AACA0",
//   amount: 20
// });

// let result = expense1.save().then(
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

module.exports = expenseSchema;   //导出的只是数据库格式
