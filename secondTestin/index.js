const express = require('express');
const path = require('path');
const app = express();


app.listen(400, () => console.log('listening on port 400'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'testTwo.html'));
});

app.get('/app',(req,res)=>{
    res.sendFile(path.join(__dirname,'/secondOne.html'));
});
