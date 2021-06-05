require('dotenv').config({ path: './.env' });
var express = require('express');
var path = require('path');
var logger = require('morgan');
var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');
var session = require('express-session');
var passport = require('passport');
var http = require('http');
var app = express();
var mongoose = require('mongoose');
require('./config/passport');
const schedule = require('node-schedule');
const slowDown = require('express-slow-down');
const emailService = require('./services/email-notification');

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});

//  apply to all requests -- too fast to run out.
//app.use(speedLimiter);

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure session
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

// Connect Mongo DB
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
    ':req[x-forwarded-for] [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms ":referrer" ":user-agent"'
  )
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Node routers
app.use('/api', apiRouter);
app.use('/auth', authRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Else routes go to static REACT app
app.use(express.static('dist'));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

//Scheduler
const job = schedule.scheduleJob(process.env.emailSchedule, function () {
  emailService.checkAndSend();
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

// start http server
var httpServer = http.createServer(app);

httpServer.listen(process.env.serverPort, () => {
  console.log('HTTP Server running on port ' + process.env.serverPort);
});

module.exports = app;
