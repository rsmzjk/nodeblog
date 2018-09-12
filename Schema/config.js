// 链接数据库 导出db Schema
const mongoose = require('mongoose')
const db = mongoose.createConnection('mongodb://localhost:27017/blogproject',{useNewUrlParser: true})

// 用原生ES6的 promise 代替 mongoose 自实现的 promise
mongoose.Promise = global.Promise

// 把 mongoose 的 Schema 取出来
const Schema = mongoose.Schema

db.on('error', () => {
    console.log('数据库链接失败,请重新尝试!')
})

db.on('open', () => {
    console.log('blogproject 数据库链接成功')
})

module.exports = {
    db,
    Schema
}
  