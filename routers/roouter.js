const Router = require('koa-router')
// 拿到操作 user 表的逻辑对象
const user = require('../control/user')
const article = require('../control/article')
const comment = require('../control/comment')
const admin = require('../control/admin')
const upload = require('../util/upload')

const router = new Router

// 项目主页 router
router.get('/', user.keepLog, article.getList)

// 登录注册 router
router.get(/^\/user\/(?=reg|login)/, async (ctx) => {
    // show 为true则显示注册 false 则显示登录
    const show = /reg$/.test(ctx.path)

    await ctx.render('register', {show})
})

// 用户登录post请求
router.post('/user/login', user.login)

// 注册用户
router.post('/user/reg', user.reg)

// 用户退出
router.get('/user/logout', user.logout)

// 文章的发表页面
router.get('/article', user.keepLog, article.addPage)

// 文章添加
router.post('/article', user.keepLog, article.add)

// 文章列表分页
router.get('/page/:id', article.getList)

// 文章详情页
router.get('/article/:id', user.keepLog, article.details)

// 发表评论
router.post('/comment', user.keepLog, comment.addComment)

// 后台管理 文章 评论 头像上传
router.get('/admin/:id', user.keepLog, admin.index)

// 头像上传功能
router.post('/upload', user.keepLog, upload.single('file'), user.upload)

// 获取用户的所有评论
router.get('/user/comments', user.keepLog, comment.comlist)

// 后台 删除用户评论
router.del('/comment/:id', user.keepLog, comment.del)

// 获取用户所有文章
router.get('/user/articles', user.keepLog, article.artlist)

// 后台 删除用户文章
router.del('/article/:id', user.keepLog, article.del)

// 获取所有用户
router.get('/user/users', user.keepLog, user.userlist)

// 后台 删除用户
router.del('/customer/:id', user.keepLog, user.del)

router.get('*', async ctx => {
    await ctx.render('404', {
        title: '404'
    })
})
module.exports = router