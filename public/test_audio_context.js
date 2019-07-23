
// Web Audio API
var context = new AudioContext()

// create biquad filter
var biquadFilter = context.createBiquadFilter()
biquadFilter.type = "lowpass"
biquadFilter.frequency.value = 700
biquadFilter.gain.value = 0

document.addEventListener('DOMContentLoaded', function() {
	initClickHandlers()
	console.log(context)
})

function initClickHandlers() {
	loadButton = document.getElementById('load_button')
	equalizer = document.getElementById('equalizer')

	loadButton.addEventListener('click', function() {
		loadSound()
	})

	equalizer.addEventListener('change', function() {
		biquadFilter.gain.value = equalizer.value;
	})
}

function loadSound() {
	var request = new XMLHttpRequest()
	request.open("GET", "http://localhost:3000/stream/QuJGPMFGvKI", true)
	request.responseType = "arraybuffer"

	request.onload = function() {
		var Data = request.response
		process(Data)
	}
	request.send()
}

function process(Data) {
	source = context.createBufferSource()
	context.decodeAudioData(Data, function(buffer){
		source.buffer = buffer


		
		// connect source -> biquadfilter -> destination
		source.connect(biquadFilter)
		biquadFilter.connect(context.destination)

		// start audio
		source.start(context.currentTime)
	})
}
