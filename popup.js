
class BoostUI {
	constructor() {
		this.tabId = null
		this.isBoosted = false
		this.init()
	}
	init() {
	  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
	  	this.curTabId = tabs[0].id
	  }.bind(this))

	  // toggle bass boost listener
	  var toggleButton = document.getElementById("toggleButton")
		toggleButton.addEventListener('click', (e) => {
			this.isBoosted = !this.isBoosted
			if (this.isBoosted) {
				toggleButton.innerHTML = "Off"
			} else {
				toggleButton.innerHTML = "Boost"
			}
			this.boostTab()
			// console.log('toggle button clicked')
		})
	}

	boostTab() {
		chrome.runtime.sendMessage({
			action: "toggleBoost",
			tabId: this.curTabId,
			value: document.getElementById("equalizer").value
		})
	}
}


// initialize script
document.addEventListener('DOMContentLoaded', function(event) {
	const boostui = new BoostUI()
})
