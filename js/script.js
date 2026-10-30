"use strict";

// Lets the CSS hide .reveal elements only when JavaScript is actually running.
document.documentElement.classList.add("js");

// PRODUCT DATA: edit names, prices, sizes, colours, stock and image paths here.
// Image paths are relative to the page (pages live in /content, so they start with ../images/).
// Prices, sizes and colours are placeholders: replace them with your real details.
const PRODUCTS = [
  {"id": 1, "name": "Women's Everyday Outfit 1", "category": "Women's Clothing", "price": 299, "image": "../images/Womens clothes/Women clothes.png.png", "alt": "Women's everyday outfit from the TrendWear collection, style 1", "description": "Affordable everyday fashion suitable for formal, semi-formal and casual wear.", "sizes": ["S", "M", "L", "XL"], "colours": ["Black", "Navy", "Cream"], "inStock": true},
  {"id": 2, "name": "Women's Everyday Outfit 2", "category": "Women's Clothing", "price": 349, "image": "../images/Womens clothes/Women clothes1.png.png", "alt": "Women's everyday outfit from the TrendWear collection, style 2", "description": "A versatile women's look that works for work, outings and weekends.", "sizes": ["S", "M", "L", "XL"], "colours": ["Burgundy", "Grey", "White"], "inStock": true},
  {"id": 3, "name": "Men's Casual Outfit", "category": "Men's Clothing", "price": 329, "image": "../images/Mens clothes/Mens clothes.png.png", "alt": "Men's casual outfit from the TrendWear collection", "description": "Comfortable everyday clothing for the man who loves the outdoors.", "sizes": ["S", "M", "L", "XL"], "colours": ["Khaki", "Navy", "Black"], "inStock": true},
  {"id": 4, "name": "Men's Smart Outfit", "category": "Men's Clothing", "price": 499, "image": "../images/Mens clothes/Mens clothes2.png.png", "alt": "Men's smart outfit from the TrendWear collection", "description": "A smart, well-fitted option for the everyday suit guy.", "sizes": ["S", "M", "L", "XL"], "colours": ["Charcoal", "Navy"], "inStock": true},
  {"id": 5, "name": "Everyday Shoes 1", "category": "Shoes", "price": 399, "image": "../images/Shoes/Shoes.png.png", "alt": "Pair of everyday shoes from the TrendWear footwear range", "description": "Practical and fashionable footwear for men, women and children.", "sizes": ["3", "4", "5", "6", "7", "8", "9", "10"], "colours": ["Black", "Brown"], "inStock": true},
  {"id": 6, "name": "Everyday Shoes 2", "category": "Shoes", "price": 449, "image": "../images/Shoes/Shoes1.png.png", "alt": "Second style of everyday shoes from the TrendWear footwear range", "description": "Comfortable shoes for daily wear, in a range of sizes.", "sizes": ["3", "4", "5", "6", "7", "8", "9", "10"], "colours": ["White", "Grey"], "inStock": true},
  {"id": 7, "name": "Everyday Accessories 1", "category": "Accessories", "price": 129, "image": "../images/Accessories/Accessories.png.png", "alt": "Accessories that complement an everyday outfit, style 1", "description": "Accessories that complement your everyday outfits.", "sizes": ["One size"], "colours": ["Black", "Brown", "Gold"], "inStock": true},
  {"id": 8, "name": "Everyday Accessories 2", "category": "Accessories", "price": 149, "image": "../images/Accessories/Accessories1.png.png", "alt": "Accessories that complement an everyday outfit, style 2", "description": "Finish your look with affordable, practical accessories.", "sizes": ["One size"], "colours": ["Silver", "Gold"], "inStock": true},
  {"id": 9, "name": "School Uniform Set", "category": "School Uniforms", "price": 399, "image": "../images/School Uniform/School Uniform.png.png", "alt": "School uniform set from TrendWear", "description": "Affordable school uniform options for families preparing for the school year.", "sizes": ["6-7", "8-9", "10-11", "12-13"], "colours": ["Grey", "White", "Navy"], "inStock": true},
  {"id": 10, "name": "Baby Wear Set 1", "category": "Baby Wear", "price": 179, "image": "../images/Kids clothes/Kids clothes.png.png", "alt": "Baby clothing set from the TrendWear baby-wear range, style 1", "description": "Comfortable and affordable clothing for babies.", "sizes": ["0-3 months", "3-6 months", "6-12 months"], "colours": ["Yellow", "White", "Blue"], "inStock": true},
  {"id": 11, "name": "Baby Wear Set 2", "category": "Baby Wear", "price": 199, "image": "../images/Kids clothes/Kids clothes1.png.png", "alt": "Baby clothing set from the TrendWear baby-wear range, style 2", "description": "Soft, comfortable everyday baby clothing.", "sizes": ["0-3 months", "3-6 months", "6-12 months"], "colours": ["Pink", "White", "Grey"], "inStock": true}
];

