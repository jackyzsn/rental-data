var express = require('express');
var router = express.Router();
var passport = require('passport');
var uuid = require('uuid');
var mongoose = require('mongoose');
var AuthToken = require('../models/authToken-model');
var moment = require('moment');

//auth with google - mobile
// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );

// Callback route for google - mobile
// router.get(
//   "/google/redirect",
//   passport.authenticate("google", { failureRedirect: "/auth/google" }),
//   (req, res) => {
//     var randomId = uuid.v4();
//     client.set(randomId, req.user.id, "EX", settings.redis.tokenExpire);

//     res.redirect("FindMyHouse://login?uuid=" + randomId);
//   }
// );

//auth with google - web
router.get(
  '/google/web',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    callbackURL: '/auth/google/redirect/web',
  })
);

// Callback route for google - web
router.get(
  '/google/redirect/web',
  passport.authenticate('google', {
    failureRedirect: '/auth/google/web',
    callbackURL: '/auth/google/redirect/web',
  }),
  (req, res) => {
    toRedirect(req, res);
  }
);

// Facebook auth - mobile
// router.get(
//   '/facebook',
//   passport.authenticate('facebook', {
//     scope: 'email',
//   })
// );

// Facebook callback - mobile
// router.get(
//   '/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
//   (req, res) => {
//     var randomId = uuid.v4();
//     client.set(randomId, req.user.id, 'EX', settings.redis.tokenExpire);

//     res.redirect('FindMyHouse://login?uuid=' + randomId);
//   }
// );

// Facebook auth - Web
router.get(
  '/facebook/web',
  passport.authenticate('facebook', {
    scope: 'email',
    callbackURL: '/auth/facebook/callback/web',
  })
);

// Facebook callback - web
router.get(
  '/facebook/callback/web',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/web',
    callbackURL: '/auth/facebook/callback/web',
  }),
  (req, res) => {
    toRedirect(req, res);
  }
);

function toRedirect(req, res) {
  // successful login then write to session table, then redirect to frontend
  var randomId = uuid.v4();

  const expiredAt = moment().add(30, 'seconds').format();

  new AuthToken({
    _id: new mongoose.mongo.ObjectId(),
    authCode: randomId,
    expiredAt: expiredAt,
  }).save(function (err) {
    if (err) {
      res.redirect(req.baseUrl);
    } else {
      res.header('Authorization', randomId);
      res.redirect(req.baseUrl);
    }
  });
}

module.exports = router;
