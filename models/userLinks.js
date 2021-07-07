const mongoose = require('mongoose');

const userLinks = new mongoose.Schema({
    userEmail: {
        type: String,
    },
    longUrl: {
        type: String,
    },
    urlCode: {
        type: String,
    },
    shortUrl: {
        type: String,
    },
    visitors: 0,
    date: {
        type: String,
        default: Date.now
    }
})

const linkShema = mongoose.model('userslinks', userLinks);

module.exports = linkShema;