document.addEventListener("DOMContentLoaded", () => {
  initProducts();
  initLightbox();
  initAccordions();
  initRevealOnScroll();
  prefillProductName();
  initForms();
});

/* ---------- PRODUCTS: search, filter, sort ---------- */

function initProducts() {
  const grid = document.querySelector("#productGrid");
  const searchInput = document.querySelector("#productSearch");
  const categoryFilter = document.querySelector("#categoryFilter");
  const sortSelect = document.querySelector("#productSort");
  const searchButton = document.querySelector("#searchButton");
  const clearButton = document.querySelector("#clearSearch");
  const productCount = document.querySelector("#productCount");
  const noProducts = document.querySelector("#noProducts");
  if (!grid || !searchInput || !categoryFilter || !sortSelect) return;

  const products = PRODUCTS;

  // Build the category dropdown from the data itself.
  if (categoryFilter.options.length <= 1) {
    [...new Set(products.map((p) => p.category))].sort().forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.append(option);
    });
  }

  // Use the cards already written in the HTML (so pictures always show);
  // build any card that is missing from the page.
  const existing = new Map(
    [...grid.querySelectorAll(".product-card[data-id]")].map((card) => [Number(card.dataset.id), card])
  );
  const entries = products.map((product, index) => ({
    product,
    index,
    element: existing.get(product.id) || buildProductCard(product)
  }));
  grid.replaceChildren(...entries.map((entry) => entry.element));

  // Show/hide and re-order the cards. Returns how many are visible.
  function update() {
    const terms = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const category = categoryFilter.value;
    let visibleCount = 0;

    entries.forEach(({ product, element }) => {
      const text = [
        product.name, product.category, product.description,
        (product.colours || []).join(" "), (product.sizes || []).join(" ")
      ].join(" ").toLowerCase();
      const matches =
        terms.every((term) => text.includes(term)) &&
        (category === "all" || product.category === category);
      element.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    const sorted = [...entries].sort((a, b) => {
      switch (sortSelect.value) {
        case "price-asc": return a.product.price - b.product.price;
        case "price-desc": return b.product.price - a.product.price;
        case "name": return a.product.name.localeCompare(b.product.name);
        default: return a.index - b.index;
      }
    });
    grid.append(...sorted.map((entry) => entry.element));

    if (productCount) {
      productCount.textContent = visibleCount === 0
        ? "No products found."
        : `Showing ${visibleCount} of ${products.length} products.`;
    }
    if (noProducts) noProducts.hidden = visibleCount !== 0;
    return visibleCount;
  }

  // Pressing Enter or clicking Search shows the results and scrolls to them.
  function runSearch() {
    const visible = update();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = visible > 0 ? grid : noProducts;
    if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  searchInput.addEventListener("input", update);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  });
  categoryFilter.addEventListener("change", update);
  sortSelect.addEventListener("change", update);
  if (searchButton) searchButton.addEventListener("click", runSearch);
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      categoryFilter.value = "all";
      sortSelect.value = "default";
      update();
      searchInput.focus();
    });
  }

  update();
}

function buildProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.id = product.id;

  const imageButton = document.createElement("button");
  imageButton.type = "button";
  imageButton.className = "image-button";
  imageButton.setAttribute("aria-label", `View larger image of ${product.name}`);

  const image = document.createElement("img");
  image.className = "gallery-image";
  image.src = encodeURI(product.image);
  image.addEventListener("error", () => {
    const missing = document.createElement("p");
    missing.className = "notice";
    missing.textContent = `Picture not found: ${product.image}. Check the folder and file name (capital letters and spaces must match exactly).`;
    imageButton.replaceWith(missing);
  });
  image.alt = product.alt;
  image.width = 300;
  image.height = 300;
  image.loading = "lazy";
  imageButton.append(image);

  const heading = document.createElement("h2");
  heading.textContent = product.name;

  const description = document.createElement("p");
  description.textContent = product.description;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR"
  }).format(product.price);

  const details = document.createElement("p");
  details.className = "product-details";
  const parts = [];
  if (product.sizes) parts.push(`Sizes: ${product.sizes.join(", ")}`);
  if (product.colours) parts.push(`Colours: ${product.colours.join(", ")}`);
  parts.push(product.inStock ? "In stock" : "Out of stock");
  details.textContent = parts.join(" | ");

  const enquire = document.createElement("a");
  enquire.className = "button-link";
  enquire.href = `enquiry.html?product=${encodeURIComponent(product.name)}`;
  enquire.textContent = `Enquire about ${product.name}`;

  card.append(imageButton, heading, description, price, details, enquire);
  return card;
}

