const axios = require('axios');

const { authenticate, generateToken } = require('../auth/authenticate');

const bcrypt = require("bcryptjs");
const Users = require('../users/users-model.js');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login, generateToken);
  server.get('/api/jokes', authenticate, getJokes);
};

async function register(req, res) {
  try {
    const user = req.body;
    const hash = bcrypt.hashSync(user.password, 4);
    user.password = hash;
    const saved = await Users.add(user);
    res.status(201).json(saved)
  } catch (error) {
    res.status(500).json({ message: "Error Registering" })
  }
}

async function login(req, res) {
  try {
    let { username, password } = req.body;
    const user = await Users.findBy({ username }).first()
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({ 
            message: `Welcome ${user.username}!`,
            token,
     });
    } else {
        res.status(401).json({ message: 'Invalid Credentials' })
    }
} catch (error) {
    res.status(500).json({ message: 'Error Logging In' })
}
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}