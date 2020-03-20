let jwt = require("jsonwebtoken");
let mongoose = require("mongoose");
let expenseSchema = require("../models/expense");
let userController = require("../controllers/user");
// let jwt = require("jsonwebtoken"); //用来生成token

let expenseController = {};

//添加一条记录
expenseController.addOneExpense = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  // console.log("in addOneExpense");
  // console.log(decode);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );
  let oneExpense = new UserExpenses(req.body);
  oneExpense.save().then(
    success => {
      console.log("存储数据成功");
      return res.status(200).json({
        errCode: 0,
        message: "存储数据成功"
      });
    },
    error => {
      console.log("服务器错误");
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,存储失败,请刷新页面."
      });
    }
  );
};

//获取该用户数据
expenseController.initExpense = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let date = new Date(getDayFormat(new Date()));
  let todayDate = date; //getDayFormat(date);
  let previous7Date = new Date(date.getTime() - 3600 * 1000 * 24 * 6); //getDayFormat(date.getTime() - 3600 * 1000 * 24);

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );
  // let oneExpense = new UserExpenses(req.body);
  UserExpenses.find({ id: "-1" })
    .then(category => {
      let userCategory = [];
      for (let { name, color } of category) {
        userCategory.push({
          name,
          color
        });
      }

      UserExpenses.find({
        $and: [
          { date: { $gte: previous7Date.toISOString() } },
          { date: { $lte: todayDate.toISOString() } },
          { id: { $not: /^-1$/ } }
        ]
      })
        .then(data => {
          if (data.length > 0) {
            // console.log(data);

            let expenses = [];
            let map = new Map();
            for (let i = 0; i < 7; ++i) {
              //获取最新7天的数据
              let singleDate = todayDate.getTime() - 3600 * 1000 * 24 * i;
              data.forEach(item => {
                if (
                  getDayFormat(item.date) == getDayFormat(singleDate) &&
                  !map.has(getDayFormat(singleDate))
                ) {
                  map.set(getDayFormat(singleDate), []);
                }
              });
            }
            // console.log(map);
            for (let key of map.keys()) {
              // console.log(key);
              data.forEach(item => {
                if (getDayFormat(item.date) == key) {
                  // console.log("push...");
                  map.get(key).push({
                    id: item.id,
                    name: item.name,
                    color: item.color,
                    amount: item.amount,
                    description: item.description
                  });
                }
              });
            }

            // console.log(map);
            for (let [key, list] of map.entries()) {
              let item = {
                date: key,
                list
              };
              expenses.push(item);
            }
            // console.log("准备打印expenses");
            // console.log(expenses);
            // console.log(userCategory);
            let record = {
              category: userCategory,
              expenses,
              username: decode.username
            };
            record = JSON.stringify(record);
            return res.status(200).json({
              errCode: 0,
              message: "查询数据成功，找到了",
              record
            });
          } else {
            console.log("没找到指定日期范围的记录");
            return res.status(200).json({
              errCode: 400,
              message: "没找到指定日期范围的记录"
            });
          }
        })
        .catch(error => {
          return res.status(500).json({
            errCode: 500,
            message: "服务器错误,存储失败,请刷新页面."
          });
        });
    })
    .catch(error => {
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,获取失败,请刷新页面."
      });
    });
};

