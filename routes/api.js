var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var AuthToken = require('../models/authToken-model');
var User = require('../models/user-model');
var AuthUser = require('../models/authUser-model');
var moment = require('moment');

router.post('/addsession', (req, res) => {
  console.log('... Login, Add user session.. ' + req.sessionID);
  var request = req.body.request;
  console.log('... request.. ' + JSON.stringify(request));
  var authCode = request.data.authCode;

  // Check authCode if it's in database
  AuthToken.findOne({ authCode: authCode }, function (err, authToken) {
    if (err) {
      // AuthCode not found, end
      console.log('... AuthCode not found: ' + authCode + ', not adding session..');
    }

    if (authToken) {
      var authCodeExpiry = moment(authToken.expiredAt);
      const now = moment();

      if (now.isBefore(authCodeExpiry)) {
        // Add session
        User.findById(authToken.userId, function (err, user) {
          if (err) {
            console.log('... User not found: ' + authToken.userId + ', not adding session..');
          }
          if (user) {
            req.session.logged = true;

            req.session.user = {
              id: user.id,
              name: user.firstName + ' ' + user.lastName,
              thumbnail: user.thumbnail,
            };

            // check if it's verified
            AuthUser.findOne({ userId: user.id }, function (error, authUser) {
              if (error) {
                console.log('... AuthUser not found: ' + authToken.userId + '..');
              }
              if (authUser) {
                req.session.verified = authUser.verified ? authUser.verified : false;
                req.session.isAdmin = authUser.isAdmin ? authUser.isAdmin : false;
              }
              req.session.save();
              console.log('... Session added for : ' + authCode);
            });
          }
        });
      } else {
        // AuthCode expired..
        console.log('... AuthCode expired: ' + authCode + ', not adding session..');
      }
    } else {
      // AuthCode not found, end
      console.log('... AuthCode invalid: ' + authCode + ', not adding session..');
    }
  });

  var result = {};

  result.status = '0';
  res.send(result);
});

router.post('/checksession', (req, res) => {
  console.log('... Check user session: ' + req.sessionID);

  var result = {};
  if (req.session) {
    if (req.session.logged) {
      result.status = '0';
      result.logged = true;
      result.verified = req.session.verified ? req.session.verified : false;
      result.isAdmin = req.session.isAdmin ? req.session.isAdmin : false;
      result.user = req.session.user;
    } else {
      result.status = '0';
      result.logged = false;
      result.verified = false;
      result.isAdmin = false;
    }
  } else {
    console.log('... No session found..');
    result.status = '0';
    result.logged = false;
    result.verified = false;
    result.isAdmin = false;
  }

  res.send(result);
});

router.post('/verify', (req, res) => {
  console.log('... Verify request .. ');

  var request = req.body.request;
  var note = request.data.note;

  var result = {};
  if (req.session && req.session.logged && req.session.user) {
    AuthUser.findOne({ userId: req.session.user.id }, function (err, authUser) {
      if (authUser) {
        // existing user, update request
        if (!authUser.verified) {
          authUser.verifyRequest = note;
          authUser.save();
        }
      } else {
        // save new user
        if (!err) {
          new AuthUser({
            _id: new mongoose.mongo.ObjectId(),
            userId: req.session.user.id,
            verifyRequest: note,
          }).save();
        }
      }
    });

    result.status = '0';
    res.send(result);
  } else {
    console.log('... Skip request, no session found .. ');
    res.send(401, 'Not Authorized!');
  }
});

router.post('/clearsession', (req, res) => {
  console.log('... Clear user session.. ' + req.sessionID);

  var result = {};
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      result.status = '9';
      res.send(result);
    } else {
      result.status = '0';
      res.send(result);
    }
  });
});

module.exports = router;
