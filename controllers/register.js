const handleRegister = (req, res, db, bcrypt) => {
	const { email, name, password } = req.body;
	const ValidateEmail = (mail) => {			 
			 if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email))
			  {			  	
			    return (true)
			  }
			    res.status(400).json("You have entered an invalid email address!")	           
	}

	const ValidatePassword = (pass) => {
			if (password.length > 6) {
				return (true)
			} 
				res.status(400).json('Password must be longer than 6 characters')			 
	}

	if (!name || !email || !password) {
		return res.status(400).json('all fields must be filled')		
	} else if (ValidateEmail(true) && ValidatePassword(true)){
		const hash = bcrypt.hashSync(password); 
		db.transaction(trx => { 
			trx.insert({ 
				hash: hash,
				email: email
			})
			.into('login') 
			.returning('email')
			.then(loginEmail => { 
				return trx('users')
					.returning('*') 
					.insert({
						email: email,
						name: name,
						joined: new Date()
					})
					.then(user => {res.json(user[0]); 
					})
			}).then(trx.commit) 
				.catch(trx.rollback)
		}).catch(err => res.status(400).json('unable to register')); 
  } 
}

module.exports = {
	handleRegister
}