const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const signin = require('./controllers/signin');
const register = require('./controllers/register');
const image = require('./controllers/image');
const profile = require('./controllers/profile');

const app = express();

const db = knex({
  client: 'pg',
  connection: {
    host : 'postgresql-crystalline-06815',
    user : 'postgres',
    password : 'mrdance11',
    database : 'faceapp'
  }
});

app.use(bodyParser.json()); 
app.use(cors()); 
app.get('/', (req, res) => {
	res.send('it is working');
})

app.post('/signin', (req, res) => {signin.handleSignIn(req, res, db, bcrypt)})
app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)});
app.get('/profile/:id', (req, res) => {profile.handleProfile(req, res, db)});
app.put('/image', (req, res) => {image.handleImage(req, res, db)});
app.post('/imageurl', (req, res) => {image.handleAPICall(req, res)});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(process.env)
});
