
document.addEventListener('load', () => {
	var context = new AudioContext()
	var biquad = context.createBiquadFilter()
	biquad.type = "lowpass"
	biquad.frequency.value = 700
	biquad.gain.value = 0

	var sourceStream = null
	// Capture active tab audio and create media stream source node
	chrome.tabs.query({ active: true }), function (tabs) {
		chrome.tabCapture.capture({audio: true}, (response) => {
			if (response === null) {
				console.log("Error capturing tab audio")
			} else {
				sourceStream = response
			}
		})
	}

	var sourceNode
	if (sourceStream !== null) {
		sourceNode = context.createMediaStreamSource(sourceStream)
		// connect source node to context destination
		source.connect(context.destination)
	}
})

// function getSourceNode(stream) {
// 	context = getContext()
// 	source = context.createMediaStreamSource(stream)
// }

// function getContext() {
// 	context = AudioContext()
// 	return context
// }