const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();
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

	if (req.body.email === database.users[0].email &&
		req.body.password === database.users[0].password) {
		res.json(database.users[0]) // replacing .send with .json will result in sending the JSON format values instead just the standard data values
} else {
		res.status(400).json('error logging In') // .status is to generate the status code (400)and logs the message
	};
})

// REGISTER
app.post('/register', (req, res) => {
	bcrypt.hash(req.body.password, null, null, function(err, hash) {
    console.log(hash)
  });
	database.users.push({ //to push new entry into the database
			id: '128',
			name: req.body.name,
			email: req.body.email,
			entries: 0,
			joined: new Date()
	});
	res.json(database.users[database.users.length - 1]); // this will get us the last entry in the database, last id.
});

//GET USER DATA
app.get('/profile/:id', (req, res) => {
	const { id } = req.params; // need to find user by id to get his data
	let found = false;
	database.users.forEach(user => {
		if (user.id === id) {
			found = true;
			return res.json(user); //I have to use return to finish the loop, not to continue to search
		} 
	})
	if (!found) {
		res.status(404).json('user not found')
	}
})

//UPDATE IMAGE COUNT
app.put('/image', (req, res) => {
	const { id } = req.body; // need to find user by using id again
	let found = false;
	database.users.forEach(user => {
		if (user.id === id) {
			found = true;
			user.entries++ // increases the entries count by 1
			return res.json(user.entries); //I have to use return to finish the loop, not to continue to search
		} 
	})
	if (!found) {
		res.status(404).json('user not found')
	}
})

app.listen(3000, () => {
	console.log('app is running on port 3000')
})

