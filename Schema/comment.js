const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId

const CommentSchema = new Schema({
    // 头像 用户名 文章  内容
    content: String,
    // 关联到 user 集合
    from: {
        type: ObjectId,
        ref: 'users'
    },
    // 关联到 article 集合
    article: {
        type: ObjectId,
        ref: 'articles'
    }
}, { 
    versionKey: false,
    timestamps:{
        createdAt: 'created', 
    }
})

// 设置 comment 的remove 钩子
CommentSchema.post('remove', doc => {
    // 当前这个回调函数 一定会在remove 事件执行触发
    const Article = require('../Models/article')
    const User = require('../Models/user')
    const { from, article } = doc
    // 对应文章的评论数 -1
    Article.updateOne({_id: article}, {$inc: {commentNum: -1}}).exec()

    // 当前被删除评论的作者 commentNum -1
    User.updateOne({_id: from}, {$inc: {commentNum: -1}}).exec()

})


module.exports = CommentSchema