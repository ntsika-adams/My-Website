# TrendWear Clothing Store — Part 3

## Project overview

TrendWear is a fictional South African clothing retailer website. Part 3 enhances the Part 2 website with interactive JavaScript, client-side form validation, Formspree form submission, responsive styling and search-engine optimisation.

## Pages

- `index.html` — homepage
- `content/about.html` — store history, mission, vision and target customers
- `content/products.html` — product categories with search, category filtering and an image lightbox
- `content/enquiry.html` — product/service enquiry form
- `content/contact.html` — general customer contact form
- `css/style.css` — visual design and responsive layout
- `js/script.js` — dynamic product filtering, lightbox, validation and Formspree form submission handling
- `robots.txt` and `sitemap.xml` — search crawler guidance and page list

## How to run locally

1. Keep the folders in their current structure.
2. Check that image paths match the image folders in your existing project. Product image paths are retained from the supplied Part 2 pages.
3. Open `index.html` in a browser. For form submission testing, use a local web server or deploy to a supported static host.
4. Test all navigation links, product search, category filtering, image lightbox, and both forms.

## Part 3 features

- Added descriptive page titles, meta descriptions and robots directives.
- Improved semantic structure, accessibility labels and keyboard focus.
- Added responsive product cards and a mobile layout.
- Added product search and category filtering using JavaScript.
- Added an image lightbox using the HTML `dialog` element.
- Added HTML5 and JavaScript client-side validation for required fields, email, phone, name and message length.
- Added Formspree integration for submitting enquiry and contact forms and receiving messages through the configured email address.
- Added `robots.txt` and `sitemap.xml` templates.
- Added reduced-motion support for users who prefer less animation.

## Form submission setup and security note

The forms use Formspree as the external form submission service. They must be configured with the correct Formspree endpoint from the Formspree dashboard. The intended recipient email address is `info@trendwear.co.za`, provided it is configured and verified in the Formspree account. The endpoint must be added to the relevant forms in `enquiry.html` and `contact.html`. Form submissions should be tested to confirm that messages are accepted and email notifications are received. Static HTML/JavaScript cannot securely store secret credentials. Client-side validation improves usability but is not a substitute for server-side validation. Do not claim the message was delivered unless the submission is confirmed.

## SEO checklist before publishing

1. Replace `YOUR-USERNAME` and `YOUR-REPOSITORY` in `robots.txt` and `sitemap.xml` with the real public URL.
2. Check all image files exist at their referenced paths.
3. Ensure each page has a unique title and meta description.
4. Keep descriptive alt text for meaningful images.
5. Test mobile layout and page speed; compress large images.
6. Add the live URL to relevant social profiles and directories if appropriate. Backlinks and search rankings cannot be guaranteed.

## Changelog

### Part 3 — 22 October 2026

- Corrected the homepage stylesheet path and standardised navigation paths.
- Added page-specific titles and meta descriptions.
- Reorganised product categories into a searchable and filterable catalogue.
- Added product image lightbox interaction.
- Added validation feedback and Formspree submission handling to enquiry and contact forms.
- Improved form labels, responsive layout, keyboard focus and reduced-motion support.
- Added `robots.txt` and `sitemap.xml` templates.
- Added this README with setup instructions and implementation notes.

### Part 2 feedback

Record the exact feedback provided by your lecturer here and describe each correction made. The original feedback comments were not included with the uploaded HTML/CSS files, so they must be added by the student.

## References

- Google Search Central (n.d.) *SEO Starter Guide*. Available at: [https://developers.google.com/search/docs/fundamentals/seo-starter-guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) (Accessed: 22 October 2026).
- MDN Web Docs (n.d.) *HTML forms*. Available at: [https://developer.mozilla.org/en-US/docs/Learn/Forms](https://developer.mozilla.org/en-US/docs/Learn/Forms) (Accessed: 22 October 2026).
- MDN Web Docs (n.d.) *Using Fetch*. Available at: [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) (Accessed: 22 October 2026).
- Formspree (n.d.) *Formspree: Form endpoints for your HTML forms*. Available at: [https://formspree.io/](https://formspree.io/) (Accessed: 22 October 2026).

##
