const user = require('../models/userModels');
const guest = require('../models/guestModels');
const userLinks = require('../models/userLinks');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validUrl = require('valid-url');
const shortId = require('shortid');
const jwtReader = require('jwt-decode');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_KEY, {
        expiresIn: process.env.JWT_EXPIRES
    })
}


// =============== Only Get Exports ===============

exports.signInGet = (req, res, next) => {
    const menuSwitcher = req.cookies.jwt
    res.render('../views/signin/signin.ejs', {
        menuSwitcher
    });
}

exports.signUpGet = (req, res, next) => {
    const menuSwitcher = req.cookies.jwt
    res.render('../views/signup/signup.ejs', {
        menuSwitcher
    });
}

exports.guestDashboardGet = (req, res, next) => {
    const menuSwitcher = req.cookies.jwt
    res.render('../views/geustDashboard/guestdashboard.ejs', {
        menuSwitcher
    });
}

exports.userDashboardGet = (req, res, next) => {
    const menuSwitcher = req.cookies.jwt
    res.render('../views/dashboard/dashboard.ejs', {
        menuSwitcher
    });
}

exports.shortGuestLinkGet = async (req, res, next) => {
    try {
        if(req.cookies.jwt) {
            await userLinks.find({urlCode: req.params.code}, (err, results) => {
                if(err) return console.log(err);

                userLinks.findOneAndUpdate({urlCode: req.params.code}, {$inc: {'visitors': 1}}, (err, results) => {
                    if(err) return console.log(err);
        
                    if(results) {
                        res.redirect(results.longUrl);
                    } else {
                        res.redirect('/user-dashboard');
                    }
                })
            })
        } else {
            await guest.findOne({ urlCode: req.params.code}, (err, results) => {
                if(err) return console.log(err);
    
                if(results) {
                    res.redirect(results.longUrl);
                } else {
                    res.redirect('/guest-dashboard');
                }
            })
        }
    } catch (err) {
        console.log(err);
        res.redirect('/guest-dashboard');
    }
}

exports.userLinksList = (req, res, next) => {
    const userId = jwtReader(req.cookies.jwt).id;
    const menuSwitcher = req.cookies.jwt
    user.findById({ _id: userId }, (err, results) => {
        if(err) return console.log(err);

        userLinks.find({ userEmail: results.email }, (err, results) => {
            if(err) return console.log(err);

            res.render('../views/userLinks/linksList.ejs', {
                results,
                menuSwitcher
            })
        })
    })
}

// =============== Only Post Exports ===============

exports.signUpPost = (req, res, next) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        req.flash('error_msg', 'please fill all fields');
        res.redirect('/signup')
    } 

    if(password.length < 5) {
        req.flash('error_msg', 'password should be 5 symbol');
        res.redirect('/signup')
    } else {
        user.find({ email: email }, (err, results) => {
            if(err) return console.log(err);

            console.log(results);
            
            if(results.length > 0) {
                req.flash('error_msg', 'this email arleady use');
                res.redirect('/signup')
            } else {
                var newUser = new user({
                    name,
                    email,
                    password
                })
                newUser.save((err) => {
                    if(err) return console.log(err);
                    req.flash('success_msg', 'success registration')
                    res.redirect('/signin');
                });
            }
        })
    }
}

exports.signInPost = (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        req.flash('error_msg', 'please fill all fields')
        res.redirect('/signin');
    } else {
        user.findOne({ email: email }, (err, results) => {
            if(err) return console.log(err);

            bcrypt.compare(password, results.password, (err, isMatch) => {
                if(err) return console.log(err);

                if(!isMatch) {
                    req.flash('error_msg', 'correct email or password');
                    res.redirect('/signin');
                } else {
                    const Token = signToken(results._id);

                    const CookieOptions = {
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 1000
                        ),
                        httpOnly: true
                    }

                    res.cookie('jwt', Token, CookieOptions);

                    req.flash('success_msg', 'success authorization');
                    res.redirect('/user-dashboard');
                }
            })
        })
    }
}

exports.guestLinkShorter = async (req, res, next) => {
    const { longUrl } = req.body;
    const baseUrl = 'http://localhost:3000';

    if(!validUrl.isUri(baseUrl)) {
        req.flash('error_msg', 'invalid base url');
        res.redirect('/dashboard');
    }

    const urlCode = shortId.generate();

    if(validUrl.isUri(longUrl)) {
        try {
            await guest.findOne({ longUrl }, async (err, results) => {
                if(err) return console.log(err);

                if(results) {
                    res.redirect('/dashboard');
                } else {
                    const shortUrl = baseUrl + '/' + urlCode;
    
                    if(req.cookies.jwt) {
                        const userId = jwtReader(req.cookies.jwt).id;
                        user.findById({ _id: userId }, async (err, results) => {
                            if(err) return console.log(err); 
                            
                            const userEmail = results.email;

                            const userlinks = new userLinks({
                                userEmail,
                                urlCode,
                                longUrl,
                                shortUrl
                            })

                            await userlinks.save();
                            req.flash('success_msg', 'success add short link');
                            res.redirect('/user-dashboard');
                        })
                    } else {
                        const guestlinks = new guest({
                            urlCode,
                            longUrl,
                            shortUrl
                        })
    
                        await guestlinks.save()
                        guest.findOne({ urlCode: urlCode}, (err, results) => {
                            if(err) return console.log(err);

                            if(results) {
                                req.flash('success_msg', `this is your link: ${results.shortUrl}`);
                                res.redirect('/guest-dashboard');
                            }
                        })
                        
                    }
                    
                }
            });
        } catch (err) {
            console.log(err);
            res.redirect('/guest-dashboard');
        }
    } else {
        console.log('invalid long url')
        res.redirect('/guest-dashboard')
    }
}

exports.LogOutPost = async (req, res, next) => {
    await res.clearCookie('jwt');
    res.redirect('/guest-dashboard');
}

exports.DeleteShortLinkPost = (req, res, next) => {
    const shortId = req.params.id;

    userLinks.findByIdAndDelete({ _id: shortId }, (err, results) => {
        if(err) return console.log(err);

        req.flash('success_msg', 'success delete short link');
        res.redirect('/your-links-list');
    })
}