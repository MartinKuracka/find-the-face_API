const handleProfile = (req, res, db) => {
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
}

module.exports = {
	handleProfile
}