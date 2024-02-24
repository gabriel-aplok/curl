(() => {
	"use strict"

	document.addEventListener("DOMContentLoaded", () => {
		let elements = document.querySelectorAll("[data-href]")

		elements.forEach((element) => {
			element.addEventListener("click", () => {
				var link = element.getAttribute("data-href")

				window.location.href = link
			})
		})
	})
})()