/* ---------- LIGHTBOX (works on every page and for dynamically added images) ---------- */

function initLightbox() {
  // If a page has no lightbox in its HTML, create one so pictures can open anywhere.
  let lightbox = document.querySelector("#lightbox");
  if (!lightbox) {
    lightbox = document.createElement("dialog");
    lightbox.id = "lightbox";
    lightbox.className = "lightbox";
    lightbox.setAttribute("aria-label", "Enlarged image");
    lightbox.innerHTML =
      '<button type="button" id="closeLightbox" class="lightbox-close">Close</button>' +
      '<img id="lightboxImage" src="" alt=""><p id="lightboxCaption"></p>';
    document.body.append(lightbox);
  }
  const lightboxImage = lightbox.querySelector("#lightboxImage");
  const lightboxCaption = lightbox.querySelector("#lightboxCaption");
  const closeLightbox = lightbox.querySelector("#closeLightbox");

  const STANDALONE = ".hero img, img[data-lightbox]";

  // Pictures that are not inside a button still need to work with the keyboard.
  document.querySelectorAll(STANDALONE).forEach((img) => {
    if (img.closest(".image-button")) return;
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `View larger image: ${img.alt}`);
  });

  function openLightbox(image) {
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    const heading = image.closest(".product-card")?.querySelector("h2");
    lightboxCaption.textContent = heading ? heading.textContent : image.alt;
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else window.open(image.src, "_blank", "noopener");
  }

  document.addEventListener("click", (event) => {
    const image =
      event.target.closest(".image-button")?.querySelector("img") ||
      event.target.closest(STANDALONE);
    if (image) openLightbox(image);
  });

  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches?.(STANDALONE)) {
      event.preventDefault();
      openLightbox(event.target);
    }
  });

  if (closeLightbox) closeLightbox.addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close(); // click on the backdrop
  });
}

/* ---------- ACCORDION ---------- */

function initAccordions() {
  document.querySelectorAll(".accordion").forEach((accordion) => {
    const triggers = accordion.querySelectorAll(".accordion-trigger");

    function setPanel(trigger, open) {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      trigger.setAttribute("aria-expanded", String(open));
      if (panel) panel.hidden = !open;
    }

    triggers.forEach((trigger) => {
      setPanel(trigger, false);
      trigger.addEventListener("click", () => {
        const wasOpen = trigger.getAttribute("aria-expanded") === "true";
        triggers.forEach((other) => setPanel(other, false)); // one open at a time
        setPanel(trigger, !wasOpen);
      });
    });
  });
}

/* ---------- SCROLL REVEAL ANIMATION ---------- */

function initRevealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((item) => observer.observe(item));
}

/* ---------- ENQUIRY: prefill product name from ?product=... ---------- */

function prefillProductName() {
  const productField = document.querySelector("#product-name");
  if (!productField) return;
  const requestedProduct = new URLSearchParams(window.location.search).get("product");
  if (requestedProduct && !productField.value) productField.value = requestedProduct;
}

/* ---------- FORM VALIDATION (red messages under each field) + AJAX SUBMISSION ---------- */

