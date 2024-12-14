const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email : String,
    password : String,
    token: String,
    cities :[{ type: mongoose.Schema.Types.ObjectId, ref: 'cities' }]
})

const User = mongoose.model('users', userSchema)

module.exports = User;