//获取更多的数据
expenseController.getMoreExpense = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let date = new Date(getDayFormat(new Date()));
  // console.log("获取倍数");
  // console.log(req.query.times);
  // let todayDate = date; //getDayFormat(date);
  let previousMoreStartDate = new Date(
    date.getTime() - 3600 * 1000 * 24 * (7 * (req.query.times + 1) - 1)
  ); //getDayFormat(date.getTime() - 3600 * 1000 * 24);
  let previousMoreEndDate = new Date(
    date.getTime() - 3600 * 1000 * 24 * 7 * req.query.times
  );

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  UserExpenses.find({
    $and: [
      { date: { $gte: previousMoreStartDate.toISOString() } },
      { date: { $lte: previousMoreEndDate.toISOString() } },
      { id: { $not: /^-1$/ } }
    ]
  })
    .then(data => {
      if (data.length > 0) {
        // console.log(data);

        let expenses = [];
        let map = new Map();
        for (let i = 0; i < 7; ++i) {
          //获取最新7天的数据
          let singleDate = previousMoreEndDate.getTime() - 3600 * 1000 * 24 * i;
          data.forEach(item => {
            if (
              getDayFormat(item.date) == getDayFormat(singleDate) &&
              !map.has(getDayFormat(singleDate))
            ) {
              map.set(getDayFormat(singleDate), []);
            }
          });
        }
        // console.log(map);
        for (let key of map.keys()) {
          // console.log(key);
          data.forEach(item => {
            if (getDayFormat(item.date) == key) {
              // console.log("push...");
              map.get(key).push({
                id: item.id,
                name: item.name,
                color: item.color,
                amount: item.amount,
                description: item.description
              });
            }
          });
        }

        // console.log(map);
        for (let [key, list] of map.entries()) {
          let item = {
            date: key,
            list
          };
          expenses.push(item);
        }
        // console.log("准备打印expenses");
        // console.log(expenses);
        // console.log(userCategory);
        let record = {
          expenses,
          username: decode.username
        };
        record = JSON.stringify(record);
        return res.status(200).json({
          errCode: 0,
          message: "查询更多的数据成功，找到了",
          record
        });
      } else {
        console.log("没找到指定日期范围的记录");
        return res.status(200).json({
          errCode: 400,
          message: "没找到指定日期范围的记录"
        });
      }
    })
    .catch(error => {
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,获取失败,请刷新页面."
      });
    });
};

//修改某一条记录
expenseController.changeOneExpense = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  let oldDate = new Date(req.body.oldDate);
  let newDate = new Date(req.body.newDate);

  UserExpenses.findOneAndUpdate(
    { $and: [{ date: oldDate.toISOString() }, { id: req.body.oldId }] },
    {
      id: req.body.oneExpenseData.id,
      date: newDate,
      name: req.body.oneExpenseData.name,
      color: req.body.oneExpenseData.color,
      amount: req.body.oneExpenseData.amount,
      description: req.body.oneExpenseData.description
    },
    { new: true }
  )
    .then(data => {
      console.log(data);
      if (data) {
        return res.status(200).json({
          errCode: 0,
          message: "修改数据成功了"
        });
      } else {
        console.log("没找到指定的记录");
        return res.status(200).json({
          errCode: 400,
          message: "没找到指定的记录"
        });
      }
    })
    .catch(error => {
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,修改失败,请刷新页面."
      });
    });
};

//删除某一条记录
expenseController.removeOneExpense = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  let date = new Date(req.body.date);

  UserExpenses.findOneAndRemove({
    $and: [{ date: date.toISOString() }, { id: req.body.id }]
  })
    .then(data => {
      console.log("在删除中。。。。。");
      console.log(data);
      if (data) {
        return res.status(200).json({
          errCode: 0,
          message: "删除数据成功了"
        });
      } else {
        console.log("没找到指定的记录");
        return res.status(200).json({
          errCode: 400,
          message: "没找到指定的记录"
        });
      }
    })
    .catch(error => {
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,删除失败,请刷新页面."
      });
    });
};

//增加某一类别
expenseController.addOneCategory = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  let payload = {
    id: "-1",
    date: new Date(),
    name: req.body.name,
    color: req.body.color,
    amount: "-1",
    description: ""
  };
  let oneCategory = new UserExpenses(payload);
  oneCategory.save().then(
    success => {
      console.log("存储类别成功");
      return res.status(200).json({
        errCode: 0,
        message: "存储类别成功"
      });
    },
    error => {
      console.log("服务器错误");
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,存储失败,请刷新页面."
      });
    }
  );
};

