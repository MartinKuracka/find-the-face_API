const Clarifai = require('clarifai');

let app = new Clarifai.App({apiKey: '0d1a8485d84b452cb18e6d822cfc78e2'});

const handleAPICall = (req, res) => {
	app.models.predict(Clarifai.FACE_DETECT_MODEL,req.body.input)
		.then(data => {
			res.json(data);
		})
		.catch(err => {
			res.status(400).json('Problem fetching API')
		})

}


const handleImage = (req, res, db) => {
	const { id } = req.body; 
	db.select('*'). from('users')
		.where({id: id})
		.increment('entries', 1)
		.returning('entries')
		.then(entries => {
			res.json(entries)
		})
		.catch(err => {
			res.status(400).json('unable to get count')
		})
}

module.exports = {
	handleImage, handleAPICall
}