const express = require('express');
const bcrypt = require('bcryptjs');
const userModel = require('./users/userModel');

const server = express();

server.use(express.json());

server.post('/api/register', validateUser, async (req, res) => {
    try {
        const credentials = req.body;
        const hash = bcrypt.hashSync(credentials.password, 14);
        credentials.password = hash;
        let newUser = await userModel.insert(credentials);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: 'There was a problem saving the user to the database.' });
    }
});

server.get('/api/users', async (req, res) => {
    try {
        let users = await userModel.get()
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json();
    }
});

const port = 8000;

server.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});

function validateUser(req, res, next) {
    if (req.body) {
        if (req.body.username) {
            if (req.body.password) {
                next();
            } else {
                res.status(400).json({ message: 'Missing required password field.' });
            }
        } else {
            res.status(400).json({ message: 'Missing required username field.' });
        }
    } else {
        res.status(400).json({ message: 'Missing user data.' });
    }
}