//删除某一类别
expenseController.removeOneCategory = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  UserExpenses.remove({ name: req.body.name })
    .then(data => {
      console.log("准备删除类别");
      console.log(data);
      if (data.n !== 0) {
        console.log("删除类别成功");
        return res.status(200).json({
          errCode: 0,
          message: "删除类别成功"
        });
      } else {
        console.log("没找到指定的记录");
        return res.status(200).json({
          errCode: 400,
          message: "没找到指定的记录"
        });
      }
    })
    .catch(error => {
      console.log("服务器错误");
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,存储失败,请刷新页面."
      });
    });
};

//修改某一类别
expenseController.changeOneCategory = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  UserExpenses.updateMany(
    { name: req.body.oldName },
    { name: req.body.newName, color: req.body.newColor }
  )
    .then(data => {
      console.log("在更新类别中");
      console.log(data);
      if (data.n !== 0) {
        return res.status(200).json({
          errCode: 0,
          message: "修改类别及数据成功了"
        });
      } else {
        console.log("没找到指定的记录");
        return res.status(200).json({
          errCode: 400,
          message: "没找到指定的记录"
        });
      }
    })
    .catch(error => {
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,删除失败,请刷新页面."
      });
    });
};

// 根据 月份 获取 类别数据
expenseController.getStatisticsOfTypeByMonth = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  let startDate = new Date(req.query.startEnd[0]);
  let endDate = new Date(req.query.startEnd[1]);

  UserExpenses.find({
    $and: [
      { date: { $gte: startDate.toISOString() } },
      { date: { $lte: endDate.toISOString() } },
      { id: { $not: /^-1$/ } }
    ]
  })
    .then(data => {
      if (data.length > 0) {
        console.log(data);
        let category = new Map();
        data.forEach(item => {
          if (!category.has(item.name)) {
            category.set(item.name, {
              color: item.color,
              amount: item.amount
            });
          } else {
            category.get(item.name).amount += item.amount;
          }
        });

        let result = {
          labels: [],
          datasets: [
            {
              label: "Data One",
              backgroundColor: [],
              data: []
            }
          ]
        };

        let totalAmount = 0;
        for (let [key, value] of category.entries()) {
          result.labels.push(key);
          result.datasets[0].backgroundColor.push(value.color);
          result.datasets[0].data.push(value.amount);
          totalAmount += value.amount;
        }
        console.log(result.datasets[0].data);
        return res.status(200).json({
          errCode: 0,
          message: "获取指定日期范围的记录成功",
          category: result,
          totalAmount
        });
      } else {
        console.log("没找到指定日期范围的记录");
        return res.status(200).json({
          errCode: 400,
          message: "没找到指定日期范围的记录"
        });
      }
    })
    .catch(error => {
      console.log("服务器错误");
      console.log(error);
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,获取失败,请刷新页面."
      });
    });
};

