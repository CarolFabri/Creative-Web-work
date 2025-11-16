// index.js
const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/users');
const posts = require('./models/posts');
require('dotenv').config();

const sessions = require('express-session');
const cookieParser = require('cookie-parser');

const threeMinutes = 3 * 60 * 1000;
const oneHour = 1 * 60 * 60 * 1000;

app.use(sessions({
  secret: "this is a secret",
  saveUninitialized: true,
  cookie: { maxAge: threeMinutes },
  resave: false
}));

app.set('view engine', 'ejs');

const mongoose = require("mongoose");

const mongoDBPassword = process.env.MONGODB_PASSWORD;
const mongoDBUser = process.env.MONGODB_USERNAME;
const mongoDBAppName = process.env.MONGODB_MYAPPNAME;

// 👉 build the URI using the ENV variables
const connectionString = `mongodb+srv://${mongoDBUser}:${mongoDBPassword}@cluster0.1oldxnz.mongodb.net/?appName=${mongoDBAppName}`;

mongoose.connect(connectionString)
  .then(() => {
    console.log("MongoDB Atlas connected");
    app.listen(3000, () => {
      console.log("http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


function checkLoggedIn(req, res, nextAction) {
  if (req.session) {
    if (req.session.username) {
      nextAction()
    } else {
      req.session.destroy()
      res.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
    }
  } else {
    req.session.destroy()
    res.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
  }
}
function checkLoggedInState(req) {
  return req.session && req.session.username
}

app.get('/app', checkLoggedIn, async (req, res) => {
  //res.sendFile(path.join(__dirname, 'views', 'app.html'));
  res.render('pages/app', {
    isLoggedIn: checkLoggedInState(req),
    username: req.session.username,
    posts: await posts.getLastNPosts(3)
  })
});

app.get('/getposts', async (req, res) => {
  res.json({ posts: await posts.getLastNPosts() });
});

app.post('/newpost', async (req, res) => {
  posts.addPost(req.body.message, req.session.username);
  //res.sendFile(path.join(__dirname, 'views', 'app.html'));
  res.render('pages/app', {
    isLoggedIn: checkLoggedInState(req),
    username: req.session.username,
    posts: await posts.getLastNPosts(3)
  })
});

app.get('/login', (req, res) => {
  //res.sendFile(path.join(__dirname, 'views', 'login.html'));
  res.render('pages/login.ejs', { isLoggedIn: checkLoggedInState(req) })
});



app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', async (req, res) => {
  if (await userModel.addUser(req.body.username, req.body.password)) {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  } else {
    res.sendFile(path.join(__dirname, 'views', 'registration_failed.html'));
  }
});

app.post('/login', async (req, res) => {
  if (await userModel.checkUser(req.body.username, req.body.password)) {
    req.session.username = req.body.username
    res.render('pages/app', {
      isLoggedIn: checkLoggedInState(req),
      username: req.session.username,
      posts: await posts.getLastNPosts(3)
    })
    //res.sendFile(path.join(__dirname, 'views', 'app.html'));
  } else {
    //console.log('login failed');
    res.sendFile(path.join(__dirname, 'views', 'login_failed.html'));
  }

});

app.get('/logout', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'logout.html'));
});

