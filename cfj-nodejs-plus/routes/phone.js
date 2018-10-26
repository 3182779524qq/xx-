var express = require('express');
var router = express.Router();
// var usersModel = require('../model/userRoutes.js');
var phoneModel = require('../model/phoneRoutes.js');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';

//=================新增手机图片====================
const multer = require('multer');
const upload = multer({
    dest: 'C:/tem/'
});
const fs = require('fs');
const path = require('path');
router.post('/add', upload.single('mobile'), function (req, res) {
    fs.readFile(req.file.path,function(err,data){
        if(err){
            console.log('文件读取失败',err);
        }else{
            var flieName = new Date().getTime() +'_'+req.file.originalname;
            var des_flile = path.resolve(__dirname,'../public/images/',flieName);
            let src = '/images/' + flieName;
            fs.writeFile(des_flile,data,function(err){
                if (err) {
                    console.log('写入失败',err);
                }else{
                    console.log('写入成功');
                    phoneModel.add({
                        src: src,
                        brand: req.body.brand,
                        phonename: req.body.phonename,
                        // brand: req.body.brand,
                        price: req.body.price,
                        secondprice: req.body.secondprice 
                        }, function (err, data) {
                        if (err) {
                            res.render('myErr', err);
                        } else {
                            res.redirect('/phone/mobileManager.html');
                        }
                    })
                }
            })
        }
    })

    // res.send();
})
//=============== 手机修改===============->
router.post('/update', upload.single('mobileupdate'), function (req, res) {
    fs.readFile(req.file.path, function (err, data) {
        if (err) {
            console.log('文件读取失败', err);
        } else {
            var flieName = new Date().getTime() + '_' + req.file.originalname;
            var des_flile = path.resolve(__dirname, '../public/images/', flieName);
            let src = '/images/' + flieName;
            fs.writeFile(des_flile, data, function (err) {
                if (err) {
                    console.log('写入失败', err);
                } else {
                    console.log('写入这里成功');
                    phoneModel.update({
                        id:req.body._id,
                        src: src,
                        brand: req.body.brand,
                        phonename: req.body.phonename,
                        // brand: req.body.brand,
                        price: req.body.price,
                        secondprice: req.body.secondprice
                    }, function (err, data) {
                        if (err) {
                            res.render('myErr', err);
                        } else {
                            console.log(req.body.brand);
                            res.redirect('/phone/mobileManager.html');
                        }
                    })
                }
            })
        }
    })

    // res.send();
})


//==========================手机管理界面===============
router.get('/mobileManager.html', function (req, res) {
    let page = req.query.page || 1; // 页码
    let pageSize = req.query.pageSize || 5; // 每页显示的条数
    phoneModel.getPhoneList({
    page: page,
    pageSize: pageSize
    }, function (err, data) {
    if (err) {
        res.render('myError', err);
    } else {
        console.log("aaa"),
        res.render('mobileManager', {
            username: req.cookies.username,
            nickname: req.cookies.nickname,
            isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
            phoneList: data.phoneList,
            totalPage: data.totalPage,
            page: data.page
            });
        }
    });
})
//=============== 手机删除页面===============->
router.get('/delete', function (req, res) {
    console.log('删除页面进来');
    // res.render('login');
    // res.send();
    phoneModel.delete({ id: req.query.id }, function (err) {
        if (err) {
            res.render('myError', err);
        } else {
            res.redirect('/phone/mobileManager.html');
        }
    })

});
//=============== 品牌查找===============->
router.post('/findBrand', function (req, res) {

    MongoClient.connect(url, function (err, client) {
        if (err) {
            res.send({ code: -101, msg: '连接失败' });
        } else {
            var db = client.db('cfj');
            db.collection('brand').find().toArray(function (err, data) {
                if (err) {
                    res.send({ code: -101, msg: '查询失败' });
                } else {
                    res.send(data);
                }
            })
        }
    })
})






module.exports = router;
