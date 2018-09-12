const { Schema } = require('./config')

const UserSchema = new Schema({
    username: String,
    password: String,
    role: {
        type: String,
        default: 1
    },
    avatar: {
        type: String,
        default: '/avatar/default.jpg'
    },
    articleNum: Number,
    commentNum: Number
}, {versionKey: false})

// 设置 user 的remove 钩子
UserSchema.post('remove', doc => {
    const Comment = require('../Models/comment')
    const Article = require('../Models/article')
    const User = require('../Models/user')
    const { _id } = doc // 被删除用户id

    Comment.find({from: _id}).then(data => {
        data.forEach(data => data.remove());
    })
    Article.find({author: _id}).then(data => {
        data.forEach(data => data.remove());
    })
})

module.exports = UserSchema