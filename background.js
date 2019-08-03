
class Background {
	constructor() {
		this.context = null
		this.tabId = null
		this.source = null
		this.biquad = null
		this.lowpass = null
		this.stream = null
		this.isBoosted = false
	}

	initBoost(stream) {
		this.context = this.getContext()
		this.source = this.getSource(stream)
		this.biquad = this.getBiquad()

		// init lowpass biquad filter
		this.lowpass = this.getLowpass()

		// connect source -> biquad -> destination
		this.source.connect(this.biquad)
		this.biquad.connect(this.lowpass)
		this.lowpass.connect(this.context.destination)
	}

	resetBoost() {
		this.context = null
		this.source = null
		this.biquad = null
		this.lowpass = null
		this.stream = null
		this.isBoosted = false
	}

	boostTab(value, type) {
		var boostFunction = null
		if (type === "toggleBoost") {
			boostFunction = this.boost.bind(this)
		} else {
			boostFunction = this.boostPass.bind(this)
		}
		// console.log(boostFunction)
		// chrome.tabs.query({ active: true }, function (tabs) {
			chrome.tabCapture.capture({audio: true}, (response) => {
				if (this.stream !== null) {
					boostFunction(this.stream, value)
				} else if (response !== null) {
					this.stream = response
					boostFunction(this.stream, value)
				} else {
					alert("No Audio")
				}
			})
		// })
	}

	boost(stream, value) {
		console.log(this)
		this.initBoost(stream)
		this.updateBiquadGain(value)
		this.isBoosted = true
	}

	boostPass(stream, value) {
		this.initBoost(stream)
		this.updatePassGain(value)
	}

	stopBoost(stream) {
		this.initBoost(stream)
		this.updateBiquadGain(0)
		stream.getTracks()[0].stop()		// stop mediastream track
		this.source = null
		this.stream = null
		this.isBoosted = false
	}

	setSpeed(speed) {
		if (this.source !== null) {
			this.source.playbackRate = speed
		} else {
			console.log("Cannot change speed - source is null")
		}
	}

	updateBiquadGain(gain) {
		this.biquad.gain.value = gain
	}

	updatePassGain(freq) {
		this.lowpass.frequency.value = freq
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
			this.biquad.type = "lowshelf"
			this.biquad.frequency.value = 400	// hardcoded for now
		}
		return this.biquad
	}

	getLowpass() {
		if (this.lowpass === null) {
			this.lowpass = this.getContext().createBiquadFilter()
			this.lowpass.type = "lowpass"
			this.lowpass.Q.value = "1"
		}
		return this.lowpass
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
			background.boostTab(message.value, "toggleBoost")
			break
		case "togglePass":
			background.boostTab(message.value, "togglePass")
			break
		case "stopBoost":
			background.stopBoost(background.stream)
			background.resetBoost()
			break
		case "setSpeed":
			background.setSpeed(message.value)
			break
		default:
			console.log("Error message did not match")
	}
})


const background = new Background()