function initForms() {
  document.querySelectorAll("form[data-ajax-form]").forEach((form) => {
    const status = form.querySelector(".form-status");
    form.noValidate = true; // we show our own red messages instead of browser pop-ups

    function showStatus(message, type) {
      if (!status) return;
      status.textContent = message;
      status.className = `form-status ${type}`;
    }

    // Group the visible fields by name (radio buttons share one group)
    const groups = new Map();
    form.querySelectorAll("input, select, textarea").forEach((control) => {
      if (!control.name || control.name.startsWith("_")) return;
      if (["hidden", "submit", "reset", "button"].includes(control.type)) return;
      if (!groups.has(control.name)) groups.set(control.name, []);
      groups.get(control.name).push(control);
    });

    // Create a red message element directly under every field
    const errors = new Map();
    groups.forEach((controls, name) => {
      const last = controls[controls.length - 1];
      const error = document.createElement("span");
      error.className = "field-error";
      error.id = `error-${last.id || name}`;
      error.setAttribute("role", "alert");
      error.hidden = true;
      const anchor = last.type === "radio" ? (last.closest("p") || last) : last;
      anchor.insertAdjacentElement("afterend", error);
      controls.forEach((control) => control.setAttribute("aria-describedby", error.id));
      errors.set(name, error);
    });

    function labelText(control) {
      const label = control.id ? form.querySelector(`label[for="${control.id}"]`) : null;
      return label ? label.textContent.replace(/[*:]/g, "").trim() : "This field";
    }

    function getMessage(controls) {
      const control = controls[0];

      if (control.type === "radio") {
        return controls.some((radio) => radio.checked) ? "" : "Please choose an option.";
      }

      const value = control.value.trim();
      if (control.required && !value) {
        return control.tagName === "SELECT"
          ? `Please choose an option for ${labelText(control).toLowerCase()}.`
          : `${labelText(control)} is required.`;
      }
      if (!value) return "";

      if (control.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Enter a valid email address, e.g. name@example.com.";
      }
      if ((control.name === "fullname" || control.name === "name") &&
          !/^[\p{L}\p{M} .'-]{2,80}$/u.test(value)) {
        return "Enter a valid name using letters only (at least two).";
      }
      if ((control.name === "phone" || control.name === "number") &&
          !/^[0-9 +()-]{7,20}$/.test(value)) {
        return "Enter a valid phone number, e.g. 082 123 4567.";
      }
      if (control.pattern && !new RegExp(`^(?:${control.pattern})$`).test(value)) {
        return control.title || "Please use the requested format.";
      }
      return "";
    }

    // Returns true when the field is valid; shows or hides the red message
    function validateGroup(name) {
      const controls = groups.get(name);
      const error = errors.get(name);
      const message = getMessage(controls);
      error.textContent = message;
      error.hidden = !message;
      controls.forEach((control) => {
        if (message) control.setAttribute("aria-invalid", "true");
        else control.removeAttribute("aria-invalid");
      });
      return !message;
    }

    // Validate when leaving a field, then keep updating while the person fixes it
    form.addEventListener("focusout", (event) => {
      if (groups.has(event.target.name)) validateGroup(event.target.name);
    });
    form.addEventListener("input", (event) => {
      const name = event.target.name;
      if (groups.has(name) && !errors.get(name).hidden) validateGroup(name);
    });
    form.addEventListener("change", (event) => {
      if (groups.has(event.target.name)) validateGroup(event.target.name);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      let firstInvalid = null;
      groups.forEach((controls, name) => {
        if (!validateGroup(name) && !firstInvalid) firstInvalid = controls[0];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        showStatus("Please fix the errors shown in red before submitting.", "error");
        return;
      }

      // Browsers block form relays when a page is opened straight from a folder (file://).
      if (window.location.protocol === "file:") {
        showStatus(
          "This form can only send from a live website. Open the site with a local server (for example VS Code Live Server) or deploy it, then try again.",
          "error"
        );
        return;
      }

      const submitButton = form.querySelector('[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : "";
      const originalButtonValue = submitButton ? submitButton.value : "";
      if (submitButton) {
        submitButton.disabled = true;
        // Works for both <button> and <input type="submit">
        if (submitButton.tagName === "INPUT") submitButton.value = "Sending...";
        else submitButton.textContent = "Sending...";
      }
      showStatus("Submitting your message. Please wait...", "success");

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        });

        let result = null;
        try { result = await response.json(); } catch (parseError) { /* not JSON */ }

        if (!response.ok || (result && String(result.success) === "false")) {
          const reason = result && result.message ? result.message : `HTTP ${response.status}`;
          throw new Error(reason);
        }

        showStatus(
          form.dataset.successMessage ||
            "Thank you! Your message has been received and we will respond soon.",
          "success"
        );
        form.reset();
      } catch (error) {
        console.error("Form submission failed:", error);
        const reason = String(error && error.message ? error.message : "");
        if (/activat/i.test(reason)) {
          showStatus(
            "This form has not been activated yet. Open the activation email FormSubmit sent to info@trendwear.co.za (check spam), click the link, then send again.",
            "error"
          );
        } else {
          showStatus(
            "We could not send your message. Please check your internet connection and try again, or email us at info@trendwear.co.za.",
            "error"
          );
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          if (submitButton.tagName === "INPUT") submitButton.value = originalButtonValue;
          else submitButton.textContent = originalButtonText;
        }
      }
    });

    form.addEventListener("reset", () => {
      errors.forEach((error) => { error.hidden = true; error.textContent = ""; });
      form.querySelectorAll("[aria-invalid]").forEach((c) => c.removeAttribute("aria-invalid"));
      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }
    });
  });
}