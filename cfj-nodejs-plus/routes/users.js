var express = require('express');
var router = express.Router();
const usersModel = require('../model/userRoutes.js');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function (req, res) {
  // console.log('获取传递过来的 post 请求的数据');
  // console.log(req.body);
  // 1. 用户名必须是 5 - 10为字符
  if (!/^\w{5,10}$/.test(req.body.username)) {
    res.render('myError', { code: -1, msg: '用户名必须是5-10位' });
    return;
  }

  usersModel.add(req.body, function (err) {
    if (err) {
      // 如果有错误，直接将错误信息渲染到页面
      res.render('myError', err);
    } else {
      res.redirect('/login.html');
    }
  })

});

// 登录处理
router.post('/login', function (req, res) {
  // 调用 userModel里面的 login方法
  usersModel.login(req.body, function (err, data) {
    if (err) {
      res.render('myError', err);
    } else {
      console.log('当前登录用户的信息是', data);
      res.cookie('username', data.username, {
        maxAge: 1000 * 60 * 1000000, // 单位是毫秒，
      })
      res.cookie('nickname', data.nickname, {
        maxAge: 1000 * 60 * 1000000, // 单位是毫秒，
      })
      res.cookie('isAdmin', data.isAdmin, {
        maxAge: 1000 * 60 * 1000000, // 单位是毫秒，
      })

      res.redirect('/');
    }
  })
})

// 退出登录
router.get('/logout', function (req, res) {
  // 清除cookie
  // 跳转 登录页

  res.clearCookie('username');
  res.clearCookie('nickname');
  res.clearCookie('isAdmin');
  res.redirect('/login.html');
})

// ========================这是用户查找======================
// router.get('/find',function(req,res){
//   if(err){
//     res.render('myError',err);
//   }else{

//   }
// })

module.exports = router;
