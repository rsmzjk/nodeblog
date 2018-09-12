const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')

// 返回文章发表页
exports.addPage = async (ctx) => {
    await ctx.render('add-article', {
        title: '文章发表页',
        session: ctx.session
    })
}

// 文章的发表 (保存到数据库)
exports.add = async (ctx) => {
    if (ctx.session.isNew) {
        // true 没登录 不需要查询数据库
        return ctx.body = {
            msg: '用户未登录',
            status: 0
        }
    }

    // 用户登录的情况  用户登录情况下 post 发过来的数据
    const data = ctx.request.body
    // 添加文章的作者
    data.author = ctx.session.uid
    data.commentNum = 0

    await new Promise((resolve, reject) => {
        new Article(data).save((err, data) => {
            if (err)return reject(err)
            // 更新用户文章计数
            User.update({_id: data.author},{$inc: {articleNum:1}},err => {
                if (err)return console.log(err)
                console.log("文章保存成功")
            })
            resolve(data)
        })
    })
    .then(data => {
        ctx.body = {
            msg: '发表成功',
            status: 1
        }
    })
    .catch(err => {
        ctx.body = {
            msg: '发表失败',
            status: 0
        }
    })
}

// 获取文章列表
exports.getList = async ctx => {
    // 查询每篇文字对应的作者的头像
    let page = ctx.params.id || 1
    page--

    // 获取最大的页数
    const maxNum = await Article.estimatedDocumentCount((err,num) => err ? console.log(err) : num)
    // 获取多少数据开始分页
    const maxBreak = 10

    const artList = await Article
        .find()
        .sort('-created')
        .skip(maxBreak * page)
        .limit(maxBreak)
        .populate({
            path: 'author',
            select: 'username _id avatar'
        }) // mongoose 用于连表查询
        .then(data => data)
        .catch(err => console.log(err))
    // 实时更新用户头像
    let uid = ctx.session.uid
    if (!ctx.session.isNew) {
        await User.findById(uid).then(data => {
            ctx.session.avatar = data.avatar
        })
    }
    await ctx.render('index', {
        session: ctx.session,
        title: 'node实战',
        artList,
        maxNum,
        maxBreak
    })
}

// 文章详情
exports.details = async ctx => {
    // 取动态路由里的 id
    const _id = ctx.params.id

    // 查找文章本身数据
    const article = await Article
        .findById(_id)
        .populate('author','username')
        .then(data => data)

    // 查找跟当前文章相关的所有评论
    const comment = await Comment
        .find({article: _id})
        .sort('-created')
        .populate('from', 'username avatar')
        .then(data => data)
        .catch(err => console.log(err))

    await ctx.render('article',{
        title: article.title,
        article,
        comment,
        session: ctx.session
    })
}

// 后台: 获取用户所有文章
exports.artlist = async ctx => {
    const uid = ctx.session.uid
    const data = await Article.find({author: uid})

    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

// 后台: 删除对应 id 的文章
exports.del = async ctx => {
    // 文章 id
    const _id =ctx.params.id
    // 拿到 articleId 删除 文章
    let res = {
        state: 1,
        message: '成功'
    }

    await Article.findById(_id)
        .then(data => data.remove())
        .catch(err => {
            res = {
                state: 0,
                message: err
            }
        })

    ctx.body = res

    /* let uid

    // 用户的 articleNum -= 1
    // 删除文章对应的所有评论
    // 被删除评论的用户表里的  commentNum -= 1

    let res = {}

    // 删除文章
    await Article.deleteOne({_id}).exec(async err => {
        if(err){
            res = {
                state: 0,
                message: '删除失败'
            }
        }else{
            await Article.findById(_id, (err, data) => {
                if(err) return console.log(err)
                uid = data.author
            })
        }
    })

    await User.updateOne({_id: uid}, {$inc: {articleNum: -1}})

    // 删除所有评论
    await Comment.find({article: _id}).then(async data => {
        // data => array
        let len = data.length
        let i = 0
        async function  deleteUser(){
            if(i>len)return
            const cId = data[i]._id
            await Comment.deleteOne({_id: cId}).then(data => {
                User.update({_id: data[i].from}, {$inc: {commentNum: -1}}, err => {
                    if(err)return console.log(err)
                    i++
                })
            })
        }
        await deleteUser()

        res = {
            state: 1,
            message: '成功'
        }
    }) */
}