//
expenseController.getStatisticsOfDateByMonth = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  let startDate = new Date(req.query.everyday[0]);
  let endDate = new Date(req.query.everyday[req.query.everyday.length - 1]);
  console.log(startDate);
  console.log(endDate);
  UserExpenses.find({
    $and: [
      { date: { $gte: startDate.toISOString() } },
      { date: { $lte: endDate.toISOString() } },
      { id: { $not: /^-1$/ } }
    ]
  })
    .then(data => {
      if (data.length > 0) {
        let map = new Map();
        let totalAmount = 0;
        req.query.everyday.forEach(item => {
          data.forEach(dataItem => {
            if (getDayFormat(dataItem.date) == item) {
              totalAmount += dataItem.amount;
              if (!map.has(item)) {
                map.set(item, {
                  list: [
                    {
                      color: dataItem.color,
                      amount: dataItem.amount
                    }
                  ]
                });
              } else {
                map.get(item).list.push({
                  color: dataItem.color,
                  amount: dataItem.amount
                });
              }
            }
          });
        });

        let result = {
          labels: [],
          datasets: [
            {
              label: "每日支出",
              backgroundColor: [],
              data: []
            }
          ]
        };

        // console.log(map.entries());
        for (let [key, value] of map) {
          value.list.sort((a, b) => b.amout - a.amount);
          result.labels.push(key);
          result.datasets[0].backgroundColor.push(value.list[0].color);
          result.datasets[0].data.push(
            value.list.reduce(
              (pre, cur) => {
                return { amount: pre.amount + cur.amount };
              },
              { amount: 0 }
            ).amount
          );
        }
        result.datasets[0].data.push(0);
        console.log(result.labels);
        console.log(result.datasets[0].backgroundColor);
        console.log(result.datasets[0].data);
        return res.status(200).json({
          errCode: 0,
          message: "获取指定日期范围的记录成功",
          everyday: result,
          totalAmount
        });
      } else {
        console.log("没找到指定日期范围的记录");
        return res.status(200).json({
          errCode: 400,
          message: "没找到指定日期范围的记录"
        });
      }
    })
    .catch(error => {
      console.log("服务器错误");
      console.log(error);
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,获取失败,请刷新页面."
      });
    });
};

expenseController.getStatisticsOfDateByWeek = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  let startDate = new Date(req.query.everyday[0]);
  let endDate = new Date(req.query.everyday[req.query.everyday.length - 1]);
  console.log(startDate);
  console.log(endDate);
  UserExpenses.find({
    $and: [
      { date: { $gte: startDate.toISOString() } },
      { date: { $lte: endDate.toISOString() } },
      { id: { $not: /^-1$/ } }
    ]
  })
    .then(data => {
      if (data.length > 0) {
        let map = new Map();
        let totalAmount = 0;
        req.query.everyday.forEach(item => {
          data.forEach(dataItem => {
            if (getDayFormat(dataItem.date) == item) {
              totalAmount += dataItem.amount;
              if (!map.has(item)) {
                map.set(item, {
                  list: [
                    {
                      color: dataItem.color,
                      amount: dataItem.amount
                    }
                  ]
                });
              } else {
                map.get(item).list.push({
                  color: dataItem.color,
                  amount: dataItem.amount
                });
              }
            }
          });
        });

        let result = {
          labels: [],
          datasets: [
            {
              label: "每周支出",
              backgroundColor: [],
              data: []
            }
          ]
        };

        console.log(map.entries());
        for (let [key, value] of map) {
          value.list.sort((a, b) => b.amout - a.amount);
          result.labels.push(getWeekFormat(key));
          result.datasets[0].backgroundColor.push(value.list[0].color);
          result.datasets[0].data.push(
            value.list.reduce(
              (pre, cur) => {
                console.log(pre.amount, pre.amount + cur.amount);
                return { amount: pre.amount + cur.amount };
              },
              { amount: 0 }
            ).amount
          );
        }
        result.datasets[0].data.push(0);
        console.log(result.labels);
        console.log(result.datasets[0].backgroundColor);
        console.log(result.datasets[0].data);
        return res.status(200).json({
          errCode: 0,
          message: "获取指定日期范围的记录成功",
          everyday: result,
          totalAmount
        });
      } else {
        console.log("没找到指定日期范围的记录");
        return res.status(200).json({
          errCode: 400,
          message: "没找到指定日期范围的记录"
        });
      }
    })
    .catch(error => {
      console.log("服务器错误");
      console.log(error);
      return res.status(500).json({
        errCode: 500,
        message: "服务器错误,获取失败,请刷新页面."
      });
    });
};

