
class Background {
	constructor() {
		this.context = null
		this.tabId = null
		this.source = null
		this.biquad = null
		this.stream = null
	}

	initBoost(stream) {
		this.context = this.getContext()
		this.source = this.getSource(stream)
		this.biquad = this.getBiquad()

		// connect source -> biquad -> destination
		this.source.connect(this.biquad)
		this.biquad.connect(this.context.destination)
	}

	boostTab(value) {
		chrome.tabs.query({ active: true }, function (tabs) {
			chrome.tabCapture.capture({audio: true}, (response) => {
				if (background.stream !== null) {
					background.boost(background.stream, value)
				} else if (response !== null) {
					background.stream = response
					background.boost(background.stream, value)
				} else {
					chrome.runtime.sendMessage({
						subject: "Tab No Audio"
					})
				}
			})
		})
	}

	boost(stream, value) {
		this.initBoost(stream)
		this.updateBiquadGain(value)
	}

	updateBiquadGain(gain) {
		background.biquad.gain.value = gain
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

chrome.runtime.onMessage.addListener((message) => {
	console.log("message received" + message)
	background.tabId = message.tabId
	switch(message.action) {
		case "toggleBoost":
			background.boostTab(message.value)
			break
		default:
			console.log("Error, message did not match")
	}
})


const background = new Background()
