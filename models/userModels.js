const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const usershema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
})

usershema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    next();
})


const User = mongoose.model('users', usershema);

module.exports = User;