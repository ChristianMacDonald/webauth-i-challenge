const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const userModel = require('./users/userModel');

const server = express();

server.use(express.json());
server.use(session({
    name: 'notsession',
    secret: 'nobody tosses a dwarf!',
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      secure: false
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false
}));

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

server.post('/api/login', validateUser, async (req, res) => {
    try {
        let {username, password} = req.body;
        let user = await userModel.getByUsername(username).first();
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id;
            res.status(200).json({ message: `Welcome, ${username}!` });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'There was a problem logging in.' });
    }
});

server.get('/api/users', protect, async (req, res) => {
    try {
        let users = await userModel.get()
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json();
    }
});

server.get('/api/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({ error: 'There was a problem logging out.' });
            } else {
                res.status(200).json({ message: 'Goodbye.' });
            }
        });
    }
});

const port = 8000;

server.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});

async function restrict(req, res, next) {
    let {username, password} = req.headers;

    if (username && password) {
        try {
            let user = await userModel.getByUsername(username).first();
            if (user && bcrypt.compareSync(password, user.password)) {
                next();
            } else {
                res.status(401).json({ message: 'Invalid credentials.' });
            }
        } catch (err) {
            res.status(500).json({ error: 'There was a problem accessing restricted endpoint.' });
        }
    } else {
        res.status(400).json({ message: 'No credentials provided.' });
    }
}

function protect(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: `Invalid credentials. (req.session = ${req.session}, req.session.userId = ${req.session.userId})` });
    }
}

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