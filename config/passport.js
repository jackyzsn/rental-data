var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
var FacebookStrategy = require('passport-facebook');
var User = require('../models/user-model');
var mongoose = require('mongoose');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      // Option for Google strategy
      callbackURL: '/auth/google/redirect',
      clientID: process.env.googleClientId,
      clientSecret: process.env.googleClientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      // Check user exists?
      User.findOne({
        googleId: profile.id,
      }).then((currentUser) => {
        if (currentUser) {
          if (currentUser.thumbnail !== profile._json.picture) {
            currentUser.thumbnail = profile._json.picture;
            currentUser.save().then((user) => {
              done(null, user);
            });
          } else {
            done(null, currentUser);
          }
        } else {
          console.log('Profile: ' + JSON.stringify(profile));
          new User({
            _id: new mongoose.mongo.ObjectId(),
            userName: profile.displayName,
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            thumbnail: profile._json.picture,
            email: profile.emails[0].value.toLowerCase(),
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      // Option for Facebook strategy
      clientID: process.env.fackbookClientID,
      clientSecret: process.env.fackbookClientSecret,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['email', 'picture.type(large)', 'displayName', 'first_name', 'last_name'],
    },
    (accessToken, refreshToken, profile, done) => {
      // Check user exists?
      User.findOne({
        facebookId: profile.id,
      }).then((currentUser) => {
        if (currentUser) {
          if (currentUser.thumbnail !== profile.photos[0].value) {
            currentUser.thumbnail = profile.photos[0].value;
            currentUser.save().then((user) => {
              done(null, user);
            });
          } else {
            done(null, currentUser);
          }
        } else {
          console.log('Profile: ' + JSON.stringify(profile));
          if (profile.emails) {
            new User({
              _id: new mongoose.mongo.ObjectId(),
              userName: profile.displayName,
              facebookId: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              thumbnail: profile.photos[0].value,
              email: profile.emails[0].value.toLowerCase(),
            })
              .save()
              .then((newUser) => {
                done(null, newUser);
              });
          } else {
            new User({
              _id: new mongoose.mongo.ObjectId(),
              userName: profile.displayName,
              facebookId: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              thumbnail: profile.photos[0].value,
            })
              .save()
              .then((newUser) => {
                done(null, newUser);
              });
          }
        }
      });
    }
  )
);
