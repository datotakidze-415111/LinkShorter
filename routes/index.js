var express = require('express');
var router = express.Router();
var inUpControllers = require('../controllers/signin.signup.controllers');
var {requireAuth, notRequireAuth} = require('../configs/routeProtect');

// ===== Only Get Routers =====
router.get('/signin', notRequireAuth, inUpControllers.signInGet);
router.get('/signup', notRequireAuth, inUpControllers.signUpGet);

router.get('/guest-dashboard',  notRequireAuth, inUpControllers.guestDashboardGet);
router.get('/user-dashboard', requireAuth, inUpControllers.userDashboardGet);

router.get('/your-links-list', requireAuth, inUpControllers.userLinksList)

router.get('/:code', inUpControllers.shortGuestLinkGet);

// ===== Only Post Routers =====

router.post('/signuper', inUpControllers.signUpPost);
router.post('/signiner', inUpControllers.signInPost);

router.post('/guestLinkShorter', inUpControllers.guestLinkShorter)
router.post('/logout', inUpControllers.LogOutPost);

router.post('/deleteShortLink/:id', inUpControllers.DeleteShortLinkPost);

module.exports = router;
