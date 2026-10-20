(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const payClicks = document.querySelectorAll("[data-buy]");

  const nav = document.querySelector(".nav");
  const progress = document.querySelector(".progress span");
  const onScroll = () => {
    nav.classList.toggle("is-stuck", window.scrollY > 8);
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = height > 0 ? window.scrollY / height : 0;
    progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, ratio)) + ")";
    const dock = document.querySelector(".dock");
    dock.classList.toggle("is-on", window.scrollY > 0);
  };
  onScroll();
  document.addEventListener("scroll", onScroll, { passive: true });

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  const revealables = document.querySelectorAll(".reveal");
  const revealInView = () => {
    const line = window.innerHeight * 0.92;
    revealables.forEach((node) => {
      if (node.getBoundingClientRect().top < line) node.classList.add("is-in");
    });
  };
  if (!reduced) {
    revealInView();
    document.addEventListener("scroll", revealInView, { passive: true });
    window.addEventListener("hashchange", revealInView);
  } else {
    revealables.forEach((node) => node.classList.add("is-in"));
  }

  function switchGroup(buttons, panels, buttonAttr, panelAttr, pressed) {
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute(buttonAttr);
        buttons.forEach((item) => item.setAttribute(pressed, item === button ? "true" : "false"));
        panels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute(panelAttr) === id);
        });
      });
    });
  }

  switchGroup(
    document.querySelectorAll("[data-chapter-tab]"),
    document.querySelectorAll("[data-chapter-panel]"),
    "data-chapter-tab",
    "data-chapter-panel",
    "aria-selected"
  );
  switchGroup(
    document.querySelectorAll("[data-route-tab]"),
    document.querySelectorAll("[data-route-panel]"),
    "data-route-tab",
    "data-route-panel",
    "aria-pressed"
  );

  const grid = document.querySelector("[data-passport]");
  const count = document.querySelector("[data-stamp-count]");
  const storageKey = "ved-100-citas-passport";
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(saved)) saved = [];
  } catch (error) {
    saved = [];
  }
  const stamped = new Set(saved.filter((n) => n >= 1 && n <= 100));

  const paintCount = () => {
    count.textContent = stamped.size + " / 100";
  };

  for (let number = 1; number <= 100; number += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stamp";
    button.textContent = String(number).padStart(3, "0");
    button.setAttribute("aria-label", "Marcar la cita " + String(number).padStart(3, "0"));
    button.setAttribute("aria-pressed", stamped.has(number) ? "true" : "false");
    if (stamped.has(number)) button.classList.add("is-on");
    button.addEventListener("click", () => {
      if (stamped.has(number)) stamped.delete(number);
      else stamped.add(number);
      button.classList.toggle("is-on", stamped.has(number));
      button.setAttribute("aria-pressed", stamped.has(number) ? "true" : "false");
      paintCount();
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(stamped)));
      } catch (error) {
        /* Private mode can block storage. The stamp still works for this visit. */
      }
    });
    grid.appendChild(button);
  }
  paintCount();

  document.querySelectorAll("video").forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    if (reduced) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      }, { threshold: 0.3 });
      videoObserver.observe(video);
    }
  });

  const nudge = document.querySelector("#nudge");
  const nudgeKey = "ved-nudge-seen";
  let nudgeTimer = 0;
  const openNudge = () => {
    if (!nudge || nudge.hidden === false) return;
    try {
      if (sessionStorage.getItem(nudgeKey) || sessionStorage.getItem("ved-buy-click")) return;
      sessionStorage.setItem(nudgeKey, "1");
    } catch (error) {
      return;
    }
    nudge.hidden = false;
    const close = nudge.querySelector(".nudge-close");
    if (close) close.focus();
  };
  const closeNudge = () => {
    nudge.hidden = true;
  };
  nudge.querySelectorAll("[data-close-nudge]").forEach((node) => {
    node.addEventListener("click", closeNudge);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !nudge.hidden) closeNudge();
  });
  document.documentElement.addEventListener("mouseleave", (event) => {
    if (event.clientY > 8) return;
    openNudge();
  });
  nudgeTimer = window.setTimeout(() => {
    if (window.scrollY > window.innerHeight * 0.8) openNudge();
  }, 28000);
  window.addEventListener("pagehide", () => window.clearTimeout(nudgeTimer));

  payClicks.forEach((link) => {
    link.addEventListener("click", () => {
      try { sessionStorage.setItem("ved-buy-click", "1"); } catch (error) { /* ignore */ }
    });
  });
})();
