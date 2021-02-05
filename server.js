const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const app = express();

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1', // this number '127.0.0.1' means localhost
    user : 'postgres',
    password : 'mrdance11',
    database : 'faceapp'
  }
});

// db.select('*').from('users').then(data => {
// 	console.log(data)
// });

// In order to parse the info from the page to server we need to use this:
app.use(bodyParser.json()); // and further in the code call it with .body method
app.use(cors()); // to be able to use chrome for localhost requests

// temporary database jus to check whether the name and password is working - keep checking by Postman

/* Here I plan how my API will look

/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = new user data
/profile/:userId --> GET = user data
/image --> PUT -- user data
*/

// fake database for testing
const database = {
	users: [
		{
			id: '123',
			name: 'Jano',
			email: 'john@gmail.com',
			password:'cookies',
			entries: 2,
			joined: new Date()
		},
		{
			id: '124',
			name: 'Sally',
			email: 'sally@gmail.com',
			password: 'bananas',
			entries: 0,
			joined: new Date()
		},
		{
			id: '125',
			name: 'Jano',
			email: 'john@gmail.com',
			password:'sracka',
			entries: 45,
			joined: new Date()
		}
	]
}

// root directory - will show us all the registered users in the database
app.get('/', (req, res) => {
	res.send(database.users);
})

// SIGN IN
app.post('/signin', (req, res) => {
	// if I enter correct password from postman POST request to signin:
	bcrypt.compare(req.body.password, '$2a$10$oOGBN9acdCXq6IS3n.hDJ.jaJLk1OT27blHUOwaIkXkCBVwlIeRJ2', function(err, res) {
    console.log('first',res)
  });

  // if I enter wrong password
  bcrypt.compare("cooks", '$2a$10$oOGBN9acdCXq6IS3n.hDJ.jaJLk1OT27blHUOwaIkXkCBVwlIeRJ2', function(err, res) {
    console.log('second',res)
  });

	if (req.body.email === database.users[2].email &&
		req.body.password === database.users[2].password) {
		res.json(database.users[2]) // replacing .send with .json will result in sending the JSON format values instead just the standard data values
} else {
		res.status(400).json('error logging In') // .status is to generate the status code (400)and logs the message
	};
})

// REGISTER
app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	db('users')
		.returning('*') // this ensures the user data will be returned (all '*')
		.insert({
			email: email,
			name: name,
			joined: new Date()
		}).then(user => {
			res.json(user[0]);
		}).catch(err => 
					res.status(400).json('user exist')); // if I would put err in the json response I would get all the user data back - security issue, we can not send user data through internet, co instead we respond with 'unable to join'
});

//GET USER DATA
app.get('/profile/:id', (req, res) => {
	const { id } = req.params; // need to find user by id to get his data
	db.select('*').from('users')
		.where({id: id})
		.then(user => {
			if (user.length) {
				res.json(user)
			} else {
				res.status(400).json('not found')
			}
		})	
		.catch(err => {res.status(400).json('error getting user')})
})

//UPDATE IMAGE COUNT
app.put('/image', (req, res) => {
	const { id } = req.body; // need to find user by using id again
	db.select('*'). from('users')
		.where({id: id})
		.increment('entries', 1) // increments the count of entries by one
		.returning('entries')
		.then(entries => {
			res.json(entries)
		})
		.catch(err => {
			res.status(400).json('unable to get count')
		})
})

app.listen(3000, () => {
	console.log('app is running on port 3000')
})

