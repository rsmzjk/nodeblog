const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')
const encrypt = require('../util/encrypt')

// 用户注册
exports.reg = async (ctx) => {
    // 用户注册时 post 发送的数据
    const user = ctx.request.body
    const username = user.username
    const password = user.password
    // 注册时 去数据库 user 查询当前发过来的 username 是否存在  对密码进行加密处理
    await new Promise((resolve,reject) => {
        // 去 users 数据库查询
        User.find({username}, (err,data) => {
            if (err) return reject(err);
            // 数据库查询没出错 是否有数据
            if (data.length !== 0) {
                // 查询导数据 --> 用户名已存在
                return resolve(username + '用户名已存在')
            }
            // 用户名不存在 需要存到数据库 保存到数据库之前需要先加密, encrpty模块是自定义的
            const _user = new User({
                username,
                password: encrypt(password),
                commentNum: 0,
                articleNum: 0
            })
            _user.save((err,data) => {
                if(err){
                    reject(err)
                }else{
                    resolve(data)
                }
            })
        })
    })
    .then(async data => {
        if (data) {
            // 注册成功
            await ctx.render('isOk', {status: '注册成功'})
        } else {
            // 用户名已存在
            await ctx.render('isOk', {status: '用户名已存在'})
        }
    })
    .catch(async err => {
        await ctx.render('isOk', {status: '注册失败,请重试'})
    })
}

// 用户登录
exports.login = async (ctx) => {
    // 拿到 post 数据
    const user = ctx.request.body
    const username = user.username
    const password = user.password

    await new Promise((resolve,reject) => {
        User.find({username}, (err,data) => {
            if (err)return reject(err)
            if(data.length === 0) return reject('用户名不存在')
            
            // 把用户传过来的密码 加密后跟数据库的进行比对
            if(encrypt(password) === data[0].password){
                return resolve(data)
            }
            reject('')
        })
    })
    .then(async data => {
        if(!data){
            return ctx.render('isOk',{status: '密码不正确,登录失败'})
        }

        // 让用户在他的 cookie 里设置 username password 加密后的密码 权限
        ctx.cookies.set('username', username, {
            domain: 'localhost',
            path: '/',
            maxAge: 36e5,
            httpOnly: true, // true 不让客户端访问这个 cookie
            overwrite: false,
        })
        // 用户在数据库的_id值
        ctx.cookies.set('uid', data[0]._id, {
            domain: 'localhost',
            path: '/',
            maxAge: 36e5,
            httpOnly: true, // true 不让客户端访问这个 cookie
            overwrite: false,
        })
        ctx.session = {
            username,
            uid: data[0]._id,
            avatar: data[0].avatar,
            role: data[0].role
        }
        // 登录成功
        await ctx.render('isOk',{status: '登录成功'})
    })
    .catch(async err => {
        await ctx.render('isOk', { status: '登录失败' })
    })
}

// 保持用户的状态 保持用户的状态
exports.keepLog = async (ctx, next) => {
    if (ctx.session.isNew) { // session 没有
        if (ctx.cookies.get('username')) {
            ctx.session = {
                username: ctx.cookies.get('username'),
                uid: ctx.cookies.get('uid')
            }
        }
    }
    await next()
}

// 用户退出中间件
exports.logout = async ctx => {
    ctx.session = null
    ctx.cookies.set('username', null, {
        maxAge: 0
    })
    ctx.cookies.set('uid', null, {
        maxAge: 0
    })
    // 在后台做重定向到 根
    ctx.redirect('/')
}

// 用户头像上传
exports.upload = async ctx => {
    const filename = ctx.req.file.filename
    let data = {}
    await User.updateOne({_id: ctx.session.uid}, {$set: {avatar: '/avatar/' + filename}}, (err,res) => {
        if (err) {
            data = {
                status: 0,
                message: err
            }
        } else{
            data = {
                status: 1,
                message: '上传成功'
            }
        }
    })

    ctx.body = data
}

// 后台 所有用户
exports.userlist = async ctx => {
    const data = await User.find()
    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

// 后台 删除用户
exports.del = async ctx => {
    // 用户 id
    const uid = ctx.params.id

    // 拿到 userId 删除 user
    let res = {
        state: 1,
        message: '成功'
    }

    await User.findById(uid)
        .then(data => data.remove())
        .catch(err => {
            res = {
                state: 0,
                message: err
            }
        })
    ctx.body = res
}
