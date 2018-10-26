var express = require('express');
var router = express.Router();
// var phoneModel = require('../model/phoneRoutes.js');
var brandModel = require('../model/brandRoutes.js');
//=================新增品牌图片====================
const multer = require('multer');
const upload = multer({
    dest: 'C:/tem/'
});
const fs = require('fs');
const path = require('path');

router.post('/add', upload.single('brand'), function (req, res) {
    // console.log("啊啊啊");
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
                    console.log('写入成功');
                    brandModel.add({src:src,brandname:req.body.brandname},function(err,data){
                        if (err) {
                            res.render('myErr',err);
                        }else{
                            res.redirect('/brand');
                        }
                    })
                }
            })
        }
    })
    // res.send();
});



//=============== 这是品牌管理页===============-> /brand/brand
router.get('/',function(req,res){
    let page = req.query.page || 1; // 页码
    let pageSize = req.query.pageSize || 5;
    brandModel.getBrandList({page:page,pageSize:pageSize},function (err,data) {
        if(err){
            res.render('myError',err);
        }else{
            res.render('brand', {
                username: req.cookies.username,
                nickname: req.cookies.nickname,
                isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
                brandList: data.brandList,
                totalPage: data.totalPage,
                page: data.page
            });
        }
    })
});


//=============== 这是删除界面===============->
router.get('/delete', function (req, res) {
    console.log('删除页面进来');
    // res.render('login');
    // res.send();
    brandModel.delete({ id: req.query.id }, function (err) {
        if (err) {
            res.render('myError', err);
        } else {
            res.redirect('/brand');

        }
    })

});

//=============== 这是修改界面===============->
router.post('/updata',upload.single('updatabrand'), function (req, res) {
    // console.log("修改也面将来了嘛");
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
                    console.log('写入成功');
                    console.log(req.body);
                    brandModel.update({ id: req.body._id, src: src, brandname: req.body.brandname}, function (err) {
                        if (err) {
                            res.render('myError', err);
                        } else {
                            res.redirect('/brand');
                        }
                    })
                }
            })
        }
    })
    // res.send();



    
});

module.exports = router;