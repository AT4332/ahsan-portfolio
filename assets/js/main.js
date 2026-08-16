document.addEventListener("DOMContentLoaded", () => {
  // CV Modal Controls — use Bootstrap modal events for reliable behavior
  const cvModalEl = document.getElementById('cvModal');
  const cvIframe = document.getElementById('cv-iframe');
  const cvDialog = document.getElementById('cvModalDialog');
  const cvMaximize = document.getElementById('cv-maximize');
  const cvMinimize = document.getElementById('cv-minimize');
  const cvOpenNewTab = document.getElementById('cv-open-new-tab');
  const cvErrorContainer = document.getElementById('cv-error-container');
  const cvErrorText = document.getElementById('cv-error-text');
  const cvFallbackLink = document.getElementById('cv-fallback-link');
  let restoreButton = null;

  if (cvModalEl) {
    cvModalEl.addEventListener('show.bs.modal', function (e) {
      const trigger = e.relatedTarget;
      const cvUrl = (trigger && (trigger.getAttribute('data-cv') || trigger.dataset.cv)) || '';

      if (!cvUrl || cvUrl === 'None' || cvUrl.trim() === '') {
        if (cvIframe) cvIframe.style.display = 'none';
        if (cvErrorContainer) {
          cvErrorContainer.classList.remove('d-none');
          if (cvErrorText) cvErrorText.textContent = 'CV not uploaded yet. Please upload via admin panel.';
        }
        if (cvOpenNewTab) cvOpenNewTab.classList.add('d-none');
      } else {
        // Set links first
        if (cvOpenNewTab) {
          cvOpenNewTab.classList.remove('d-none');
          cvOpenNewTab.href = cvUrl;
        }
        if (cvFallbackLink) cvFallbackLink.href = cvUrl;

        // Try to load in iframe; if it fails show fallback with open-in-new-tab
        if (cvIframe) {
          cvIframe.style.display = 'block';
          cvErrorContainer && cvErrorContainer.classList.add('d-none');

          // Use a timeout — if iframe hasn't loaded after 4s, show fallback
          let loadTimer = setTimeout(() => {
            if (cvErrorContainer) {
              cvErrorContainer.classList.remove('d-none');
              if (cvErrorText) cvErrorText.textContent = 'PDF preview timed out. Click below to open in a new tab.';
            }
          }, 4000);

          cvIframe.onload = () => clearTimeout(loadTimer);
          cvIframe.src = cvUrl;
        }
      }

      if (cvDialog) cvDialog.classList.remove('modal-fullscreen');
      const icon = cvMaximize && cvMaximize.querySelector('i');
      if (icon) icon.className = 'fas fa-expand';
    });

    cvModalEl.addEventListener('hidden.bs.modal', function () {
      if (cvIframe) { cvIframe.src = ''; cvIframe.onload = null; cvIframe.style.display = 'block'; }
      if (cvErrorContainer) cvErrorContainer.classList.add('d-none');
      if (restoreButton) { restoreButton.remove(); restoreButton = null; }
      if (cvDialog) cvDialog.classList.remove('modal-fullscreen');
      const icon = cvMaximize && cvMaximize.querySelector('i');
      if (icon) icon.className = 'fas fa-expand';
    });
  }

  // Maximize toggles Bootstrap's modal-fullscreen class for reliable fullscreen
  if (cvMaximize && cvDialog) {
    cvMaximize.addEventListener('click', () => {
      const icon = cvMaximize.querySelector('i');
      if (!cvDialog.classList.contains('modal-fullscreen')) {
        cvDialog.classList.add('modal-fullscreen');
        if (icon) icon.className = 'fas fa-compress';
      } else {
        cvDialog.classList.remove('modal-fullscreen');
        if (icon) icon.className = 'fas fa-expand';
      }
    });
  }

  // Minimize hides modal and shows a small restore button
  if (cvMinimize && cvModalEl) {
    cvMinimize.addEventListener('click', () => {
      const modalInstance = bootstrap.Modal.getInstance(cvModalEl);
      if (modalInstance) modalInstance.hide();
      if (!restoreButton) {
        restoreButton = document.createElement('button');
        restoreButton.className = 'btn btn-primary position-fixed rounded-circle shadow-lg';
        restoreButton.style.bottom = '20px';
        restoreButton.style.right = '20px';
        restoreButton.style.width = '55px';
        restoreButton.style.height = '55px';
        restoreButton.style.zIndex = 9999;
        restoreButton.innerHTML = '<i class="fas fa-file-pdf"></i>';
        document.body.appendChild(restoreButton);
        restoreButton.addEventListener('click', () => {
          const modal = new bootstrap.Modal(cvModalEl);
          modal.show();
          restoreButton.remove();
          restoreButton = null;
        });
      }
    });
  }

  // Dynamic Greeting & Welcome Message
  const greetingElement = document.getElementById("dynamic-greeting");
  if (greetingElement) {
    const hour = new Date().getHours();
    let greeting = "Hello";
    if (hour >= 5 && hour < 12) greeting = "Good Morning";
    else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
    else if (hour >= 17 && hour < 21) greeting = "Good Evening";
    else greeting = "Good Night";

    // Custom welcome for first time visitors
    if (!localStorage.getItem("visited")) {
      greeting = "Welcome to my World";
      localStorage.setItem("visited", "true");
    }

    greetingElement.textContent = `${greeting}, Visitor 👋`;
  }

  // Typing Effect Logic
  if (document.getElementById("typed-text")) {
    new Typed("#typed-text", {
      strings: [
        "AI-powered web products",
        "modern Django applications",
        "clean UI systems",
        "high-performance backends",
        "thoughtful user experiences",
      ],
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 2000,
      loop: true,
    });
  }

  // Navbar Scroll Effect
  window.addEventListener("scroll", () => {
    const nav = document.querySelector(".glass-navbar");
    if (window.scrollY > 50) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }

    // Back to Top Button visibility
    const backToTop = document.getElementById("backToTop");
    if (window.scrollY > 300) {
      backToTop.classList.remove("d-none");
    } else {
      backToTop.classList.add("d-none");
    }
  });

  // Back to Top functionality
  document.getElementById("backToTop")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Skills Filter Logic — initialise with "all" visible on page load
  const filterBtns = document.querySelectorAll(".btn-filter");
  const skillItems = document.querySelectorAll(".skill-item");

  function applySkillFilter(filterValue) {
    skillItems.forEach((item) => {
      const matches = filterValue === "all" || item.getAttribute("data-category") === filterValue;
      item.style.display = matches ? "block" : "none";
      if (matches && window.gsap) {
        gsap.fromTo(item, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.3 });
      } else if (matches) {
        item.style.opacity = "1";
      }
    });
  }

  // Show all skills immediately on page load
  applySkillFilter("all");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applySkillFilter(btn.getAttribute("data-filter"));
    });
  });

  // Progress Bar Animation on Scroll
  const animateProgressBars = () => {
    const progressBars = document.querySelectorAll(".progress-bar");
    progressBars.forEach((bar) => {
      const rect = bar.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        const width = bar.getAttribute("data-width");
        bar.style.width = width;
      }
    });
  };

  window.addEventListener("scroll", animateProgressBars);
  animateProgressBars(); // Initial check

  // Project Filter & Search Logic
  const projectFilterBtns = document.querySelectorAll(".btn-project-filter");
  const projectSearch = document.getElementById("project-search");
  const projectSearchClear = document.getElementById("project-search-clear");
  const projectItems = document.querySelectorAll(".project-item");
  const projectsEmptyState = document.getElementById("projects-empty-state");

  const filterProjects = () => {
    const activeBtn = document.querySelector(".btn-project-filter.active");
    const activeFilter = activeBtn ? activeBtn.getAttribute("data-filter") : "all";
    const searchTerm = (projectSearch?.value || "").toLowerCase().trim();

    if (projectSearchClear) {
      projectSearchClear.classList.toggle("d-none", searchTerm.length === 0);
    }

    let visibleCount = 0;

    projectItems.forEach((item) => {
      const category = item.getAttribute("data-category") || "";
      const title = item.querySelector("h4")?.textContent.toLowerCase() || "";
      const desc = item.querySelector("p")?.textContent.toLowerCase() || "";
      const tech =
        item.querySelector(".tech-stack")?.textContent.toLowerCase() || "";

      const matchesFilter = activeFilter === "all" || category === activeFilter;
      const matchesSearch =
        !searchTerm ||
        title.includes(searchTerm) ||
        desc.includes(searchTerm) ||
        tech.includes(searchTerm);

      if (matchesFilter && matchesSearch) {
        item.style.display = "block";
        visibleCount++;
        if (window.gsap) {
          gsap.fromTo(
            item,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4 },
          );
        }
      } else {
        item.style.display = "none";
      }
    });

    if (projectsEmptyState) {
      projectsEmptyState.classList.toggle("d-none", visibleCount !== 0);
    }
  };

  projectFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      projectFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterProjects();
    });
  });

  projectSearch?.addEventListener("input", filterProjects);
  projectSearchClear?.addEventListener("click", () => {
    if (projectSearch) projectSearch.value = "";
    filterProjects();
    projectSearch?.focus();
  });

  // To-Do App Logic
  const todoInput = document.getElementById("todo-input");
  const addTodoBtn = document.getElementById("add-todo");
  const todoList = document.getElementById("todo-list");

  addTodoBtn?.addEventListener("click", () => {
    const task = todoInput.value.trim();
    if (task) {
      const li = document.createElement("li");
      li.className =
        "d-flex justify-content-between align-items-center mb-2 p-2 rounded bg-white-10 border border-secondary small";
      li.innerHTML = `<span>${task}</span><button class="btn btn-sm text-danger border-0 p-0"><i class="fas fa-times"></i></button>`;
      li.querySelector("button").addEventListener("click", () => li.remove());
      todoList.appendChild(li);
      todoInput.value = "";
      gsap.from(li, { opacity: 0, x: -10, duration: 0.3 });
    }
  });

  // Quick Calc Logic
  const calcDisplay = document.getElementById("calc-display");
  const calcBtns = document.querySelectorAll(".calc-btn");
  let currentInput = "";

  calcBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-val");
      if (val === "C") {
        currentInput = "";
        calcDisplay.textContent = "0";
      } else if (val === "=") {
        try {
          currentInput = eval(currentInput).toString();
          calcDisplay.textContent = currentInput;
        } catch {
          calcDisplay.textContent = "Error";
          currentInput = "";
        }
      } else {
        currentInput += val;
        calcDisplay.textContent = currentInput;
      }
    });
  });

  // API Tester Logic
  const apiInput = document.getElementById("api-input");
  const testApiBtn = document.getElementById("test-api");
  const apiResult = document.getElementById("api-result");

  testApiBtn?.addEventListener("click", async () => {
    const input = apiInput.value.trim();
    if (!input) return;

    testApiBtn.disabled = true;
    testApiBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span>';
    apiResult.classList.add("d-none");

    try {
      const formData = new FormData();
      formData.append("input", input);

      const csrfToken = document.querySelector(
        "[name=csrfmiddlewaretoken]",
      )?.value;

      const headers = {};
      if (csrfToken) {
        formData.append("csrfmiddlewaretoken", csrfToken);
        headers["X-CSRFToken"] = csrfToken;
      }

      const response = await fetch("/api-tester/", {
        method: "POST",
        body: formData,
        headers: headers,
      });

      const contentType = response.headers.get("content-type") || "";
      let data = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        console.error("[API Tester] Server returned non-JSON response:", rawText);
        data = {
          status: "error",
          message: `Server returned non-JSON response (${response.status}).`,
        };
      }

      apiResult.classList.remove("d-none", "text-danger", "text-success");
      apiResult.classList.add(
        data.status === "success" ? "text-success" : "text-danger",
      );
      apiResult.textContent = data.result || data.message || "Unknown response";
      gsap.from(apiResult, { opacity: 0, y: 10, duration: 0.3 });
    } catch (error) {
      console.error("[API Tester] Fetch error:", error);
      apiResult.classList.remove("d-none", "text-success");
      apiResult.classList.add("text-danger");
      apiResult.textContent = "Error: " + error.message;
    } finally {
      testApiBtn.disabled = false;
      testApiBtn.textContent = "Process";
    }
  });

  // Contact Form Submission
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const toastSuccess = document.getElementById("toastSuccess");

  const showToast = (message) => {
    if (!toastSuccess) return;
    toastSuccess.textContent = message;
    toastSuccess.classList.add("show");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toastSuccess.classList.remove("show"), 3200);
  };

  contactForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch("/contact/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      formStatus.classList.remove(
        "d-none",
        "alert",
        "alert-success",
        "alert-danger",
      );
      formStatus.classList.add(
        "alert",
        data.status === "success" ? "alert-success" : "alert-danger",
      );
      formStatus.textContent = data.message;

      if (data.status === "success") {
        contactForm.reset();
        showToast("Message sent successfully. I will get back to you soon.");
      } else {
        showToast(data.message || "Could not send your message right now.");
      }
    } catch (error) {
      formStatus.textContent = "Something went wrong. Please try again later.";
      formStatus.classList.remove("d-none");
      formStatus.classList.add("alert", "alert-danger");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // GitHub Repos Fetcher
  const fetchGitHubRepos = async (username) => {
    const repoContainer = document.getElementById("github-repos");
    if (!repoContainer) return;

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
      );
      const repos = await response.json();

      if (Array.isArray(repos)) {
        repoContainer.innerHTML = repos
          .map(
            (repo) => `
                    <div class="col-md-4 mb-4" data-aos="fade-up">
                        <div class="card h-100 border-0 shadow-sm rounded-4 p-4">
                            <h6 class="fw-bold mb-2"><i class="fab fa-github me-2"></i>${repo.name}</h6>
                            <p class="small text-muted mb-3">${repo.description || "No description provided."}</p>
                            <div class="d-flex justify-content-between align-items-center mt-auto">
                                <span class="badge bg-light text-primary small"><i class="fas fa-code me-1"></i>${repo.language || "Mixed"}</span>
                                <a href="${repo.html_url}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill px-3">View Repo</a>
                            </div>
                        </div>
                    </div>
                `,
          )
          .join("");
      }
    } catch (error) {
      repoContainer.innerHTML =
        '<p class="text-danger text-center w-100">Failed to load GitHub repositories.</p>';
    }
  };

  fetchGitHubRepos("debuggerat4332-sudo");

  // Smooth Scrolling for nav links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const navHeight = document.querySelector(".navbar").offsetHeight;
        window.scrollTo({
          top: target.offsetTop - navHeight,
          behavior: "smooth",
        });
      }
    });
  });

  // ================= Custom Cursor =================
  const cursorOuter = document.querySelector(".custom-cursor");
  const cursorDot = document.querySelector(".cursor-dot");
  if (cursorOuter && cursorDot && !("ontouchstart" in window)) {
    let mouseX = 0, mouseY = 0, outerX = 0, outerY = 0;
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });
    const animateCursor = () => {
      outerX += (mouseX - outerX) * 0.18;
      outerY += (mouseY - outerY) * 0.18;
      cursorOuter.style.left = "0px";
      cursorOuter.style.top = "0px";
      cursorOuter.style.transform = `translate(${outerX}px, ${outerY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.addEventListener("mousedown", () => cursorOuter.classList.add("cursor-click"));
    document.addEventListener("mouseup", () => cursorOuter.classList.remove("cursor-click"));

    const hoverTargets = "a, button, .skill-card, .project-card, input, textarea, .magnetic-btn";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorOuter.classList.add("cursor-hover");
        cursorDot.classList.add("cursor-hover");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorOuter.classList.remove("cursor-hover");
        cursorDot.classList.remove("cursor-hover");
      }
    });
  }

  // ================= Navbar Scroll Progress Bar =================
  const progressBar = document.getElementById("scrollProgressBar");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    }, { passive: true });
  }

  // ================= Magnetic Buttons =================
  document.querySelectorAll(".hero-btn, .btn-primary, .btn-outline-primary").forEach((btn) => {
    btn.classList.add("magnetic-btn");
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      const rotateY = (relX / rect.width) * 18; // 3D tilt left/right
      const rotateX = (-relY / rect.height) * 18; // 3D tilt up/down
      btn.style.transform = `perspective(600px) translate(${relX * 0.25}px, ${relY * 0.3}px) translateZ(16px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform =
        "perspective(600px) translate(0, 0) translateZ(0) rotateX(0) rotateY(0)";
    });

    // Ripple click effect
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.classList.add("ripple-effect");
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  // ================= Scroll reveal for cards and sections =================
  const revealItems = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));

  // Skill 3D flip cards: tap-to-flip support for touch devices
  // (desktop flips via CSS :hover/:focus, see animations-3d.css)
  document.querySelectorAll('.skill-flip-outer').forEach((card) => {
    card.addEventListener('click', () => {
      if ('ontouchstart' in window) {
        card.classList.toggle('is-flipped');
      }
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('is-flipped');
      }
    });
  });

  // ================= GSAP ScrollTrigger Section Animations =================
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Staggered fade/slide for section headers
    document.querySelectorAll(".section, .hero-section").forEach((section) => {
      const header = section.querySelector(".text-center.mb-5, .text-center.mb-4");
      if (header) {
        gsap.from(header.children, {
          scrollTrigger: { trigger: header, start: "top 85%" },
          opacity: 0,
          y: 40,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
        });
      }
    });

    // NOTE: skill cards are handled by applySkillFilter() + reveal-on-scroll observer; no GSAP stagger here.
  }
});
