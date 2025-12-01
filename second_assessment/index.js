const express = require('express');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const session = require('express-session');
require('dotenv').config();              
const OpenAI = require('openai'); 
const userModel = require('./models/userModel');

const vision =require('@google-cloud/vision');

const visionClient = new vision.ImageAnnotatorClient();

const { getRandomMessage } = require('./utils/palm_reading_responses');
//const { message, topic } = req.body;



const app = express();


//views 
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));

//middleware 
app.use(express.urlencoded({extended: true, limit:'5mb'}));
app.use(express.static('public'));

app.use(express.json({ limit: '5mb' }));


//local host server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));


const sessions = require('express-session');

const threeMinutes = 3 * 60 * 1000;
const oneHour = 1 * 60 * 60 * 1000;

app.use(sessions({
  secret: "this is a secret",
  saveUninitialized: true,
  cookie: { maxAge: threeMinutes },
  resave: false
}));

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!(req.session && req.session.username);
  res.locals.errorMessage = null;
  next();
});

app.set('view engine', 'ejs');

const mongoose = require("mongoose");

const mongoDBPassword = process.env.MONGODB_PASSWORD;
const mongoDBUser = process.env.MONGODB_USERNAME;
const mongoDBAppName = process.env.MONGODB_MYAPPNAME;

// build the URI using the ENV variables
const connectionString = `mongodb+srv://${mongoDBUser}:${mongoDBPassword}@cluster0.l8bm6h3.mongodb.net/?appName=${mongoDBAppName}`;

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

//hand detect help functions 

function base64ToBuffer(dataUrl){
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}
async function isHandInImage(imageBuffer) {
  const [result] = await visionClient.labelDetection({ image: { content: imageBuffer } });
  const labels = result.labelAnnotations || [];

  return labels.some(l =>
    ['hand', 'palm', 'finger', 'wrist'].includes(l.description.toLowerCase())
  );
}






//function for login

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





//openAi chatbot 
const client = new OpenAI({                // ✅ create the client here
  apiKey: process.env.OPENAI_API_KEY
});

app.get('/', (req, res) => {
  res.render('pages/login', { 
    errorMessage: null,
    isLoggedIn: checkLoggedInState(req)
  });
});

app.get('/reading_start', (req, res) => {
  res.render('pages/reading_start');
});



app.get('/reading_topic', (req, res) => {
  res.render('pages/reading_topic');
});

app.get('/chatbot', (req, res) => {
  res.render('pages/chatbot');
});

// app.post('/start', (req, res) => {
//   console.log(req.body);
//   res.json({ success: true });
// });


app.post('/reading/capture', async (req, res) => {
  // const { image } = req.body;
  // console.log('Got image:', image?.slice(0, 50));
  // res.json({ success: true });
  try {
    const { image } = req.body;

    if (!image) {
      return res.json({
        success: false,
        message: 'No image received, please try again.'
      });
    }

    const imgBuffer = Buffer.from(image.split(',')[1], 'base64'); //webcam send base64 image string we convert this to buffer 
    const handFound = await isHandInImage(imgBuffer); // in here we're sending the buffer to the google API 

    return res.json({ success: handFound });

  } catch (err) {
    console.error('Error in /reading/capture:', err);
    return res.json({
      success: false,
      message: 'Server error analysing image.'
    });
  }
});

  

app.post('/reading', (req,res)=>{
  const {topic} = req.body;
  const message = getRandomMessage(topic);
  if(!message) return res.status(400).json({error: 'Unknown Topic'});
  res.json({message});
});

app.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-nano',
    messages: [
        {
          role: 'system',
          content: `
You are a mystical fortune reader.

You ONLY talk about these 3 topics:
Love
Career
Health
RULES:
- If the user asks something unrelated, gently redirect them back.
- Example: “I can only read your love, career, or health energy. Which path shall we explore?”
- Speak in short magical sentences.
- Never give medical or financial guarantees.
- This is for entertainment only.
        `
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    const aiReply = completion.choices[0].message.content;
    res.json({ reply: aiReply });

  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ error: 'Something went wrong talking to OpenAI.' });
  }
});


app.get('/app', checkLoggedIn, async (req, res) => {
  //res.sendFile(path.join(__dirname, 'views', 'app.html'));
  res.render('pages/app', {
    isLoggedIn: checkLoggedInState(req),
    username: req.session.username,
   // posts: await posts.getLastNPosts(3)
  })
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
 // const adminPosts= await posts.getLastNPosts(3); // showing only last 3 posts to avoid code to break and be overloaded with too many post 
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
     // posts: await posts.getLastNPosts(3)
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



app.get('/logout', (req, res) => {
  res.render('pages/loggedout', { isLoggedIn: false});
});






