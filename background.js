
class Background {
	constructor() {
		this.context = null
		this.tabId = null
		this.source = null
		this.biquad = null
		this.stream = null
		this.isBoosted = false
	}

	initBoost(stream) {
		this.context = this.getContext()
		this.source = this.getSource(stream)
		this.biquad = this.getBiquad()
		this.biquad.type = "lowshelf"
		this.biquad.frequency.value = 400	// hardcoded for now

		// connect source -> biquad -> destination
		this.source.connect(this.biquad)
		this.biquad.connect(this.context.destination)
	}

	resetBoost() {
		this.context = null
		this.source = null
		this.biquad = null
		this.stream = null
		this.isBoosted = false
		console.log("RESET")
	}

	boostTab(value) {
		// chrome.tabs.query({ active: true }, function (tabs) {
			chrome.tabCapture.capture({audio: true}, (response) => {
				if (background.stream !== null) {
					background.boost(background.stream, value)
				} else if (response !== null) {
					background.stream = response
					background.boost(background.stream, value)
				} else {
					alert("No Audio")
				}
			})
		// })
	}

	boost(stream, value) {
		this.initBoost(stream)
		this.updateBiquadGain(value)
		this.isBoosted = true
	}

	stopBoost(stream) {
		this.initBoost(stream)
		this.updateBiquadGain(0)
		console.log("outside callback")
		stream.getTracks()[0].stop()
		this.source = null
		this.stream = null
		this.isBoosted = false
	}

	updateBiquadGain(gain, callback) {
		background.biquad.gain.value = gain
		console.log(callback)
	}

	getContext() {
		if (this.context === null) {
			this.context = new AudioContext()
		}
		return this.context
	}

	getSource(source) {
		if (this.source === null) {
			this.source = this.getContext().createMediaStreamSource(source)
		}
		return this.source
	}

	getBiquad() {
		if (this.biquad === null) {
			this.biquad = this.getContext().createBiquadFilter()
		}
		return this.biquad
	}
}

// listener for popup events
chrome.runtime.onMessage.addListener((message) => {
	console.log("message: " + message.action)
	background.tabId = message.tabId
	switch(message.action) {
		case "toggleBoost":
			if (background.stream !== null) {
				background.boost(background.stream, message.value)
			}
			background.boostTab(message.value)
			break
		case "stopBoost":
			background.stopBoost(background.stream)
			background.resetBoost()
			break
		default:
			console.log("Error message did not match")
	}
})


const background = new Background()