expenseController.getStatisticsOfDateByYear = (req, res) => {
  let decode = getUsername(req.get("Authorization-Token"), res);
  if (!decode) return;

  let UserExpenses = mongoose.model(
    `${decode.username}_expenses`,
    expenseSchema
  );

  let startDate = new Date(req.query.everyday[0]);
  let endDate = new Date(req.query.everyday[req.query.everyday.length - 1]);
  console.log(startDate);
  console.log(endDate);
  UserExpenses.find({
    $and: [
      { date: { $gte: startDate.toISOString() } },
      { date: { $lte: endDate.toISOString() } },
      { id: { $not: /^-1$/ } }
    ]
  }).sort({date: "asc"}).then(data => {
    if (data.length > 0) {
      let map = new Map();
      let totalAmount = 0;
      data.forEach(item => {
        let month = getDateMonth(item.date);
        totalAmount += item.amount;
        if (!map.has(month)) {
          map.set(month, {
            list: [
              {
                color: item.color,
                amount: item.amount
              }
            ]
          });
        } else {
          map.get(month).list.push({ color: item.color, amount: item.amount });
        }
      });

      let result = {
        labels: [],
        datasets: [
          {
            label: "每月支出",
            backgroundColor: [],
            data: []
          }
        ]
      };

      for (let [key, value] of map) {
        value.list.sort((a, b) => b.amout - a.amount);
        result.labels.push(key+"月");
        result.datasets[0].backgroundColor.push(value.list[0].color);
        result.datasets[0].data.push(
          value.list.reduce(
            (pre, cur) => {
              console.log(pre.amount, pre.amount + cur.amount);
              return { amount: pre.amount + cur.amount };
            },
            { amount: 0 }
          ).amount
        );
      }
      result.datasets[0].data.push(0);
      console.log(result.labels);
      console.log(result.datasets[0].backgroundColor);
      console.log(result.datasets[0].data);
      return res.status(200).json({
        errCode: 0,
        message: "获取指定日期范围的记录成功",
        everyday: result,
        totalAmount
      });
    }else {
      console.log("没找到指定日期范围的记录");
      return res.status(200).json({
        errCode: 400,
        message: "没找到指定日期范围的记录"
      });
    }
  })
  .catch(error => {
    console.log("服务器错误");
    console.log(error);
    return res.status(500).json({
      errCode: 500,
      message: "服务器错误,获取失败,请刷新页面."
    });
  });
};

//创建该用户的collection
expenseController.createExpensesCollection = username => {
  let UserExpenses = mongoose.model(`${username}_expenses`, expenseSchema);
  let category = [
    { name: "食物", color: "#5AACA0" },
    { name: "娱乐", color: "#B975DC" },
    { name: "交通", color: "#1C7DA8" },
    { name: "衣服", color: "#FF6B6B" },
    { name: "住房", color: "#F38631" },
    { name: "其他", color: "#3B5A5F" },
    { name: "超市", color: "#15A5D7" },
    { name: "水电", color: "#f1c40f" },
    { name: "+", color: "#566270" }
  ];
  category.forEach(item => {
    let temp = new UserExpenses({
      id: "-1",
      date: new Date(),
      name: item.name,
      color: item.color,
      amount: "-1",
      description: ""
    });
    temp.save().then(
      value => {
        //   console.log(value);
      },
      error => {
        console.log(error);
      }
    );
  });
};

let getUsername = (token, res) => {
  console.log("in getUsername");
  let secretOrPrivateKey = "jwt_junior";
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

    console.log("in getUsername", decode);

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

let getDayFormat = time => {
  //2020-2-3  => 2020-2-3
  let date = new Date(time);
  // console.log(
  //   `${time.getFullYear()}-${time.getMonth()+1}-${time.getDate()}`
  // );
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

let getWeekFormat = time => {
  let date = new Date(time);
  let day = date.getDay();
  console.log("in getWeekFormat 888888888");
  console.log(time, day);
  switch (day) {
    case 1:
      return "星期一";
    case 2:
      return "星期二";
    case 3:
      return "星期三";
    case 4:
      return "星期四";
    case 5:
      return "星期五";
    case 6:
      return "星期六";
    case 0:
      return "星期日";
  }
};

let getDateMonth = time => {
  let date = new Date(time);
  return date.getMonth() + 1;
};

module.exports = expenseController;
