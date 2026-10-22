/*
 * TrendWear Part 3 JavaScript
 * Features:
 * - Product search and category filtering
 * - Product image lightbox
 * - Client-side validation for enquiry/contact forms
 * - AJAX form submission with success/error feedback
 *
 * IMPORTANT:
 * FormSubmit is an external form relay. The recipient must verify the
 * email address, and the service must be tested after deployment.
 * Do not put passwords, API secrets, or private keys in front-end code.
 */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // PRODUCT SEARCH AND CATEGORY FILTER
  const searchInput = document.querySelector("#productSearch");
  const categoryFilter = document.querySelector("#categoryFilter");
  const productCards = Array.from(document.querySelectorAll(".product-card"));
  const productCount = document.querySelector("#productCount");
  const noProducts = document.querySelector("#noProducts");

  function filterProducts() {
    if (!searchInput || !categoryFilter) return;

    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    let visibleCount = 0;

    productCards.forEach((card) => {
      const searchableText = (
        (card.dataset.search || "") + " " + card.textContent
      ).toLowerCase();
      const matchesSearch = searchableText.includes(searchTerm);
      const matchesCategory =
        selectedCategory === "all" || card.dataset.category === selectedCategory;
      const shouldShow = matchesSearch && matchesCategory;

      card.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    if (productCount) {
      productCount.textContent =
        `Showing ${visibleCount} of ${productCards.length} product entries.`;
    }
    if (noProducts) noProducts.hidden = visibleCount !== 0;
  }

  if (searchInput) searchInput.addEventListener("input", filterProducts);
  if (categoryFilter) categoryFilter.addEventListener("change", filterProducts);

  // LIGHTBOX: click a product image to open it larger.
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightboxImage");
  const lightboxCaption = document.querySelector("#lightboxCaption");
  const closeLightbox = document.querySelector("#closeLightbox");

  document.querySelectorAll(".gallery-image").forEach((image) => {
    image.addEventListener("click", () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      if (lightboxCaption) {
        const heading = image.closest(".product-card")?.querySelector("h2");
        lightboxCaption.textContent = heading ? heading.textContent : image.alt;
      }
      if (typeof lightbox.showModal === "function") lightbox.showModal();
      else window.open(image.src, "_blank", "noopener");
    });
  });

  if (closeLightbox && lightbox) {
    closeLightbox.addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }

  // Populate the product name when an enquiry link includes ?product=...
  const productField = document.querySelector("#product-name");
  if (productField) {
    const requestedProduct = new URLSearchParams(window.location.search).get("product");
    if (requestedProduct && !productField.value) productField.value = requestedProduct;
  }

  // FORM VALIDATION + AJAX SUBMISSION
  document.querySelectorAll("form[data-ajax-form]").forEach((form) => {
    const status = form.querySelector(".form-status");

    function showStatus(message, type) {
      if (!status) return;
      status.textContent = message;
      status.className = `form-status ${type}`;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // First use built-in HTML validation rules (required, type=email, pattern, minlength).
      if (!form.checkValidity()) {
        form.reportValidity();
        showStatus("Please correct the highlighted fields before submitting.", "error");
        return;
      }

      const nameInput = form.querySelector(
        '[name="fullname"], [name="name"]'
      );
      if (nameInput && !/^[\p{L}\p{M} .'-]{2,80}$/u.test(nameInput.value.trim())) {
        nameInput.setCustomValidity("Enter a name using at least two letters.");
        nameInput.reportValidity();
        nameInput.setCustomValidity("");
        showStatus("Please enter a valid name.", "error");
        return;
      }

      const phoneInput = form.querySelector('[name="phone"], [name="number"]');
      if (phoneInput && !/^[0-9 +()-]{7,20}$/.test(phoneInput.value.trim())) {
        phoneInput.setCustomValidity("Enter a valid phone number.");
        phoneInput.reportValidity();
        phoneInput.setCustomValidity("");
        showStatus("Please enter a valid phone number.", "error");
        return;
      }

      const submitButton = form.querySelector('[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }
      showStatus("Submitting your message. Please wait...", "success");

      try {
        // FormSubmit accepts URL-encoded form data. AJAX mode keeps the page open.
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
          throw new Error("The form service returned an unsuccessful response.");
        }

        showStatus(
          "Your message was submitted. If this is the first submission, check the recipient inbox for a verification email.",
          "success"
        );
        form.reset();
      } catch (error) {
        // Network/CORS/service errors are shown honestly; the message may not have been delivered.
        showStatus(
          "We could not confirm submission. Check your internet connection and the form service settings, then try again.",
          "error"
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });

    form.addEventListener("reset", () => {
      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }
    });
  });
});
