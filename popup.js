
class BoostUI {
	constructor() {
		this.tabId = null
		this.init()
	}
	init() {
	  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
	  	this.curTabId = tabs[0].id
	  }.bind(this))

	  // toggle bass boost listener
	  var toggle_button = document.getElementById("toggle_button")
	  // console.log(toggle_button)
		toggle_button.addEventListener('click', (e) => {
			this.boostTab()
			console.log('toggle button clicked, tabId = ' + this.curTabId)
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
