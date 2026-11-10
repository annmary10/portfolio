"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const scrollTopButton = document.querySelector(".scroll-top");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

function closeMenu() {
  if (!menuToggle || !navMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

const sections = [...document.querySelectorAll("main section[id]")];
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        link.classList.toggle("active", isCurrent);
      });
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  sections.forEach((section) => sectionObserver.observe(section));
}

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const profileImage = document.querySelector(".profile-image");
const portraitPlaceholder = document.querySelector(".portrait-placeholder");
if (profileImage && portraitPlaceholder) {
  profileImage.addEventListener("load", () => { portraitPlaceholder.hidden = true; });
  profileImage.addEventListener("error", () => { profileImage.hidden = true; });
  if (profileImage.complete && profileImage.naturalWidth > 0) portraitPlaceholder.hidden = true;
}

const certificateImage = document.querySelector(".certificate-image");
const certificatePlaceholder = document.querySelector(".certificate-placeholder");
const certificateLink = document.querySelector(".certificate-link");
const certificateNote = document.querySelector(".certificate-note");
if (certificateImage && certificatePlaceholder && certificateLink) {
  const enableCertificateLink = () => {
    certificatePlaceholder.hidden = true;
    certificateLink.href = certificateImage.dataset.assetSrc;
    certificateLink.target = "_blank";
    certificateLink.rel = "noopener noreferrer";
    certificateLink.removeAttribute("aria-disabled");
    certificateLink.setAttribute("aria-label", "View the AI internship certificate in a new tab");
    if (certificateNote) certificateNote.hidden = true;
  };
  certificateImage.addEventListener("load", enableCertificateLink);
  certificateImage.addEventListener("error", () => { certificateImage.hidden = true; });
  if (certificateImage.complete && certificateImage.naturalWidth > 0) enableCertificateLink();
  certificateLink.addEventListener("click", (event) => {
    if (certificateLink.getAttribute("aria-disabled") === "true") event.preventDefault();
  });
}

const resumeButton = document.querySelector("#resume-button");
if (resumeButton) {
  fetch("resume.pdf")
    .then((response) => {
      if (!response.ok) return;
      resumeButton.disabled = false;
      resumeButton.removeAttribute("aria-describedby");
      resumeButton.addEventListener("click", () => {
        const resumeLink = document.createElement("a");
        resumeLink.href = "resume.pdf";
        resumeLink.download = "Ann-Mary-Roy-Resume.pdf";
        document.body.append(resumeLink);
        resumeLink.click();
        resumeLink.remove();
      });
      const resumeNote = document.querySelector("#resume-note");
      if (resumeNote) resumeNote.hidden = true;
    })
    .catch(() => {
      // Keep the button disabled when the portfolio is opened without a local server.
    });
}

function updateScrollTopVisibility() {
  if (scrollTopButton) scrollTopButton.classList.toggle("visible", window.scrollY > 420);
}
window.addEventListener("scroll", updateScrollTopVisibility, { passive: true });
updateScrollTopVisibility();
if (scrollTopButton) {
  scrollTopButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());

if (contactForm && formStatus) {
  const fields = [...contactForm.querySelectorAll("input[required], textarea[required]")];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      field.removeAttribute("aria-invalid");
      const error = document.querySelector(`#${field.id}-error`);
      if (error) error.textContent = "";
      formStatus.textContent = "";
      formStatus.classList.remove("error");
    });
  });

  contactForm.addEventListener("submit", (event) => {
    let firstInvalidField = null;
    let valid = true;

    fields.forEach((field) => {
      let message = "";
      if (!field.value.trim()) message = "This field is required.";
      else if (field.type === "email" && !emailPattern.test(field.value.trim())) message = "Enter a valid email address.";

      const error = document.querySelector(`#${field.id}-error`);
      field.toggleAttribute("aria-invalid", Boolean(message));
      if (error) error.textContent = message;
      if (message) {
        valid = false;
        if (!firstInvalidField) firstInvalidField = field;
      }
    });

    if (!valid) {
      event.preventDefault();
      formStatus.textContent = "Please correct the highlighted fields.";
      formStatus.classList.add("error");
      firstInvalidField.focus();
      return;
    }

    formStatus.textContent = "Sending your message...";
    formStatus.classList.remove("error");
  });
}
