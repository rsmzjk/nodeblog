const { Schema } = require('./config')
const ObjectId = Schema.Types.ObjectId

const ArticleSchema = new Schema({
    title: String,
    content: String,
    author: {
        type: ObjectId,
        ref: 'users'
    },
    tips: String,
    commentNum: Number
}, { 
    versionKey: false,
    timestamps:{
        createdAt: 'created', 
    }
})

ArticleSchema.post('remove', doc => {
    const Comment = require('../Models/comment')
    const User = require('../Models/user')

    const { _id: artId, author: authorId } = doc
    // 只需要用户的 articleNum -1
    User.findByIdAndUpdate(authorId, { $inc: { articleNum: -1 } }).exec()
    // 把当前需要删除的文章所关联的所有评论  一次调用 评论 remove
    Comment.find({ article: artId })
        .then(data => {
            data.forEach(v => v.remove())
        })
})
/* ArticleSchema.post('remove', doc => {
    // 当前这个回调函数 一定会在remove 事件执行触发
    const Comment = require('../Models/comment')
    const User = require('../Models/user')

    const { _id: artId, author: authorId } = doc
    // 只需要用户的 articleNum -1 
    User.findByIdAndRemove(authorId, { $inc: { articleNum: -1 } }).exec()
    // 把当前需要删除的文章所关联的所有评论  一次调用 评论 remove
    Comment.find({ Article: artId })
        .then(data => {
            data.forEach(v => v.remove())
        })
}) */


module.exports = ArticleSchema