const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type:String, unique: true},
    password: String,
    firstname: String,
    lastname: String,
    isAdmin: Boolean
});

module.exports = mongoose.model('User',userSchema);