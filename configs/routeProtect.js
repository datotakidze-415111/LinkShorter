const jwt = require('jsonwebtoken');

module.exports = {
    requireAuth: (req, res, next) => {
        if(req.cookies.jwt) {
            return next();
        } 
        res.redirect('/signin')
    },
    notRequireAuth: (req, res, next) => {
        if(!req.cookies.jwt) {
            return next();
        }
        res.redirect('/user-dashboard');
    }
}