const express = require('express')
const app = express();
const ytdl = require('ytdl-core')
const path = require('path')

app.use(express.static(path.join(__dirname, '/public')))
console.log(path.join(__dirname, 'public'))

app.get('/', (req, res, next) => {
	res.send("in root route")
	next()	
})

app.get('/stream/:videoId', (req, res) => {
	console.log("hi stream")
	try {
		ytdl(req.params.videoId).pipe(res)
	} catch (e) {
		res.status(500).send(e)
	}
})

app.listen(3000, function() {
    console.log('Server running on port 3000');
})
