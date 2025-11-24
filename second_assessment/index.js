const express = require('express');
const path = require('path');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const session = require('express-session');





const { getRandomMessage } = require('./utils/palm_reading_responses');


const app = express();


//views 
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));

//middleware 
app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({extended: true, limit:'5mb'}));
app.use(express.static(path.join(__dirname,'public')));




//local host server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));

app.get('/', (req, res) => {
  res.render('pages/reading_start'); 
  // ^ use the correct path to your EJS file
});

app.get('/reading_topic', (req, res) => {
  res.render('pages/reading_topic');
});


app.post('/reading/capture', (req, res) => {
  const { image } = req.body;
  console.log('Got image:', image?.slice(0, 50));
  res.json({ success: true });
});




app.post('/reading', (req,res)=>{
  const {topic} = req.body;
  const message = getRandomMessage(topic);
  if(!message) return res.status(400).json({error: 'Unknown Topic'});
  res.json({message});
});





