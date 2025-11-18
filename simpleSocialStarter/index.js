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
      res.render('pages/notloggedin', {isLoggedIn: false});
      // res.sendFile(path.join(__dirname, '/views', 'notLoggedin.html;)) sending ejs file instead of html ! 
    }
  } else {
    req.session.destroy()
    res.render('pages/notloggedin', {isLoggedIn: false});
   // res.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
  }
}
function checkLoggedInState(req) {
  return req.session && req.session.username
}


function findUser(username) {
  return userModel.findUser(username);
}

function updateProfile (req){
  return req.session && req.session.username
}

async function checkAdmin(req, res,nextAction){
  try{
    if(!req.session||!req.session.username){
      return res.render('pages/notloggedin',{isLoggedIn:false});
      //return res.sendFile(path.join(__dirname,'/views','notloggedin.html'));
    }
    const user = await findUser(req.session.username);
    if(!user||!user.isAdmin){
      return res.render('pages/login', {
      errorMessage: "Access denied.Admins Only, login ",
      isLoggedIn: false
      });
    }
    req.currentUser=user;
    nextAction();
  } catch(err){
    console.error("Error checking admin status:",err);
    res.status(500).send("Internal server error");
  }
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
  res.render('pages/login', { errorMessage: null, isLoggedIn: checkLoggedInState(req) })
});


app.get('/register', (req, res) => {
  res.render ('pages/register', { isLoggedIn: checkLoggedInState(req)});
  //res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/profile',async (req,res)=>{
  if (!req.session.username){
     return res.redirect('/login'); 
    //return res.sendFile(path.join(__dirname, '/views', 'notloggedin.html')) from Dave's code, both code would redirect to login, but the redirect is shorter
  }
  const user = await findUser(req.session.username);
    res.render('pages/profile',{
      isLoggedIn: true,
      username: req.session.username,
      user: user
  });
});

app.get('/admin',checkAdmin,async(req,res)=>{
  try{
  const users= await userModel.getAllUsersWithoutPasswords(); // for security we don't want to show passwords even to admin 
  const adminPosts= await posts.getLastNPosts(3); // showing only last 3 posts to avoid code to break and be overloaded with too many post 
  res.render('pages/admin',{ // again used the same code used for login
    isLoggedIn: checkLoggedInState(req),
    users : users,
    posts: adminPosts

  });
} catch(err){
  console.error("Error loading admin page:",err);
  res.status(500).send("Internal server error");
  }  
});


app.post('/register', async (req, res) => {
  if (await userModel.addUser(req.body.username, req.body.password, req.body.firstname, req.body.lastname)) {
    res.render('pages/login', { isLoggedIn:false});
    //res.sendFile(path.join(__dirname, 'views', 'login.html'));
  } else {
    res.render ('pages/registration_failed', { isLoggedIn:true});
    //res.sendFile(path.join(__dirname, 'views', 'registration_failed.html'));
  }
});

app.post('/login', async (req, res) => {
  const user = await findUser(req.body.username);
  if (user && await userModel.checkUser(req.body.username, req.body.password)) {
    //added here the first name and lastname, not body but session.
    req.session.username  = user.username;
    req.session.firstname = user.firstname;
    req.session.lastname  = user.lastname;
    res.render('pages/app', {
      isLoggedIn: checkLoggedInState(req),
      username: req.session.username,
      posts: await posts.getLastNPosts(3)
    })
    //res.sendFile(path.join(__dirname, 'views', 'app.html'));
  } else {
    res.render('pages/login_failed', {isLoggedIn: false});
    //res.sendFile(path.join(__dirname, 'views', 'login_failed.html'));
  }

});
app.post('/profile', async (req, res) => {
  await userModel.updateProfile(
    //in here is where we update the profile, also not session but body I got confused a bit. Body is from the form, session is to keep the user logged in 
    req.session.username,
    req.body.firstname,
    req.body.lastname
  );

  const user = await findUser(req.session.username); // using the same funciton used for login, to get updated user info from CURRENT session username 

  res.render('pages/profile', { // used the same code from login to render the profile page with updated info
    isLoggedIn: checkLoggedInState(req),
    username: req.session.username,
    user: user
  });
});

app.post('/admin/deleteUser',checkAdmin, async(req,res)=>{ // I was trying to figure how to use the checkAdmin function here to avoid code repetition, perhaps I could combine with the deletePost function, but I left as is as it makes sense for me 
    const userId = req.body.userId;
    await userModel.deleteUserById(userId);
    res.redirect('/admin');
});

app.post('/admin/deletePost',checkAdmin, async(req,res)=>{
    const postId = req.body.postId;
    await posts.deletePostById(postId);
    res.redirect('/admin');
});

app.get('/logout', (req, res) => {
  res.render('pages/loggedout', { isLoggedIn: false});
});

