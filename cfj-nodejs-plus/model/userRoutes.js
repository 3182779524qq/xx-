const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');
const usersModel = {
    /**
     * 注册操作
     * @param {Object} data 注册信息
     * @param {Function} cb 回调函数
     */
    add(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('链接数据库失败', err);
                cb({ code: -100, msg: '链接数据库失败' });

                // 这里不需要关闭连接，因为没有连接成功。
                return;
            };
            const db = client.db('cfj');
            let saveData = {
                username: data.username,
                password: data.password,
                nickname: data.nickname,
                phone: data.phone,
                sex:data.sex,
                age:data.age,
                is_admin: data.isAdmin
            };
            
            // ========= 使用 async 的 串行无关联来写 ======================
            async.series([
                function (callback) {
                    // 查询是否已注册
                    db.collection('users').find({ username: saveData.username }).count(function (err, num) {
                        if (err) {
                            callback({ code: -101, msg: '查询是否已注册失败' });
                        } else if (num !== 0) {
                            console.log('用户已经注册过了');
                            callback({ code: -102, msg: '用户已经注册过了' });
                        } else {
                            console.log('当前用户可以注册');
                            callback(null);
                        }
                    })
                },


                function (callback) {
                    db.collection('users').find().sort({ _id: -1 }).toArray(function (err, result) {
                        if (err) {
                            callback({ code: '错误状态为：-101', msg: '查询记录失败' });
                        } else {
                            if (result == '') {
                                saveData._id = 1;
                            } else {
                                var num = result[0]._id;
                                console.log(result[0]._id);
                                num++;
                                saveData._id = num;
                            }
                            callback(null);
                        }
                    });
                },

                function (callback) {
                    // 写入数据库的操作
                    db.collection('users').insertOne(saveData, function (err) {
                        if (err) {
                            callback({ code: -101, msg: '写入数据库失败' });
                        } else {
                            callback(null);
                        }
                    })
                }
            ], function (err, results) {
                // 不管上面3个异步操作是否都成功，都会进入到这个最终的回调里面
                if (err) {
                    console.log('上面的3步操作，可能出了问题', err);
                    // 还得告诉前端页面
                    cb(err);
                } else {
                    cb(null);
                }

                client.close();
            });
        })
    },

    /**
     * 登录方法
     * @param {Object} data 登录信息 {username: '', password: ''}
     * @param {Function} cb 回调函数
     */
    login(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '数据库连接失败' });
            } else {
                const db = client.db('cfj');

                db.collection('users').find({
                    username: data.username,
                    password: data.password
                }).toArray(function (err, data) {
                    if (err) {
                        console.log('查询数据库失败', err);
                        cb({ code: -101, msg: err });
                        client.close();
                    } else if (data.length <= 0) {
                        // 没有找到，用户不能登录
                        console.log('用户不能登录');
                        cb({ code: -102, msg: '用户名或密码错误' });
                    } else {
                        console.log('用户可以登录');
                        // 这里需要将 用户名，昵称、与是否是管理员这两个字段告诉给前端
                        cb(null, {
                            username: data[0].username,
                            nickname: data[0].nickname,
                            isAdmin: data[0].is_admin
                        });
                    }
                    client.close();
                })
            }
        })
    },

    /**
     * 获取用户列表
     * @param {Object} data 页码信息与每页显示条数信息
     * @param {Function} cb 回调函数
     */
    getUserList(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '链接数据库失败' });
            } else {
                var db = client.db('cfj');

                var limitNum = parseInt(data.pageSize);
                var skipNum = data.page * data.pageSize - data.pageSize;

                async.parallel([
                    function (callback) {
                        // 查询所有记录
                        db.collection('users').find().count(function (err, num) {
                            if (err) {
                                callback({ code: -101, msg: '查询数据库失败' });
                            } else {
                                callback(null, num);
                            }
                        })
                    },

                    function (callback) {
                        // 查询分页的数据
                        db.collection('users').find().limit(limitNum).skip(skipNum).toArray(function (err, data) {
                            if (err) {
                                callback({ code: -101, msg: '查询数据库失败' });
                            } else {
                                callback(null, data);
                            }
                        })
                    }
                ], function (err, results) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, {
                            totalPage: Math.ceil(results[0] / data.pageSize),
                            userList: results[1],
                            page: data.page,
                        })
                    }
                    // 关闭连接
                    client.close();
                })
            }
        })
    },

    /**
     * 
     * @param {object} data 这是查询用户的名字 
     * @param {Function} cb 回调函数
     */

    findUser(data,cb){
        MongoClient.connect(url, function (err,client) {
            if (err) {
                cb({ code: -100, msg: '链接数据库失败' });
            } else {
                var db = client.db('cfj');
                
                async.parallel([
                    function (callback) {
                        // 查询所有记录
                        db.collection('users').find({ username: data.username }).toArray(function(err,data){
                            if (err) {
                                callback({ code: -101, msg: '查询数据库失败' });
                            }else if (data.length <= 0) {
                                console.log('有错');
                            }else {
                                // console.log(data[0]);
                                // userList = data[0];
                                callback(null, data[0]);
                            }
                        })
                    }
                ],function (err, results) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null,{
                            
                            userList : results[0],
                        });
                    }
                    // 关闭连接
                    client.close();
                })
            };
        });
    },

    /**
     * 
     * @param {object} data 这是要删除的数据
     * @param {function} cb  这是删除后的回调
     */
    delete(data,cb){
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '链接数据库失败' });
            } else {
                var db = client.db('cfj');
                db.collection('users').remove({
                    _id: parseInt(data.id)
                },function (err) {
                    if (err) {
                        cb({ code: -100, msg: '数据库操作失败' });
                    }
                })

                client.close();
            };
        });
        cb(null);
    },

    /**
     * 
     * @param {object} data 这是要修改的数据
     * @param {function} cb  这是修改后的回调
     */
    update(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '链接数据库失败' });
            } else {
                console.log("进来啊");
                var db = client.db('cfj');
                db.collection('users').updateOne({
                    _id: parseInt(data.id)
                    
                },{
                    $set:{ username: data.username,
                        password: data.password,
                        nickname: data.nickname,
                        sex:data.sex,
                        age:data.age,
                        phone: data.phone}
                }, function (err) {
                    if (err) {
                        cb({ code: -100, msg: '数据库操作失败' });
                    }
                })

                client.close();
            };
        });
        cb(null);
    },

    




};

module.exports = usersModel;