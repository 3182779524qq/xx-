var express = require('express');
var router = express.Router();
var usersModel = require('../model/userRoutes.js');
// var url = require('url');

// 首页
router.get('/', function (req, res, next) {
  console.log('返回的操作是否有进来');
  // 判断用户是否已经登录，如果登录就返回首页，否则返回 登录页面
  if (req.cookies.username) {
    // 需要将 用户登录信息，传递给页面
    res.render('index', {
      username: req.cookies.username,
      nickname: req.cookies.nickname,
      isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : ''
    });
  } else {
    // 跳转到登陆页面
    res.redirect('/login.html');
  }
});

// 注册页面
router.get('/register.html', function (req, res) {
  res.render('register');
});

// 登录页面
router.get('/login.html', function (req, res) {
  console.log('登录页面进来');
  res.render('login');
});

// 用户管理页面
router.get('/userManager.html', function (req, res) {
  // 同首页，需要判断是否用户登录，并且判断用户是否是管理员

  if (req.cookies.username && parseInt(req.cookies.isAdmin)) {
    // 需要查询数据库
    // 从前端取得2个参数
    let page = req.query.page || 1; // 页码
    let pageSize = req.query.pageSize || 5; // 每页显示的条数
    
    if (req.query.username) {
      // console.log("eeee");
      // let userName = req.query.username;
      usersModel.findUser({ username: req.query.username}, function (err, data) {
        if (err) {
          console.log(err);
          res.render('myError', err);
        } else {
          console.log(data);
          res.render('userManager', {
            username: req.cookies.username,
            nickname: req.cookies.nickname,
            isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
            userList: data.userList,
            totalPage: data.totalPage ||''
          });
        }
      });
      
    }else{
      usersModel.getUserList({
        page: page,
        pageSize: pageSize
      }, function (err, data) {
        if (err) {
          res.render('myError', err);
        } else {
          res.render('userManager', {
            username: req.cookies.username,
            nickname: req.cookies.nickname,
            isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
            userList: data.userList,
            totalPage: data.totalPage,
            page: data.page
          });
        }
      });

    }

  } else {
    res.redirect('/login.html');
  }
})
//======================用户查找界面=================


// 手机管理页面
router.get('/mobileManager.html', function (req, res) {
  // 同首页，需要判断是否用户登录，并且判断用户是否是管理员
  if (req.cookies.username && parseInt(req.cookies.isAdmin)) {
    res.render('mobileManager');
  } else {
    res.redirect('/login.html');
  }
})


//============================删除===========================
router.get('/delete', function (req, res) {
  console.log('删除页面进来');
  // res.render('login');
  // res.send();
  usersModel.delete({ id: req.query.id},function(err){
        if (err) {
          res.render('myError', err);
        }else{
          res.redirect('/userManager.html');

        }
  })

});
//=============== 这是修改接口===============->
router.post('/updata', function (req, res) {
  console.log('修改页面进来');
  // res.render('login');
  // res.send();
  usersModel.update({
    id: req.body._id,
    username: req.body.username,
    sex: req.body.sex,
    age: req.body.age,
    nickname: req.body.nickname,
    phone: req.body.phone
  },function(err) {
    if (err) {
      res.render('myError', err);
    } else {
      res.redirect('/userManager.html');
    }
  })
});

//=============== 这是哪个品牌管理接口===============->
// router.get('/brand', function (req, res) {
//   // res.send('hello');
//   // res.render('mobileManager');
//     let page = req.query.page || 1; // 页码
//     let pageSize = req.query.pageSize || 5; // 每页显示的条数
//     usersModel.getBrandList({
//       page: page,
//       pageSize: pageSize
//     }, function (err, data) {
//       if (err) {
//         res.render('myError', err);
//       } else {
//         console.log("aaa"),
//           res.render('brand', {
//             username: req.cookies.username,
//             nickname: req.cookies.nickname,
//             isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
//             brandList: data.brandList,
//             totalPage: data.totalPage,
//             page: data.page
//           });
//       }
//     });
  
// })



module.exports = router;
