const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.listen(3000, () => {
    console.log('listen on 3000 port');
});
const readFile = (callback, returnJson = false, filePath = 'db.json', encoding = 'utf8') => {
    setTimeout(fs.readFile, 0, filePath, encoding, (err, data) => {
        if (err) {
            throw err;
        }
        callback(returnJson ? JSON.parse(data) : data);
    });
};
const writeFile = (fileData, callback, filePath = 'db.json', encoding = 'utf8') => {
    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            throw err;
        }
        callback();
    });
};

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', (req, res) => {
    if (req.query.email && req.query.pass) {
        console.log(req.query.email, req.query.pass);
        readFile((data) => {
            const users = JSON.parse(data).users;
            console.log(users);
            const user = users.find((singleUser) => singleUser.email === req.query.email
                && singleUser.pass === req.query.pass);
            if (user) {
                const token = jwt.sign(user, 'secret', { expiresIn: '30d' });
                res.status(200).json({ 'userID': user.id, 'jwt': token, 'userName': user.name });
            }
            else {
                console.log(Error('No user for login'));
                res.status(200).send({ Error: 'no user' });
            }
        });
    }
    else {
        res.status(400);
        console.log(Error('Some problem on login'));
    }
});
app.get('/', (req, res) => {
    function eventsLoading(currentUserObj) {
        readFile((data) => {
            const eventsUsersBase = JSON.parse(data).usersEvents.filter((item) => item.userID === currentUserObj.id);
            let eventsID = [];
            eventsUsersBase.forEach(item => eventsID.push(item.eventID));
            console.log(eventsID);
            const eventsBase = JSON.parse(data).events;
            let currentUserEvents = [];
            eventsID.forEach((item) => {
                eventsBase.forEach(event => {
                    if (event.id === item) {
                        currentUserEvents.push(event);
                    }
                });
            });
            console.log(currentUserEvents);
            res.status(200).send(currentUserEvents);
        });
    }
    if (req.headers.authorization) {
        let currentUser = jwt.verify(req.headers.authorization, 'secret');
        eventsLoading(currentUser);
    }
});
app.post('*/add', (req, res) => {
    readFile((data) => {
        let parsedData = JSON.parse(data);
        let eventsArray = parsedData.events;
        let eventsUserArray = parsedData.usersEvents;
        const newEventPosition = eventsArray.length;
        const newEventUserPosition = eventsUserArray.length;
        eventsArray[newEventPosition] = req.body.eventInfo;
        const eventId = req.body.eventInfo.id;
        let { userId, id } = req.body.eventInfo;
        eventsUserArray[newEventUserPosition] = { userID: userId, eventID: id };
        parsedData.events = eventsArray;
        parsedData.usersEvents = eventsUserArray;
        let invitedUsersData = (req.body.invitedInfo)
            .map(x => {
            let { iD } = x;
            return { userID: iD, eventID: eventId };
        });
        let concatArr = invitedUsersData.concat(eventsUserArray);
        let set = new Set(concatArr);
        console.log('invitedUsers', concatArr);
        parsedData.usersEvents = Array.from(set);
        data = JSON.stringify(parsedData, null, 2);
        writeFile(data, () => {
            res.status(200).send({ status: 'event added' });
        });
    });
});
app.post('*/edit', (req, res) => {
    readFile((data) => {
        let parsedData = JSON.parse(data);
        let index = null;
        (parsedData.events).forEach((x, i) => {
            if (x.id === req.body.event.id) {
                index = i;
            }
        });
        if (index + 1) {
            parsedData.events[index] = req.body.event;
        }
        let deletedParticipant = req.body.deletedUsers;
        let arr = parsedData.usersEvents;
        if (deletedParticipant.length) {
            deletedParticipant.forEach(item => {
                arr = parsedData.usersEvents.filter(x => {
                    if (x.userID === item.userID && x.eventID === item.eventID) {
                        return false;
                    }
                    return true;
                });
            });
        }
        let set = new Set(arr);
        parsedData.usersEvents = Array.from(set);
        data = JSON.stringify(parsedData, null, 2);
        setTimeout(writeFile, 0, data, () => {
            res.status(200).send({ status: 'invent edited' });
        });
    });
});
app.post('*/new-user', (req, res) => {
    readFile((data) => {
        let parsedData = JSON.parse(data);
        let newUserData = req.body;
        let usersBase = parsedData.users;
        if (usersBase.some((item) => {
            return item.email === newUserData.email;
        })) {
            res.status(200).send({ status: 'exist' });
            return;
        }
        newUserData.id = parsedData.users.length + 1;
        parsedData.users[parsedData.users.length] = newUserData;
        data = JSON.stringify(parsedData, null, 2);
        writeFile(data, () => {
            res.status(200).send({ status: 'ok' });
        });
    });
});
app.get('*/users-base', (req, res) => {
    readFile((data) => {
        let usersBase = JSON.parse(data).users;
        console.log('usersData', usersBase);
        res.status(200).send(usersBase);
    });
});
app.get('*/users-events-base', (req, res) => {
    readFile((data) => {
        let usersEventsBase = JSON.parse(data).usersEvents;
        console.log(usersEventsBase);
        res.status(200).send(usersEventsBase);
    });
});
app.post('*/delete-event', (req, res) => {
    readFile((data) => {
        let parsedData = JSON.parse(data);
        let usersEventsBase = parsedData.usersEvents;
        let { userID: delUser, eventID: delEvent } = req.body;
        parsedData.usersEvents = usersEventsBase
            .filter(x => {
            if (x.eventID === delEvent && x.userID === delUser) {
                return false;
            }
            else {
                return true;
            }
        });
        data = JSON.stringify(parsedData, null, 2);
        console.log(parsedData.usersEvents);
        writeFile(data, () => {
            res.status(200).send({ status: 'event deleted' });
        });
    });
});
