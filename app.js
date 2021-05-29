var express = require('express');
var path = require('path');
var logger = require('morgan');
var apiRouter = require('./routes/api');
var session = require('express-session');
var http = require('http');
var app = express();
var mongoose = require('mongoose');

require('dotenv').config({ path: './.env' });

const slowDown = require('express-slow-down');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});

//  apply to all requests
app.use(speedLimiter);

app.use(
  session({
    secret: process.env.cookieEncryptKey,
    cookie: {
      path: '/',
      httpOnly: false,
      secure: false,
      maxAge: process.env.cookieMaxAge * 1000 * 60,
    },
    saveUninitialized: true,
    resave: false,
    rolling: true,
  })
);

try {
  mongoose.connect(
    process.env.mongoUrl,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      poolSize: 10,
      family: 4,
    },
    () => {
      console.log('Connected to mongodb..');
    }
  );
} catch (e) {
  console.log('MongDB could not connect..');
}

app.use(
  logger(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms ":referrer" ":user-agent"'
  )
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('dist'));

app.use('/api', apiRouter);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var httpServer = http.createServer(app);

httpServer.listen(process.env.serverPort, () => {
  console.log('HTTP Server running on port ' + process.env.serverPort);
});

module.exports = app;
