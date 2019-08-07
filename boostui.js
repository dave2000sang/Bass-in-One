
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
		var eq = document.getElementById("equalizer")
		var eqPass = document.getElementById("lowpassEQ")
		var shelfVal = document.getElementById("shelfVal")
		var passVal = document.getElementById("passVal")

		// equalizers event listener
		const equalizers = document.getElementById("equalizers")
		equalizers.addEventListener('change', (e) => {
			if(e.target.className == "eq") {
				this.boostTab(e.target.value, "shelf", e.target.id.split("eq")[1])
				console.log(e.target)
			}
		})

		toggleButton.addEventListener('click', (e) => {
			if (this.isBoosted) {
				this.stopBoost()
			} else {
				this.boostTab(eq.value, "shelf")
			}
			this.isBoosted = !this.isBoosted
		})

		eq.addEventListener('change', (e) => {
			this.boostTab(eq.value, "shelf")
			shelfVal.innerHTML = eq.value
		})

		eqPass.addEventListener('change', (e) => {
			this.boostTab(eqPass.value, "pass")
			passVal.innerHTML = eqPass.value
		})

	}

	boostTab(val, type, eqIndex=2) {
		var action = "";
		if (type === "shelf") {
			action = "toggleBoost"
		} else {
			action = "togglePass"
		}
		chrome.runtime.sendMessage({
			action: action,
			tabId: this.curTabId,
			value: val,
			eqIndex: eqIndex
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
