
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

	  // listeners
	  var toggleButton = document.getElementById("toggleButton")
		var resetButton = document.getElementById("resetButton")
		var eqPass = document.getElementById("lowpassEQ")
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
				eqPass.disabled = true
				toggleButton.innerHTML = "On"
				// this.stopBoost()
			} else {
				eqPass.disabled = false
				toggleButton.innerHTML = "Off"
				this.boostTab(eqPass.value, "pass")
			}
			this.isBoosted = !this.isBoosted
		})

		resetButton.addEventListener('click', (e) => {
			this.reset()
		})

		eqPass.addEventListener('change', (e) => {
			this.boostTab(eqPass.value, "pass")
			passVal.innerHTML = eqPass.value
		})

	}

	buttonToggle() {
		var toggleButton = document.getElementById("toggleButton")
		switch (this.isBoosted) {
			case true:
				toggleButton.innerHTML = "Off"
				break
			case false:
				toggleButton.innerHTML = "Boost"
				break
			default:
		}
	}

	resetEQ() {
		var equalizers = document.getElementById("equalizers").children
		equalizers = Array.from(equalizers)
		equalizers.forEach((eq) => {
			eq.value = 0
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
			}
		)
	}

	reset() {
		chrome.runtime.sendMessage({
			action: "reset",
			tabId: this.curTabId
		}, () => {
			this.resetEQ()
		})
	}

	stopBoost() {
		chrome.runtime.sendMessage({
			action: "stopBoost",
			tabId: this.curTabId
		}
		)
	}
}


// initialize script
document.addEventListener('DOMContentLoaded', function(event) {
	const boostui = new BoostUI()
})
