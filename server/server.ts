const express: Function = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
app.listen(3000, () => {
    console.log ('listen on 3000 port')
})

let req  = app.use('/login', (req, res, next) => {
    if(req.query.email && req.query.pass) {
        fs.promises.readFile('db.json', 'utf-8')
        .then(data => {
           const users = JSON.parse(data).users;
           const user = users.find((user) => user.email === req.query.email && user.pass === req.query.pass);
           if (user) {
            console.log(user);
            console.log("Done!")
            const token = jwt.sign(user, 'secret', { expiresIn: '30d' });
            res.status(200).json({'userID': user.id, 'jwt': token});
           } else {
            console.log(Error('No user for login'));
            res.status(400).send({'Error': 'no user'});
           }
        });
        }
    else {
        res.status(400);
        console.log(Error('Some problem on login'));
    }
});

function findUser(email: string, pass: string): void {
    fs.promises.readFile('db.json', 'utf-8')
    .then(data => {
       const users = JSON.parse(data).users;
       const user = users.filter((user) => user.email === email && user.pass === pass);
       if(user[0]) {
        console.log(user[0]);
       } else {
           throw new Error('no user');
       }
    });
}


