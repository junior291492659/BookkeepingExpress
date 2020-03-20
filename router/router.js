let express = require("express");
let User = require("../models/user");
let userController = require("../controllers/user");
let expenseController = require("../controllers/expense")

const router = express.Router();

router
  .get("/", (req, res) => {
    res.send("hello, /");
  })
  .get("/checkLogin", (req, res) => {
      return userController.checkLogin(req, res);
  })
  .post("/login", (req, res)=>{
    return userController.login(req, res);
  })
  .post("/register", (req, res) => {
    let body = req.body;
    // console.log(body);
    return userController.register(req, res, body);
  })
  .get("/initExpense", (req, res) => {
    return expenseController.initExpense(req, res)
  })
  .get("/getMoreExpense", (req, res) => {
    return expenseController.getMoreExpense(req, res)
  })
  .post("/addOneExpense", (req, res) => {
    //   let body = req.body;
      return expenseController.addOneExpense(req, res);
  })
  .post("/changeOneExpense", (req, res) => {
    return expenseController.changeOneExpense(req, res);
  })
  .post("/removeOneExpense", (req, res) => {
    return expenseController.removeOneExpense(req, res);
  })
  .post("/changeOneCategory", (req, res) => {
    return expenseController.changeOneCategory(req, res);
  })
  .post("/addOneCategory", (req, res) => {
    return expenseController.addOneCategory(req, res);
  })
  .post("/removeOneCategory", (req, res) => {
    return expenseController.removeOneCategory(req, res);
  })
  .get("/getStatisticsOfTypeByMonth", (req, res) => {
    return expenseController.getStatisticsOfTypeByMonth(req, res);
  })
  .get("/getStatisticsOfTypeByWeek", (req, res) => {
    return expenseController.getStatisticsOfTypeByMonth(req, res);
  })
  .get("/getStatisticsOfTypeByYear", (req, res) => {
    return expenseController.getStatisticsOfTypeByMonth(req, res);
  })
  .get("/getStatisticsOfDateByMonth", (req, res) => {
    return expenseController.getStatisticsOfDateByMonth(req, res);
  })
  .get("/getStatisticsOfDateByWeek", (req, res) => {
    return expenseController.getStatisticsOfDateByWeek(req, res);
  })
  .get("/getStatisticsOfDateByYear", (req, res) => {
    return expenseController.getStatisticsOfDateByYear(req, res);
  })
  .get("/getData", (req, res) => {
    let body = req.body;
    console.log("in getData");
    console.log(body);
    return userController.getData(req, res, body);
  });

module.exports = router;
