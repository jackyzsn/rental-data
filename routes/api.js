var express = require('express');
var router = express.Router();

router.post('/login', (req, res) => {
  console.log('... Login, Add user session.. ' + req.sessionID);
  var request = req.body.request;
  console.log('... request.. ' + JSON.stringify(request));
  var authCode = request.data.authCode;

  // Check authCode if it's in database

  var result = {};
  req.session.logged = true;
  req.session.user = name;

  req.session.save(); // write to redis session
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
      result.user = req.session.user;
    } else {
      result.status = '0';
      result.logged = false;
    }
  } else {
    console.log('... No session found..');
    result.status = '0';
    result.logged = false;
  }

  res.send(result);
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
