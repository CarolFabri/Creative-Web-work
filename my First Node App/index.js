const express = require('express');
const path = require('path');
const app = express();


app.listen(3000, () => console.log('listening on port 300'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/app',(req,res)=>{
    res.sendFile(path.join(__dirname,'/app.html'));
});
