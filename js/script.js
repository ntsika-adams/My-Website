/*
 * TrendWear Part 3 JavaScript
 * Features:
 * - Product data (edit PRODUCTS below) rendered with DOM building
 * - Product search, category filter and sorting
 * - Accessible image lightbox (<dialog>)
 * - Accordion (FAQ) and scroll-reveal animation
 * - Interactive Leaflet store map with "find my nearest store"
 * - Client-side validation + AJAX submission for the enquiry/contact forms
 *
 * IMPORTANT:
 * FormSubmit is an external form relay. The recipient must verify the
 * email address, and the service must be tested after deployment.
 * Do not put passwords, API secrets, or private keys in front-end code.
 */
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

// PLACEHOLDER store data: replace with TrendWear's real shopping centres.
const STORES = [
  { name: "TrendWear Johannesburg", centre: "Example shopping centre, Johannesburg", lat: -26.2041, lng: 28.0473 },
  { name: "TrendWear Cape Town", centre: "Example shopping centre, Cape Town", lat: -33.9249, lng: 18.4241 },
  { name: "TrendWear Durban", centre: "Example shopping centre, Durban", lat: -29.8587, lng: 31.0218 },
  { name: "TrendWear Gqeberha", centre: "Example shopping centre, Gqeberha", lat: -33.9494, lng: 25.5771 }
];

document.addEventListener("DOMContentLoaded", () => {
  initProducts();
  initLightbox();
  initAccordions();
  initRevealOnScroll();
  initStoreMap();
  prefillProductName();
  initForms();
});

/* ---------- PRODUCTS: dynamic loading, search, filter, sort ---------- */

async function initProducts() {
  const grid = document.querySelector("#productGrid");
  const searchInput = document.querySelector("#productSearch");
  const categoryFilter = document.querySelector("#categoryFilter");
  const sortSelect = document.querySelector("#productSort");
  const productCount = document.querySelector("#productCount");
  const noProducts = document.querySelector("#noProducts");
  if (!grid || !searchInput || !categoryFilter || !sortSelect) return;

  const products = PRODUCTS;

  // Build the category dropdown from the data itself.
  [...new Set(products.map((p) => p.category))].sort().forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });

  const entries = products.map((product, index) => ({
    product,
    index,
    element: buildProductCard(product)
  }));

  function update() {
    const term = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const visible = entries.filter(({ product }) => {
      const text = [
        product.name, product.category, product.description,
        (product.colours || []).join(" "), (product.sizes || []).join(" ")
      ].join(" ").toLowerCase();
      return text.includes(term) && (category === "all" || product.category === category);
    });

    visible.sort((a, b) => {
      switch (sortSelect.value) {
        case "price-asc": return a.product.price - b.product.price;
        case "price-desc": return b.product.price - a.product.price;
        case "name": return a.product.name.localeCompare(b.product.name);
        default: return a.index - b.index;
      }
    });

    grid.replaceChildren(...visible.map((entry) => entry.element));
    if (productCount) {
      productCount.textContent = `Showing ${visible.length} of ${products.length} products.`;
    }
    if (noProducts) noProducts.hidden = visible.length !== 0;
  }

  searchInput.addEventListener("input", update);
  categoryFilter.addEventListener("change", update);
  sortSelect.addEventListener("change", update);
  update();
}

function buildProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

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

/* ---------- LIGHTBOX (works for dynamically added images) ---------- */

function initLightbox() {
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightboxImage");
  const lightboxCaption = document.querySelector("#lightboxCaption");
  const closeLightbox = document.querySelector("#closeLightbox");
  if (!lightbox || !lightboxImage) return;

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".image-button");
    if (!trigger) return;
    const image = trigger.querySelector("img");
    if (!image) return;

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    if (lightboxCaption) {
      const heading = trigger.closest(".product-card")?.querySelector("h2");
      lightboxCaption.textContent = heading ? heading.textContent : image.alt;
    }
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else window.open(image.src, "_blank", "noopener");
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

/* ---------- INTERACTIVE STORE MAP (Leaflet + OpenStreetMap) ---------- */

function initStoreMap() {
  const mapElement = document.querySelector("#storeMap");
  if (!mapElement) return;

  if (!window.L) {
    mapElement.textContent =
      "The interactive map could not load. Please check your connection and refresh the page.";
    return;
  }

  const map = L.map(mapElement).setView([-29.0, 24.5], 5);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const list = document.querySelector("#storeList");
  const markers = new Map();

  STORES.forEach((store) => {
    const popup = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = store.name;
    const centre = document.createElement("p");
    centre.textContent = store.centre;
    popup.append(title, centre);

    const marker = L.marker([store.lat, store.lng], { title: store.name })
      .addTo(map)
      .bindPopup(popup);
    markers.set(store.name, marker);

    if (list) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button-link";
      button.textContent = store.name;
      button.addEventListener("click", () => {
        map.flyTo([store.lat, store.lng], 12);
        marker.openPopup();
      });
      item.append(button);
      list.append(item);
    }
  });

  // Location-based feature: find the nearest store to the visitor.
  const findNearest = document.querySelector("#findNearest");
  const nearestStatus = document.querySelector("#nearestStatus");

  function distanceKm(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const a =
      Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  if (findNearest) {
    findNearest.addEventListener("click", () => {
      if (!navigator.geolocation) {
        if (nearestStatus) nearestStatus.textContent = "Your browser does not support location lookup.";
        return;
      }
      if (nearestStatus) nearestStatus.textContent = "Finding your location...";

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nearest = STORES
            .map((store) => ({ store, km: distanceKm(latitude, longitude, store.lat, store.lng) }))
            .sort((a, b) => a.km - b.km)[0];
          map.flyTo([nearest.store.lat, nearest.store.lng], 11);
          markers.get(nearest.store.name).openPopup();
          if (nearestStatus) {
            nearestStatus.textContent =
              `Your nearest store is ${nearest.store.name}, about ${Math.round(nearest.km)} km away.`;
          }
        },
        () => {
          if (nearestStatus) {
            nearestStatus.textContent =
              "We could not get your location. You can still choose a store from the list.";
          }
        }
      );
    });
  }
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

        if (!response.ok) {
          throw new Error("The form service returned an unsuccessful response.");
        }

        showStatus(
          form.dataset.successMessage ||
            "Thank you! Your message has been received and we will respond soon.",
          "success"
        );
        form.reset();
      } catch (error) {
        showStatus(
          "We could not confirm submission. Check your internet connection and the form service settings, then try again.",
          "error"
        );
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