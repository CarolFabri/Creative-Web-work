const express = require('express');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const session = require('express-session');
require('dotenv').config();              
const OpenAI = require('openai'); 
const userModel = require('./models/userModel');
const PalmReading = require('./models/palmReadingDB');
const ChatSession = require('./models/chatSession');


const vision =require('@google-cloud/vision');

const visionClient = new vision.ImageAnnotatorClient();

//const { getRandomMessage } = require('./utils/palm_reading_responses');
//const { message, topic } = req.body;



const app = express();


//views 
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));

//middleware 
app.use(express.urlencoded({extended: true, limit:'5mb'}));
app.use(express.static('public'));

app.use(express.json({ limit: '5mb' }));





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

mongoose.connect(connectionString,{ dbName: 'second_assessment' }) 
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

//palm reader  randompick
async function getRandomMessageFromDB(topic) {
  const docs = await PalmReading.find({ topic });

  if (!docs || docs.length === 0) return null;

  const doc = docs[0];

  if (!doc.messages || doc.messages.length === 0) return null;

  const i = Math.floor(Math.random() * doc.messages.length);
  return doc.messages[i];
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



//openAi chatbot 
const client = new OpenAI({                
  apiKey: process.env.OPENAI_API_KEY
});

app.get('/', (req, res) => {
  res.render('pages/home', { 
    errorMessage: null,
   // isLoggedIn: checkLoggedInState(req)
  });
});
app.get('/home', (req, res) => {
  res.render('pages/home', { 
    errorMessage: null,
   // isLoggedIn: checkLoggedInState(req)
  });
});
app.get('/login', (req, res) => {
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

app.get('/history_chat', async (req,res) => {
  const username = req.session.username;
  if(!username){
    return res.render('pages/history_chat',{messages:[]})
  }
  const session = await ChatSession.findOne({ username }).sort({ _id: -1 });
if(!session){
    return res.render('pages/history_chat',{messages:[]})
  }
  res.render('pages/history_chat',{messages: session.messages})
});
// app.post('/start', (req, res) => {
//   console.log(req.body);
//   res.json({ success: true });
// });

app.get('/finish',(req,res) =>{
  res.render('pages/finish');
});


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

  

app.post('/reading', async (req, res) => {
  const { topic } = req.body;
  //const topic = (req.body.topic || '').toLowerCase().trim();

    if (!topic) {
      return res.status(400).json({ error: 'No topic provided' });
    }

  const message = await getRandomMessageFromDB(topic);  

  if (!message) {
    return res.status(400).json({ error: "Unknown Topic" });
  }

  res.json({ message });
});
// app.post('/reading', async (req, res) => {
//   try {
//     const topic = (req.body.topic || '').toLowerCase().trim();

//     const allowed = ['love', 'career', 'health'];
//     if (!allowed.includes(topic)) {
//       return res.status(400).json({ error: `Unknown Topic` });
//     }

//     const message = await getRandomMessageFromDB(topic);

//     if (!message) {
//       return res.status(400).json({ error: `No messages found for topic: ${topic}` });
//     }

//     res.json({ message });

//   } catch (err) {
//     console.error('Error in /reading:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });






app.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body; //get message send from the frontend user

    const username =req.session.username;
    if(!username){
      return res.status(400).json({ error: 'No message provided' });
    }

    if (!message) { //if no message send error
      return res.status(400).json({ error: 'No message provided' });
    }
// This is where we ask AI for reply
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
-Come closer, miri chaj… miri raklo… my child.”
-The old fortune reader lifts your hand softly, her fingers cool like moonlight.

-Ahh… dikh… look here,” she whispers, brushing the centre of your palm.
-The Drom e Zor — the Path of Strength — runs deep within you. It tells me you have walked through shadows that others never saw… yet you carry the fire still burning inside.”

Her bracelets chime like tiny spirits as she turns your hand.

“Your Lachi Bacht, your good fortune, is awakening.”
She closes her eyes, inhaling as if hearing something ancient.
“You will soon stand at a doorway… two choices, both wrapped in destiny. One path will call to your heart, the other to your fear.
Choose the one that makes your chest feel warm — that is your bacht, your blessing.”

Her finger traces a faint line near your thumb.

“Here… the Rom Baro, the Great Spirit, shows me someone entering your life — or returning.”
She smiles knowingly.
“A presence of comfort, but also of challenge. Do not push this soul away. They carry a mirror for you… one you have long avoided.”

She taps lightly at the end of your life line.

“And this… this is your change.”
A candle flickers as she speaks, almost on cue.
“In three moons… maybe less… a shift comes. Something inside you will say, ‘Avri, avri… enough.’
You will leave behind what no longer feeds your spirit, and when you do, the world will open to you like a curtain pulled wide.”

She releases your hand gently, palms pressed together.

“Go with peace, miri pori… go with courage.”
“Your future is not written in stone — only in flame. And your flame burns bright.”
        `
        },
        {
          role: 'user',
          content: message
        }
      ]
    });
//the AI reply 
   const aiReply = completion.choices[0].message.content;

    // Find latest session or create one
  let session = await ChatSession.findOne({ username }).sort({ createdAt: -1 });

if (!session) {
  session = new ChatSession({
    username,
    createAI: true,   // or remove if you made it optional
    messages: []
  });
}

    // Save BOT message
    session.messages.push({
      sender: 'fortuneTeller',
      text: aiReply
    });

    // Save to MongoDB
    await session.save();

    //  Send reply to browser
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





app.get('/logout', (req, res) => {
  res.render('pages/loggedout', { isLoggedIn: false});
});






