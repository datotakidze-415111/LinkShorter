const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    urlCode: {
        type: String
    },
    longUrl: {
        type: String
    },
    shortUrl: {
        type: String
    },
    userIp: {
        type: String
    },
    data: {
        type: Date,
        default: Date.now,
    }
})

const guest = mongoose.model('guest', guestSchema);

module.exports = guest;

