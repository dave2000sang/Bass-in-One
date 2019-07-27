
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
			if (this.isBoosted) {
				this.stopBoost()
			} else {
				this.boostTab()
			}
			this.isBoosted = !this.isBoosted
		})
	}

	boostTab() {
		chrome.runtime.sendMessage({
			action: "toggleBoost",
			tabId: this.curTabId,
			value: document.getElementById("equalizer").value
			}, () => {
				document.getElementById("toggleButton").innerHTML = "Off"
			}
		)
	}

	stopBoost() {
		chrome.runtime.sendMessage({
			action: "stopBoost",
			tabId: this.curTabId
		}, () => {
				document.getElementById("toggleButton").innerHTML = "Boost"
			}
		)
	}
}


// initialize script
document.addEventListener('DOMContentLoaded', function(event) {
	const boostui = new BoostUI()
})
