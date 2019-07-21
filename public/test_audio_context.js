function loadSound() {
	var request = new XMLHttpRequest()
	request.open("GET", "http://localhost:5000/stream/QuJGPMFGvKI", true)
	request.responseType = "arraybuffer"

	request.onload = function() {
		var Data = request.response
		process(Data)
	}
	request.send()
}

function process(Data) {
	var context = new AudioContext();
	source = context.createBufferSource()
	context.decodeAudioData(Data, function(buffer){
		source.buffer = buffer
		source.connect(context.destination)
		source.start(context.currentTime)
	})
}

