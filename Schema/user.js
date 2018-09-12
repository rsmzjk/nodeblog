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

UserSchema.post('remove', doc => {
    const Comment = require('../Models/comment')
    const Article = require('../Models/article')

    const { _id: uid } = doc
    Article
        .find({ author: uid })
        .then(data => {
            // console.log(3,data)
            data.forEach(data => {
                const { _id: artId } = data
                // 对应文章的评论数 -1
                Article.find({ _id: artId })
                    .then(data => {
                        data && data.forEach(v => v.remove())
                    })
                Comment.find({ article: artId })
                    .then(data => {
                        data && data.forEach(v => v.remove())
                    })
                Comment.find({ from: uid })
                    .then(data => {
                        data && data.forEach(v => v.remove())
                    })
            })
        })

    // console.log(2,uid)
    // let artId;
    // // 当前需要删除的用户的文章(包含不属于该用户的评论)及评论
    // Article.find()
    //     .then(data => {
    //         data.forEach((v, i) => {
    //             if (JSON.stringify(v.author) === JSON.stringify(userId)) {
    //                 artId = v._id
    //                 // 对应文章的评论数 -1
    //                 Article.find({ _id: artId }).then(data => data.forEach(v => v.remove()))
    //                 Comment.find({ from: userId }).then(data => data.forEach(v => v.remove()))
    //                 Comment.find({ article: artId }).then(data => data.forEach(v => v.remove()))
    //             }
    //         })
    //     })
})


module.exports = UserSchema