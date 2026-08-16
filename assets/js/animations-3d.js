/* ============================================================
   3D MOTION CONTROLLER
   - Every section rotates/flies in from 3D space on scroll
   - Every card/button/div gets real perspective tilt on hover
   - Hero/about images float in 3D with mouse parallax
   Works alongside main.js (does not touch its listeners).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return;

  /* ---------------------------------------------------------
     1) SECTIONS fly/rotate into place on scroll (3D)
  --------------------------------------------------------- */
  const sections = document.querySelectorAll(".section, .hero-section");
  sections.forEach((section) => section.classList.add("section-3d-in"));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  /* ---------------------------------------------------------
     2) Every content block (row > column) flies in with a
        3D flip — alternating left/right for variety.
  --------------------------------------------------------- */
  const blockSelectors = [
    ".hero-row > div",
    ".about-row > div",
    "#skills-container > .skill-item",
    "#projects-container > .project-item",
    ".contact-wrapper .row > div",
    ".experience-range",
    ".currently-learning",
    ".timeline-item",
  ];
  const blocks = document.querySelectorAll(blockSelectors.join(","));
  blocks.forEach((block, i) => {
    if (block.classList.contains("reveal-on-scroll")) return; // already animated
    block.classList.add("block-3d-in");
    if (i % 2 === 0) block.classList.add("from-left");
  });

  const blockObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          blockObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  blocks.forEach((block) => blockObserver.observe(block));

  /* ---------------------------------------------------------
     3) Universal mouse-tilt 3D for cards, media, icon boxes.
        (Buttons are intentionally excluded here — main.js
        already gives them a magnetic 3D-style move.)
  --------------------------------------------------------- */
  const tiltSelectors = [
    ".card",
    ".project-card",
    ".glass-card",
    ".review-card",
    ".contact-link-card",
    ".icon-box",
    ".experience-badge",
  ];
  // Note: .skill-card is intentionally excluded — the skills section now
  // uses a dedicated CSS 3D flip (see skill-flip-outer/inner in
  // animations-3d.css), and adding a competing inline tilt transform would
  // fight with that flip animation.
  // Note: .hero-image-frame/.about-image-frame are also excluded — they get
  // their own whole-page parallax transform below, and having two mousemove
  // handlers write to the same element's inline transform would clobber
  // each other.
  const tiltTargets = document.querySelectorAll(tiltSelectors.join(","));

  tiltTargets.forEach((el) => {
    el.classList.add("tilt-3d");
    const maxTilt = 10; // degrees

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const rotateY = (px - 0.5) * 2 * maxTilt;
      const rotateX = (0.5 - py) * 2 * maxTilt;
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    });
  });

  /* ---------------------------------------------------------
     4) Hero + About portrait float in 3D with page-wide
        mouse parallax (subtle, whole-page feel).
     The float animation lives on the IMAGE (child) while the
     parallax translate is applied to the FRAME (parent) — kept
     on separate elements so neither transform clobbers the other.
  --------------------------------------------------------- */
  const parallaxFrames = document.querySelectorAll(
    ".hero-image-frame, .about-image-frame"
  );
  document
    .querySelectorAll(".hero-cutout-img, .about-cutout-img")
    .forEach((img) => img.classList.add("float-3d"));

  window.addEventListener("mousemove", (e) => {
    const px = e.clientX / window.innerWidth - 0.5;
    const py = e.clientY / window.innerHeight - 0.5;
    parallaxFrames.forEach((frame) => {
      frame.style.transform = `translate(${px * 18}px, ${py * 14}px)`;
    });
  });

  /* ---------------------------------------------------------
     5) Navbar: scrollspy + 3D sliding pill under the active link
  --------------------------------------------------------- */
  const navList = document.querySelector(".nav-3d-list");
  const navPill = document.querySelector(".nav-pill-3d");
  const navLinks = document.querySelectorAll(".nav-link[data-section]");
  const trackedSections = Array.from(navLinks)
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  function movePillTo(link) {
    if (!navPill || !navList || !link) return;
    const listRect = navList.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    navPill.style.width = `${linkRect.width}px`;
    navPill.style.left = `${linkRect.left - listRect.left}px`;
    navPill.classList.add("visible");
  }

  function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
      const isActive = link.dataset.section === sectionId;
      link.classList.toggle("active-link", isActive);
      if (isActive) movePillTo(link);
    });
  }

  if (trackedSections.length && navPill) {
    const spy = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that's visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveLink(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    trackedSections.forEach((section) => spy.observe(section));

    // Initialize pill position once layout has settled
    window.addEventListener("load", () => {
      const homeLink = document.querySelector('.nav-link[data-section="home"]');
      setActiveLink("home");
      if (homeLink) movePillTo(homeLink);
    });
    window.addEventListener("resize", () => {
      const active = document.querySelector(".nav-link.active-link");
      if (active) movePillTo(active);
    });
  }

  /* ---------------------------------------------------------
     6) GSAP-powered 3D depth pass for section headings, so
        titles rotate in on top of the section's own motion.
  --------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll(".section h2, .hero-title").forEach((title) => {
      gsap.fromTo(
        title,
        { opacity: 0, rotateX: 45, transformPerspective: 800, y: 40 },
        {
          opacity: 1,
          rotateX: 0,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: title, start: "top 88%" },
        }
      );
    });
  }
});
