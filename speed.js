console.log("SPEED SCRIPT LOADED")

var video = document.getElementsByTagName('video')[0]

document.addEventListener('keydown', e => {
	if (e.key === ".") {
		video.playbackRate += 0.1
	} else if (e.key === ",") {
		video.playbackRate -= 0.1
	} else if (e.key === "r") {
		video.playbackRate = 1.00
	}
})
