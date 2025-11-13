// index.js
const express = require('express');
const app = express();
const path = require('path');
const users = require('./models/users');
const posts = require('./models/posts');

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

app.listen(3000, () => {
  console.log('http://localhost:3000');
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

app.get('/app', checkLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'app.html'));
});

app.get('/getposts', (req, res) => {
  res.json({ posts: posts.getLastNPosts() });
});

app.post('/newpost', (req, res) => {
  posts.addPost(req.body.message, req.session.username);
  res.sendFile(path.join(__dirname, 'views', 'app.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', (req, res) => {
  if (users.addUser(req.body.username, req.body.password)) {
    return res.sendFile(path.join(__dirname, 'views', 'login.html'));
  }

  res.sendFile(path.join(__dirname, 'views', 'registration_failed.html'));
});

app.post('/login', (req, res) => {
  if (users.checkUser(req.body.username, req.body.password)) {
    req.session.username = req.body.username
    res.sendFile(path.join(__dirname, 'views', 'app.html'));
  } else {
    console.log('login failed');
    res.sendFile(path.join(__dirname, 'views', 'login_failed.html'));
  }

});

app.get('/logout', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'logout.html'));
});

