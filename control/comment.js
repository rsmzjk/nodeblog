const Article = require('../Models/article')
const User = require('../Models/user')
const Comment = require('../Models/comment')

// 保存评论
exports.addComment = async ctx => {
    let message = {
        status: 0,
        msg: '登录才能发表'
    }
    // 验证用户是否登录
    if(ctx.session.isNew) return ctx.body = message

    // 用户登录了
    const data = ctx.request.body
    data.from = ctx.session.uid
    const _comment = new Comment(data)

    await _comment
        .save()
        .then(data => {
            message = {
                status: 1,
                msg: '评论成功'
            }

            // 更新当前文章的评论计数器
            Article
                .update({_id: data.article}, {$inc: {commentNum: 1}}, err => {
                    if (err)return console.log(err);
                    console.log('评论更新成功')
                })
            
            // 更新用户的评论计数器
            User
                .update({_id: data.from}, {$inc: {commentNum: 1}}, err => {
                    if (err)return console.log(err);
                })
        })
        .catch(err => {
            message = {
                status: 0,
                msg: err
            }
        })
    ctx.body = message
}

// 后台: 查询用户所有评论
exports.comlist = async ctx => {
    const uid = ctx.session.uid
    const data = await Comment.find({from: uid}).populate("article", 'title')
    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

// 后台: 删除对应 id 的评论
exports.del = async ctx => {
    // 评论 id
    const commentId = ctx.params.id
    // 拿到 commentID 删除 comment
    let res = {
        state: 1,
        message: '成功'
    }

    await Comment.findById(commentId)
        .then(data => data.remove())
        .catch(err => {
            res = {
                state: 0,
                message: err
            }
        })

    ctx.body = res

    /* const commentId = ctx.params.id
    let isOK = true
    // 文章的计数器 -1
    let articleId, uid
    // 删除评论
    await Comment.findById(commentId, (err, data) => {
        if(err){
            console.log(err)
            isOK = false
            return
        }else{
            articleId = data.article
            uid = data.from
        }
    })

    await Article.updateOne({_id: articleId}, {$inc: {commentNum: -1}})

    await User.updateOne({_id: uid}, {$inc: {commentNum: -1}})

    await Comment.deleteOne({_id: commentId})
    if (isOK) {
        ctx.body = {
            state: 1,
            message: '删除成功'
        }
    } */
}