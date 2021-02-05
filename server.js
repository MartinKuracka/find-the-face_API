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
// const database = {
// 	users: [
// 		{
// 			id: '123',
// 			name: 'Jano',
// 			email: 'john@gmail.com',
// 			password:'cookies',
// 			entries: 2,
// 			joined: new Date()
// 		},
// 		{
// 			id: '124',
// 			name: 'Sally',
// 			email: 'sally@gmail.com',
// 			password: 'bananas',
// 			entries: 0,
// 			joined: new Date()
// 		},
// 		{
// 			id: '125',
// 			name: 'Jano',
// 			email: 'john@gmail.com',
// 			password:'sracka',
// 			entries: 45,
// 			joined: new Date()
// 		}
// 	]
// }

// root directory - will show us all the registered users in the database
app.get('/', (req, res) => {
	res.send(database.users);
})

// SIGN IN
app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('login')
	.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', req.body.email)
					.then(user => {
						res.json(user[0])
					})					
			} else {
				res.status(400).json('wrong password')
			}
		}).catch(err => res.status(400).json('wrong credentials'))
})

// REGISTER
app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password); // encrypts the entered password
	db.transaction(trx => { // I do transaction when I need more than one thing to execute (write in wo tables). I replace .db with .trx and use this to update both tables. 
		trx.insert({ //inserting these two into the login table
			hash: hash,
			email: email
		})
		.into('login') // pick the correct table - first one to write to
		.returning('email') // returning email from inserted info above to use further
		.then(loginEmail => { // then use this email as new property for other table 'users'
			return trx('users')
				.returning('*') // this ensures the user data will be returned (all '*')
				.insert({
					email: email,
					name: name,
					joined: new Date()
				})
				.then(user => {res.json(user[0]); // response from return part in json (in the user variable)
				})
		}).then(trx.commit) // then I have to commit in order to write the information to database after passing all the conditions above
			.catch(trx.rollback) //and if anything fails, I will get rollback - nothing will be commited
		}).catch(err => res.status(400).json('unable to register')); // if I would put err in the json response I would get all the user data back - security issue, we can not send user data through internet, co instead we respond with 'unable to join'
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

