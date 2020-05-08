const express = require('express');
const fs = require('fs');

const app = express();
app.listen(3000, () => {
    console.log ('listen on 3000 port')
})


let req  = app.use('/login', (req, res, next) => {
    if(req.query.user && req.query.pass) {
        console.log(req.query.user);
        console.log(req.query.pass);
        next();}
    else {
        console.log('Some error on login');
    }    

}) 


fs.promises.readFile('db.json', 'utf-8')
    .then(data => console.log('Data', data));
