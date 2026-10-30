/*
 * TrendWear Part 3 JavaScript
 * Features:
 * - Products loaded dynamically from data/products.json (fetch + DOM building)
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

  let products;
  try {
    const response = await fetch("../data/products.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    products = await response.json();
  } catch (error) {
    if (productCount) {
      productCount.textContent =
        "Products could not be loaded. Please refresh the page or try again later.";
    }
    return;
  }

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
  image.src = product.image;
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

/* ---------- FORM VALIDATION + AJAX SUBMISSION ---------- */

function initForms() {
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

      const nameInput = form.querySelector('[name="fullname"], [name="name"]');
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
      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }
    });
  });
}