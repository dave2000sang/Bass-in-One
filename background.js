
class Background {
	constructor() {
		this.context = null
		this.tabId = null
		this.source = null
		this.biquadNodes = []
		this.lowpass = null
		this.stream = null
		this.isBoosted = false
		this.tabStates = {}
	}

	initBoost(stream) {
		this.context = this.getContext()
		this.source = this.getSource(stream)
		this.biquadNodes = this.getBiquadNodes()

		// init lowpass biquad filter
		this.lowpass = this.getLowpass()

		// connect source -> biquad nodes -> destination
		this.source.connect(this.biquadNodes[0])
		for (var i = 0; i < this.biquadNodes.length - 1; i++) {
			this.biquadNodes[i].connect(this.biquadNodes[i+1])
		}
		this.biquadNodes[this.biquadNodes.length-1].connect(this.lowpass)
		this.lowpass.connect(this.context.destination)
	}

	resetBoost() {
		this.context = null
		this.source = null
		this.biquadNodes = []
		this.lowpass = null
		this.stream = null
		this.isBoosted = false
		background.saveState(background.tabId)
	}

	boostTab(value, type, eqIndex) {
		var boostFunction = null
		if (type === "toggleBoost") {
			boostFunction = this.boost.bind(this)
		} else {
			boostFunction = this.boostPass.bind(this)
		}
		// chrome.tabs.query({ active: true }, function (tabs) {
			chrome.tabCapture.capture({audio: true}, (response) => {
				if (this.stream !== null) {
					boostFunction(this.stream, value, eqIndex)
				} else if (response !== null) {
					this.stream = response
					boostFunction(this.stream, value, eqIndex)
				} else {
					alert("No Audio")
				}
			})
		// })
	}

	boost(stream, value, eqIndex) {
		this.initBoost(stream)
		this.updateBiquadGain(value, eqIndex)
		this.isBoosted = true
		background.saveState(background.tabId)
	}

	boostPass(stream, value, eqIndex) {
		this.initBoost(stream)
		this.updatePassGain(value, eqIndex)
	}

	stopBoost(stream) {
		if (stream == null) return
		this.initBoost(stream)
		// this.updateBiquadGain(0)
		stream.getTracks()[0].stop()		// stop mediastream track
		this.source = null
		this.stream = null
		this.isBoosted = false
		background.saveState(background.tabId)
	}
	updateBiquadGain(gain, index) {
		console.log(`gain = ${gain}, index = ${index}`)
		this.biquadNodes[index].gain.value = gain
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

	getBiquadNodes() {
		if (this.biquadNodes === undefined || this.biquadNodes.length == 0) {
			const freqValues = [60, 150, 250, 500, 1000, 3000, 8000]
			var biquadNodes = []
			freqValues.forEach((item, index) => {
				var node = this.getContext().createBiquadFilter()
				if (index == 0) {
					node.type = "lowshelf"
				} else if (index == freqValues.length - 1) {
					node.type = "highshelf"
				} else {
					node.type = "peaking"
				}
				node.frequency.value = item
				biquadNodes.push(node)
			})
			this.biquadNodes = biquadNodes
		}
		return this.biquadNodes
	}

	getLowpass() {
		if (this.lowpass === null) {
			this.lowpass = this.getContext().createBiquadFilter()
			this.lowpass.type = "lowpass"
			this.lowpass.Q.value = "1"
		}
		return this.lowpass
	}
	
	doOpened(tabId) {
		var storedState = this.tabStates[tabId]
		if (storedState !== undefined) {
			console.log("used state")
			this.useBackgroundState(storedState)
			// this.printTabStore()
		}
	}

	saveState(tabId) {
		console.log("save state")
		var state = this.tabStates[tabId]
		if (state == undefined) {
			state = {}
		}
		state.context = this.context
		state.tabId = this.tabId
		state.source = this.source
		state.biquadNodes = this.biquadNodes
		state.lowpass = this.lowpass
		state.stream = this.stream
		state.isBoosted = this.isBoosted

		this.tabStates[tabId] = state
	}

	useBackgroundState(background) {
		this.context = background.context
		this.tabId = background.tabId
		this.source = background.source
		this.biquadNodes = background.biquadNodes
		this.lowpass = background.lowpass
		this.stream = background.stream
		this.isBoosted = background.isBoosted
	}

	getNodeValues() {
		var nodes = this.biquadNodes
		var nodeValues = []
		if (nodes == undefined || nodes.length == 0) {
			nodeValues = [0, 0, 0, 0, 0, 0, 0] 
		} else {
			for (var key in nodes) {
				var node = nodes[key]
				nodeValues.push(node.gain.value)
			}
		}
		return nodeValues
	}

	printTabStore() {
		var tabStates = this.tabStates
		if (tabStates !== undefined) {
			Object.keys(tabStates).forEach((key) => {
				var state = tabStates[key]
				console.log(state.biquadNodes)
			})
		}
	}
}

// listener for popup events
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("tabId = " + message.tabId)
	background.tabId = message.tabId
	background.doOpened(message.tabId)
	switch(message.action) {
		case "toggleBoost":
			background.boostTab(message.value, "toggleBoost", message.eqIndex)
			break
		case "togglePass":
			background.boostTab(message.value, "togglePass", message.eqIndex)
			break
		case "stopBoost":
			background.stopBoost(background.stream)
			background.resetBoost()
			break
		case "reset":
			background.stopBoost(background.stream)
			background.resetBoost()
			break
		case "popup opened":
			console.log(background)
			// return stored biquad node values to popup
			nodes = background.getNodeValues()
			sendResponse({
				nodeValues: nodes
			})
			break
		default:
			console.log("Error message did not match")
	}

})

// tab listeners
chrome.tabs.onCreated.addListener(function(tab) {
	// init tab info
	console.log("tab created: " + tab.id.toString())
	var tabId = tab.id.toString()
})

// remove tab state on tab deletion
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	console.log("removed tab " + tabId)
	delete background.tabStates[tabId]
})

// // clear storage sync when window is closed
// chrome.windows.onRemoved.addListener(function() {
// 	chrome.storage.sync.clear()
// })

// create background instance
const background = new Background()
