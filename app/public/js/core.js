(() => {
  "use strict";

  // Wait for the DOM to be fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    // Select all elements with the 'data-href' attribute
    const elements = document.querySelectorAll("[data-href]");

    elements.forEach((element) => {
      // Add a click event listener to each element
      element.addEventListener("click", (event) => {
        // Prevent default action if the element is a link or button
        event.preventDefault();

        // Get the URL from the 'data-href' attribute
        const link = element.getAttribute("data-href");

        // Only redirect if the link is not empty
        if (link) {
          window.location.href = link;
        }
      });

      // Optionally, make the element look clickable (add pointer cursor)
      element.style.cursor = "pointer";
      // Optionally, set tabindex to make it focusable for accessibility
      if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "0");
      }
      // Optionally, allow navigation with Enter key for accessibility
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const link = element.getAttribute("data-href");
          if (link) {
            window.location.href = link;
          }
        }
      });
    });
  });
})();

// This script makes any element with a 'data-href' attribute clickable,
// redirecting the user to the specified URL when clicked or activated via keyboard.
// It also improves accessibility and user experience.
