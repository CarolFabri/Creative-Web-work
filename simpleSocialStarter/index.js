const express = require('express');
const app = express();
const path = require('path');

app.listen(3000, () => {
  console.log('http://localhost:3000');
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '/views', 'app.html'));
});

app.get('/getposts', (req, res) => {
  res.json({ posts: posts });
});

app.post('/newpost', (req, res) => {
  const newPost = { message: req.body.message, user: 'userX' };
  posts.push(newPost);
  res.sendFile(path.join(__dirname, 'views', 'app.html'));
 
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '/views', 'register.html'));
});

app.get('/logout', (req, res) => {
  res.sendFile(path.join(__dirname, '/views', 'logout.html'));
});

let posts = [
  { message: 'hello', user: 'user1' },
  { message: 'goodbye', user: 'user2' }
];

