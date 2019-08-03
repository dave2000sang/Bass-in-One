
console.log("SPEED SCRIPT LOADED")

var video = document.getElementsByTagName('video')[0]


video.playbackRate = 0.5
console.log("video plabackRate = " + video.playbackRate)

video.addEventListener('ratechange', function(e) {
	console.log(e.target.playbackRate)
})

