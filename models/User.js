const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

const User = mongoose.model('User', UserSchema)


module.exports = User;