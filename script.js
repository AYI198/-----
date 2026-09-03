window.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector(".codrops_mwg");

  if (!root || typeof gsap === "undefined") {
    return;
  }

  const images = [];
  root.querySelectorAll(".medias img").forEach((image) => {
    images.push(image.getAttribute("src"));
  });

  let incr = 0;
  let oldIncrX = 0;
  let oldIncrY = 0;
  let firstMove = true;
  let indexImg = 0;

  const isCoarsePointer = window.matchMedia("(hover: none)").matches;
  const resetDist = window.innerWidth / (isCoarsePointer ? 6 : 8);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const clampX = gsap.utils.clamp(0, W);
  const clampY = gsap.utils.clamp(0, H);

  function applyMove(clientX, clientY) {
    const valX = clampX(clientX);
    const valY = clampY(clientY);

    if (firstMove) {
      firstMove = false;
      oldIncrX = valX;
      oldIncrY = valY;
      return;
    }

    incr += Math.abs(valX - oldIncrX) + Math.abs(valY - oldIncrY);

    if (incr > resetDist) {
      incr = 0;
      createMedia(valX, valY - root.getBoundingClientRect().top, valX - oldIncrX, valY - oldIncrY);
    }

    oldIncrX = valX;
    oldIncrY = valY;
  }

  function handleMouseMove(event) {
    applyMove(event.clientX, event.clientY);
  }

  function handleTouchMove(event) {
    if (!event.touches || !event.touches[0]) {
      return;
    }

    applyMove(event.touches[0].clientX, event.touches[0].clientY);
  }

  root.addEventListener("mousemove", handleMouseMove);
  root.addEventListener("touchstart", handleTouchMove, { passive: true });
  root.addEventListener("touchmove", handleTouchMove, { passive: true });

  function createMedia(x, y, deltaX, deltaY) {
    const H = window.innerHeight;

    if (y > H - 200) {
      return;
    }

    const image = document.createElement("img");
    image.setAttribute("src", images[indexImg]);
    root.appendChild(image);

    const tl = gsap.timeline({
      onComplete: () => {
        root.removeChild(image);
        tl && tl.kill();
      }
    });

    tl.fromTo(
      image,
      {
        xPercent: -50 + (Math.random() - 0.5) * 80,
        yPercent: -50 + (Math.random() - 0.5) * 10,
        scaleX: 1.3,
        scaleY: 1.3,
        rotation: (Math.random() - 0.5) * 20
      },
      {
        scaleX: 1,
        scaleY: 1,
        ease: "elastic.out(2, 0.6)",
        duration: 0.4
      }
    );

    tl.fromTo(
      image,
      {
        x
      },
      {
        x: `+=${deltaX * 2}`,
        rotation: 0,
        ease: "power1.in",
        duration: 0.4
      },
      "<"
    );

    tl.fromTo(
      image,
      {
        y
      },
      {
        y: `+=${H - y}`,
        scale: 0.9,
        yPercent: -95,
        ease: "back.in(1.1)",
        duration: 0.4
      },
      "<"
    );

    tl.to(image, {
      x: `+=${deltaX * 1.6}`,
      rotation: (Math.random() - 0.5) * 40,
      ease: "power1.in",
      duration: 0.3
    });

    tl.to(
      image,
      {
        yPercent: 150,
        ease: `back.in(${1.5 + (1 - y / H)})`,
        duration: 0.3
      },
      "<"
    );

    indexImg = (indexImg + 1) % images.length;
  }

  const observer = new MutationObserver((mutations) => {
    const isRootRemoved = mutations.some(
      (mutation) => mutation.type === "childList" && Array.from(mutation.removedNodes).includes(root)
    );

    if (isRootRemoved) {
      root.removeEventListener("mousemove", handleMouseMove);
      root.removeEventListener("touchstart", handleTouchMove);
      root.removeEventListener("touchmove", handleTouchMove);
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

window.addEventListener("DOMContentLoaded", () => {
  const protectedMediaSelector = "img, video";

  function isProtectedMediaTarget(target) {
    return target instanceof Element && Boolean(target.closest(protectedMediaSelector));
  }

  document.querySelectorAll(protectedMediaSelector).forEach((media) => {
    media.setAttribute("draggable", "false");

    if (media instanceof HTMLVideoElement) {
      media.controlsList?.add("nodownload", "noplaybackrate", "noremoteplayback");
      media.disablePictureInPicture = true;
      media.disableRemotePlayback = true;
    }
  });

  document.addEventListener("contextmenu", (event) => {
    if (isProtectedMediaTarget(event.target)) {
      event.preventDefault();
    }
  });

  document.addEventListener("dragstart", (event) => {
    if (isProtectedMediaTarget(event.target)) {
      event.preventDefault();
    }
  });

  document.addEventListener("selectstart", (event) => {
    if (isProtectedMediaTarget(event.target)) {
      event.preventDefault();
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
    }
  });

  const loader = document.querySelector(".site-loader");
  const loaderCount = document.querySelector("[data-loader-count]");
  const loaderProgress = document.querySelector(".site-loader__progress span");

  function revealLoadedSite() {
    document.body.classList.add("site-ready");
    document.body.classList.remove("is-loading");

    if (!loader) {
      return;
    }

    loader.classList.add("is-done");
    window.setTimeout(() => {
      loader.hidden = true;
    }, 680);
  }

  if (loader && loaderCount) {
    const duration = 1650;
    const startAt = performance.now() + 160;

    function updateLoader(now) {
      if (now < startAt) {
        window.requestAnimationFrame(updateLoader);
        return;
      }

      const progress = Math.min((now - startAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * 100);

      loaderCount.textContent = String(value);

      if (loaderProgress) {
        loaderProgress.style.transform = `scaleX(${progress})`;
      }

      if (progress < 1) {
        window.requestAnimationFrame(updateLoader);
      } else {
        loaderCount.textContent = "100";
        if (loaderProgress) {
          loaderProgress.style.transform = "scaleX(1)";
        }
        window.setTimeout(revealLoadedSite, 240);
      }
    }

    window.requestAnimationFrame(updateLoader);
  } else {
    revealLoadedSite();
  }

  const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
  const navTargets = navLinks
    .map((link) => {
      const id = link.getAttribute("href").slice(1);
      const element = id === "top" ? document.querySelector(".eliot-hero, .codrops_mwg") : document.getElementById(id);
      return { id, link, element };
    })
    .filter((item) => item.element);
  let navTicking = false;

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  }

  function syncActiveNav() {
    navTicking = false;

    const anchorLine = window.scrollY + Math.max(120, window.innerHeight * 0.32);
    let activeId = "top";

    navTargets.forEach(({ id, element }) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      if (top <= anchorLine) {
        activeId = id;
      }
    });

    setActiveNav(activeId);
  }

  function requestNavSync() {
    if (navTicking) {
      return;
    }

    navTicking = true;
    window.requestAnimationFrame(syncActiveNav);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href").slice(1);
      setActiveNav(id);
    });
  });

  syncActiveNav();
  window.addEventListener("scroll", requestNavSync, { passive: true });
  window.addEventListener("resize", requestNavSync);

  const eliotHero = document.querySelector(".eliot-hero");

  if (eliotHero && window.matchMedia("(hover: hover)").matches) {
    let heroFrame = 0;

    eliotHero.addEventListener("pointermove", (event) => {
      if (heroFrame) {
        return;
      }

      heroFrame = window.requestAnimationFrame(() => {
        const rect = eliotHero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const dotX = ((event.clientX - rect.left) / rect.width) * 100;
        const dotY = ((event.clientY - rect.top) / rect.height) * 100;

        eliotHero.style.setProperty("--hero-shift-x", `${x * 16}px`);
        eliotHero.style.setProperty("--hero-shift-y", `${y * 10}px`);
        eliotHero.style.setProperty("--hero-dot-x", `${dotX}%`);
        eliotHero.style.setProperty("--hero-dot-y", `${dotY}%`);
        eliotHero.classList.add("is-pointer-active");
        heroFrame = 0;
      });
    }, { passive: true });

    eliotHero.addEventListener("pointerleave", () => {
      eliotHero.style.removeProperty("--hero-shift-x");
      eliotHero.style.removeProperty("--hero-shift-y");
      eliotHero.style.removeProperty("--hero-dot-x");
      eliotHero.style.removeProperty("--hero-dot-y");
      eliotHero.classList.remove("is-pointer-active");
    });
  }

  const thanksScreen = document.querySelector(".thanks-screen");

  if (thanksScreen && window.matchMedia("(hover: hover)").matches) {
    let thanksFrame = 0;

    thanksScreen.addEventListener("pointermove", (event) => {
      if (thanksFrame) {
        return;
      }

      thanksFrame = window.requestAnimationFrame(() => {
        const rect = thanksScreen.getBoundingClientRect();
        const dotX = ((event.clientX - rect.left) / rect.width) * 100;
        const dotY = ((event.clientY - rect.top) / rect.height) * 100;

        thanksScreen.style.setProperty("--thanks-dot-x", `${dotX}%`);
        thanksScreen.style.setProperty("--thanks-dot-y", `${dotY}%`);
        thanksScreen.classList.add("is-pointer-active");
        thanksFrame = 0;
      });
    }, { passive: true });

    thanksScreen.addEventListener("pointerleave", () => {
      thanksScreen.style.removeProperty("--thanks-dot-x");
      thanksScreen.style.removeProperty("--thanks-dot-y");
      thanksScreen.classList.remove("is-pointer-active");
    });
  }

  const circularGallery = document.querySelector(".eliot-work-strip");

  if (circularGallery) {
    const galleryCards = Array.from(circularGallery.querySelectorAll(".eliot-work-card"));
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isSmallScreen && !prefersReducedMotion && galleryCards.length > 1) {
      const state = {
        current: Math.floor(galleryCards.length / 2),
        target: Math.floor(galleryCards.length / 2),
        isDown: false,
        startX: 0,
        startTarget: 0,
        moved: false,
        lastDragAt: 0,
        wheelTimer: 0
      };
      let isGalleryVisible = !("IntersectionObserver" in window);
      let circularFrame = 0;

      function queueCircularRender() {
        if (!isGalleryVisible || circularFrame) {
          return;
        }

        circularFrame = window.requestAnimationFrame(renderCircularGallery);
      }

      function wrapOffset(index, center) {
        const total = galleryCards.length;
        return ((((index - center) + total / 2) % total) + total) % total - total / 2;
      }

      function getSpacing() {
        return Math.min(310, Math.max(170, circularGallery.clientWidth * 0.22));
      }

      function settleTarget() {
        state.target = Math.round(state.target);
      }

      function renderCircularGallery() {
        circularFrame = 0;
        if (!isGalleryVisible) {
          return;
        }

        state.current += (state.target - state.current) * 0.075;

        if (Math.abs(state.target - state.current) < 0.001) {
          state.current = state.target;
        }

        const spacing = getSpacing();

        galleryCards.forEach((card, index) => {
          const offset = wrapOffset(index, state.current);
          const distance = Math.abs(offset);
          const normalized = Math.min(distance / 2.35, 1);
          const x = offset * spacing;
          const y = Math.pow(normalized, 1.55) * 78 - 16;
          const rotation = offset * 8.5;
          const scale = 1.08 - normalized * 0.22;
          const opacity = 0.44 + (1 - normalized) * 0.56;
          const blur = normalized * 1.8;
          const light = 1 - normalized * 0.18;

          card.style.setProperty("--circular-x", `${x}px`);
          card.style.setProperty("--circular-y", `${y}px`);
          card.style.setProperty("--circular-r", `${rotation}deg`);
          card.style.setProperty("--circular-s", scale.toFixed(3));
          card.style.setProperty("--circular-o", opacity.toFixed(3));
          card.style.setProperty("--circular-blur", `${blur.toFixed(2)}px`);
          card.style.setProperty("--circular-light", light.toFixed(3));
          card.style.setProperty("--circular-z", String(100 - Math.round(normalized * 30)));
        });

        queueCircularRender();
      }

      function pointerEnd() {
        if (!state.isDown) {
          return;
        }

        state.isDown = false;
        circularGallery.classList.remove("is-dragging");
        settleTarget();

        if (state.moved) {
          state.lastDragAt = Date.now();
        }
      }

      circularGallery.addEventListener("pointerdown", (event) => {
        state.isDown = true;
        state.moved = false;
        state.startX = event.clientX;
        state.startTarget = state.target;
        circularGallery.classList.add("is-dragging");
        circularGallery.setPointerCapture?.(event.pointerId);
      });

      circularGallery.addEventListener("pointermove", (event) => {
        if (!state.isDown) {
          return;
        }

        const dragDelta = (state.startX - event.clientX) / getSpacing();
        state.target = state.startTarget + dragDelta;
        state.moved = Math.abs(dragDelta) > 0.08;
        event.preventDefault();
      });

      circularGallery.addEventListener("pointerup", pointerEnd);
      circularGallery.addEventListener("pointercancel", pointerEnd);
      circularGallery.addEventListener("pointerleave", pointerEnd);

      circularGallery.addEventListener(
        "wheel",
        (event) => {
          event.preventDefault();
          const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
          state.target += delta > 0 ? 0.32 : -0.32;
          window.clearTimeout(state.wheelTimer);
          state.wheelTimer = window.setTimeout(settleTarget, 160);
        },
        { passive: false }
      );

      circularGallery.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          state.target += 1;
          settleTarget();
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          state.target -= 1;
          settleTarget();
        }
      });

      galleryCards.forEach((card, index) => {
        card.addEventListener("click", (event) => {
          if (state.moved || Date.now() - state.lastDragAt < 160) {
            event.preventDefault();
            return;
          }

          const offset = wrapOffset(index, Math.round(state.target));
          if (Math.abs(offset) > 0.5) {
            state.target = index;
          }
        });
      });

      window.addEventListener("resize", settleTarget);

      if ("IntersectionObserver" in window) {
        const galleryVisibilityObserver = new IntersectionObserver(
          ([entry]) => {
            isGalleryVisible = entry.isIntersecting;
            if (isGalleryVisible) {
              queueCircularRender();
            }
          },
          { rootMargin: "180px" }
        );
        galleryVisibilityObserver.observe(circularGallery);
      } else {
        isGalleryVisible = true;
      }

      queueCircularRender();
    }
  }

  const revealSections = document.querySelectorAll(".portfolio-screen");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const items = entry.target.querySelectorAll(".reveal-item, .reveal-title, .resume-item");
        items.forEach((item, index) => {
          item.style.setProperty("--delay", `${Math.min(index * 80, 560)}ms`);
        });

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealSections.forEach((section) => revealObserver.observe(section));

  document.querySelectorAll(".glow-card").forEach((card) => {
    let glowFrame = 0;
    let latestGlowEvent = null;

    function updateGlowCard() {
      glowFrame = 0;
      if (!latestGlowEvent) {
        return;
      }

      const event = latestGlowEvent;
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);

      if (!card.classList.contains("work-card")) {
        return;
      }

      const rotateX = (50 - y) * 0.035;
      const rotateY = (x - 50) * 0.035;
      card.style.transform = `translateY(-18px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    card.addEventListener("pointermove", (event) => {
      latestGlowEvent = event;
      if (glowFrame) {
        return;
      }

      glowFrame = window.requestAnimationFrame(updateGlowCard);
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      if (glowFrame) {
        window.cancelAnimationFrame(glowFrame);
        glowFrame = 0;
      }
      latestGlowEvent = null;
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
      if (card.classList.contains("work-card")) {
        card.style.transform = "";
      }
    });
  });

  const workCards = document.querySelectorAll(".work-card");
  const workIndex = document.querySelector(".work-index");

  function activateWorkCard(current) {
    workIndex?.classList.add("is-hovering");

    workCards.forEach((card) => {
      const isCurrent = card === current;
      card.classList.toggle("is-active", isCurrent);
      card.classList.toggle("is-dim", !isCurrent);
    });
  }

  function clearWorkCards() {
    workIndex?.classList.remove("is-hovering");

    workCards.forEach((card) => {
      card.classList.remove("is-active", "is-dim");
    });
  }

  workCards.forEach((card) => {
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      activateWorkCard(card);
    });

    card.addEventListener("focusin", () => {
      activateWorkCard(card);
    });
  });

  if (workIndex) {
    workIndex.addEventListener("mouseleave", () => {
      clearWorkCards();
    });
  }

  function normalizeLoopOffset(value, distance) {
    if (!Number.isFinite(distance) || distance <= 0) {
      return value;
    }

    const wrapped = value % distance;
    return Math.abs(wrapped) < 0.01 ? 0 : wrapped;
  }

  function setupDragCarousel(target, options = {}) {
    const axis = options.axis || "x";
    const offsetName = options.offsetName || "--drag-x";
    const distanceName = options.distanceName || "--marquee-distance";
    const shouldLoop = Boolean(options.loop);
    const viewport = options.viewport || target.parentElement;
    const dragClassTarget = options.dragClassTarget || target;
    let dragState = null;

    function getEventPosition(event) {
      return axis === "y" ? event.clientY : event.clientX;
    }

    function getLoopDistance() {
      const rawDistance =
        target.style.getPropertyValue(distanceName) ||
        window.getComputedStyle(target).getPropertyValue(distanceName);
      return Math.abs(parseFloat(rawDistance)) || 0;
    }

    function getBounds() {
      if (!viewport) {
        return { min: 0, max: 0 };
      }

      const contentSize = axis === "y" ? target.scrollHeight : target.scrollWidth;
      const viewportSize = axis === "y" ? viewport.clientHeight : viewport.clientWidth;
      return {
        min: Math.min(0, viewportSize - contentSize),
        max: 0
      };
    }

    function clampOffset(value) {
      const bounds = getBounds();
      return Math.min(bounds.max, Math.max(bounds.min, value));
    }

    function setOffset(value) {
      const nextValue = shouldLoop ? value : clampOffset(value);
      target.dataset.dragOffset = String(nextValue);
      target.style.setProperty(offsetName, `${nextValue}px`);
    }

    function syncOffset() {
      const value = parseFloat(target.dataset.dragOffset || "0") || 0;
      setOffset(shouldLoop ? normalizeLoopOffset(value, getLoopDistance()) : value);
    }

    target.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }

      dragState = {
        pointerId: event.pointerId,
        startPosition: getEventPosition(event),
        startOffset: shouldLoop
          ? parseFloat(target.dataset.dragOffset || "0") || 0
          : clampOffset(parseFloat(target.dataset.dragOffset || "0") || 0),
        hasMoved: false
      };

      if (shouldLoop) {
        target.style.animationPlayState = "paused";
      }

      dragClassTarget.classList.add("is-dragging");
    });

    target.addEventListener("pointermove", (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      const delta = getEventPosition(event) - dragState.startPosition;

      if (Math.abs(delta) > 6) {
        dragState.hasMoved = true;
        target.dataset.dragMoved = "true";
      }

      setOffset(dragState.startOffset + delta);
      event.preventDefault();
    });

    function endDrag(event) {
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      syncOffset();
      target.style.removeProperty("animation-play-state");
      dragClassTarget.classList.remove("is-dragging");

      if (dragState.hasMoved) {
        window.setTimeout(() => {
          delete target.dataset.dragMoved;
        }, 180);
      }

      dragState = null;
    }

    target.addEventListener("pointerup", endDrag);
    target.addEventListener("pointercancel", endDrag);

    window.addEventListener("resize", syncOffset);
    syncOffset();
    return syncOffset;
  }

  document.querySelectorAll(".project-showcase").forEach((showcase) => {
    const lightbox = showcase.querySelector(".image-lightbox");
    const lightboxImage = lightbox?.querySelector(".image-lightbox__image");
    const lightboxCaption = lightbox?.querySelector(".image-lightbox__caption");
    const lightboxClose = lightbox?.querySelector(".image-lightbox__close");
    const projectLabel = showcase.querySelector(".project-detail-title p")?.textContent?.trim() || "Poster Campaign";
    const lightboxHome = lightbox?.parentElement || null;
    let activeLightboxTrigger = null;

    function mountLightbox() {
      if (lightbox && lightbox.parentElement !== document.body) {
        document.body.appendChild(lightbox);
      }
    }

    function restoreLightbox() {
      if (lightbox && lightboxHome && lightbox.parentElement !== lightboxHome) {
        lightboxHome.appendChild(lightbox);
      }
    }

    function closeLightbox() {
      if (!lightbox || !lightboxImage) {
        return;
      }

      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-lightbox-open");
      lightboxImage.removeAttribute("src");
      restoreLightbox();

      if (activeLightboxTrigger) {
        activeLightboxTrigger.focus({ preventScroll: true });
        activeLightboxTrigger = null;
      }
    }

    function openLightbox(tile) {
      const image = tile.querySelector("img");

      if (!lightbox || !lightboxImage || !image) {
        return;
      }

      activeLightboxTrigger = tile.matches("[tabindex]") ? tile : null;
      lightboxImage.src = image.dataset.fullSrc || image.currentSrc || image.src;
      lightboxImage.alt = image.alt || "Selected portfolio image";
      mountLightbox();

      if (lightboxCaption) {
        const visibleTiles = Array.from(showcase.querySelectorAll(".showcase-tile:not([aria-hidden='true'])"));
        const itemIndex = visibleTiles.indexOf(tile);
        lightboxCaption.textContent = itemIndex >= 0 ? `${projectLabel} ${String(itemIndex + 1).padStart(2, "0")}` : projectLabel;
      }

      lightbox.setAttribute("aria-hidden", "false");
      lightbox.dataset.openedAt = String(Date.now());
      document.body.classList.add("is-lightbox-open");
      lightboxClose?.focus({ preventScroll: true });
    }

    function handleTileClick(event) {
      const tile = event.currentTarget;
      if (tile.closest(".showcase-track")?.dataset.dragMoved === "true") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      openLightbox(tile);
    }

    function handleTileKeydown(event) {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openLightbox(event.currentTarget);
    }

    function prepareTileInteraction(tile, index = 0) {
      tile.style.setProperty("--tile-delay", `${Math.min(index * 42, 520)}ms`);

      if (tile.getAttribute("aria-hidden") !== "true") {
        tile.setAttribute("role", "button");
        tile.setAttribute("tabindex", "0");
      }

      if (tile.dataset.lightboxReady === "true") {
        return;
      }

      tile.dataset.lightboxReady = "true";
      tile.addEventListener("click", handleTileClick);
      tile.addEventListener("keydown", handleTileKeydown);
    }

    showcase.addEventListener("pointerup", (event) => {
      if (event.button !== 0) {
        return;
      }

      const tile = event.target.closest(".showcase-tile");
      if (!tile || !showcase.contains(tile)) {
        return;
      }

      if (tile.closest(".showcase-track")?.dataset.dragMoved === "true") {
        return;
      }

      openLightbox(tile);
    });

    showcase.querySelectorAll(".showcase-track").forEach((track) => {
      const originals = Array.from(track.children);
      const shouldUseIntrinsicRatio = Boolean(track.closest(".showcase-gallery--social, .showcase-gallery--intrinsic"));

      const syncDragBounds = setupDragCarousel(track, {
        axis: "x",
        offsetName: "--drag-x",
        distanceName: "--marquee-distance",
        loop: true,
        viewport: track.closest(".showcase-gallery"),
        dragClassTarget: track
      });

      function applyIntrinsicRatio(tile) {
        if (!shouldUseIntrinsicRatio) {
          return;
        }

        const image = tile.querySelector("img");
        if (!image?.naturalWidth || !image?.naturalHeight) {
          return;
        }

        tile.style.setProperty("--image-ratio", `${image.naturalWidth} / ${image.naturalHeight}`);
      }

      function applyTrackRatios() {
        if (!shouldUseIntrinsicRatio) {
          return;
        }

        Array.from(track.children).forEach(applyIntrinsicRatio);
      }

      function removeCloneSet() {
        Array.from(track.querySelectorAll(".showcase-tile[aria-hidden='true']")).forEach((tile) => {
          tile.remove();
        });
      }

      function appendCloneSet() {
        originals.forEach((tile) => {
          applyIntrinsicRatio(tile);
          const clone = tile.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          clone.removeAttribute("role");
          clone.removeAttribute("tabindex");
          track.appendChild(clone);
          prepareTileInteraction(clone);
        });
      }

      function ensureTrackCoverage() {
        removeCloneSet();
        applyTrackRatios();

        const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
        const originalWidth = originals.reduce((total, tile) => total + tile.getBoundingClientRect().width, 0);
        const originalSetWidth = originalWidth + Math.max(originals.length - 1, 0) * gap;

        if (!originalSetWidth) {
          return;
        }

        track.style.setProperty("--marquee-distance", `${originalSetWidth + gap}px`);

        while (track.scrollWidth < window.innerWidth + originalSetWidth) {
          appendCloneSet();
        }

        applyTrackRatios();
        syncDragBounds();
      }

      if (shouldUseIntrinsicRatio) {
        originals.forEach((tile) => {
          const image = tile.querySelector("img");
          image?.addEventListener("load", () => {
            applyTrackRatios();
            ensureTrackCoverage();
          }, { once: true });
        });
      }

      ensureTrackCoverage();
      window.addEventListener("resize", ensureTrackCoverage);
    });

    showcase.querySelectorAll(".showcase-tile").forEach((tile, index) => {
      prepareTileInteraction(tile, index);
    });

    lightbox?.addEventListener("click", (event) => {
      const openedAt = Number(lightbox.dataset.openedAt || 0);
      if (event.target === lightbox) {
        if (Date.now() - openedAt < 240) {
          return;
        }

        closeLightbox();
      }
    });

    lightboxClose?.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox?.getAttribute("aria-hidden") === "false") {
        closeLightbox();
      }
    });
  });

  document.querySelectorAll(".amazon-scroll-track").forEach((track) => {
    const stage = track.closest(".amazon-scroll-stage");
    const originalPanels = Array.from(track.querySelectorAll(".amazon-scroll-panel"));

    const syncDragBounds = setupDragCarousel(track, {
      axis: "y",
      offsetName: "--drag-y",
      distanceName: "--amazon-scroll-distance",
      loop: true,
      viewport: stage,
      dragClassTarget: stage || track
    });

    function resetAmazonClones() {
      Array.from(track.querySelectorAll(".amazon-scroll-panel[aria-hidden='true']")).forEach((panel) => {
        panel.remove();
      });
    }

    function appendAmazonCloneSet() {
      originalPanels.forEach((panel) => {
        const clone = panel.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });
    }

    function updateAmazonScrollDistance() {
      const firstPanel = originalPanels[0];
      if (!firstPanel) {
        return;
      }

      resetAmazonClones();
      const gap = parseFloat(window.getComputedStyle(track).rowGap) || 0;
      const distance = firstPanel.getBoundingClientRect().height + gap;
      if (!distance) {
        return;
      }

      track.style.setProperty("--amazon-scroll-distance", `${distance}px`);

      while (track.scrollHeight < (stage?.clientHeight || 0) + distance) {
        appendAmazonCloneSet();
      }

      syncDragBounds();
    }

    updateAmazonScrollDistance();
    window.addEventListener("resize", updateAmazonScrollDistance);

    track.querySelectorAll("img").forEach((image) => {
      image.addEventListener("load", updateAmazonScrollDistance, { once: true });
    });
  });

  document.querySelectorAll(".amazon-showcase").forEach((amazonShowcase) => {
    const amazonStage = amazonShowcase.querySelector(".amazon-scroll-stage");
    const lightbox = amazonShowcase.querySelector(".image-lightbox");
    const lightboxImage = lightbox?.querySelector(".image-lightbox__image");
    const lightboxCaption = lightbox?.querySelector(".image-lightbox__caption");
    const lightboxClose = lightbox?.querySelector(".image-lightbox__close");
    const lightboxScroll = lightbox?.querySelector(".image-lightbox__scroll");
    const projectLabel = amazonShowcase.querySelector(".project-detail-title p")?.textContent?.trim() || "Amazon Visual Design";
    const lightboxHome = lightbox?.parentElement || null;

    function mountAmazonLightbox() {
      if (lightbox && lightbox.parentElement !== document.body) {
        document.body.appendChild(lightbox);
      }
    }

    function restoreAmazonLightbox() {
      if (lightbox && lightboxHome && lightbox.parentElement !== lightboxHome) {
        lightboxHome.appendChild(lightbox);
      }
    }

    function closeAmazonLightbox() {
      if (!lightbox || !lightboxImage) {
        return;
      }

      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-lightbox-open");
      lightboxImage.removeAttribute("src");
      restoreAmazonLightbox();
      amazonStage?.focus({ preventScroll: true });
    }

    function openAmazonLightbox(event) {
      if (event?.type === "click" && amazonShowcase.querySelector(".amazon-scroll-track")?.dataset.dragMoved === "true") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const image =
        amazonShowcase.querySelector(".amazon-scroll-panel:not([aria-hidden='true']) img") ||
        amazonShowcase.querySelector(".amazon-scroll-panel img");

      if (!lightbox || !lightboxImage || !image) {
        return;
      }

      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || "Amazon visual design long image";
      mountAmazonLightbox();

      if (lightboxCaption) {
        lightboxCaption.textContent = `${projectLabel} 01`;
      }

      lightboxScroll?.scrollTo({ top: 0, left: 0 });
      lightbox.setAttribute("aria-hidden", "false");
      lightbox.dataset.openedAt = String(Date.now());
      document.body.classList.add("is-lightbox-open");
      lightboxClose?.focus({ preventScroll: true });
    }

    if (amazonStage) {
      amazonStage.setAttribute("role", "button");
      amazonStage.setAttribute("tabindex", "0");
      amazonStage.setAttribute("aria-label", "点击放大查看亚马逊设计长图");

      amazonStage.addEventListener("click", openAmazonLightbox);
      amazonStage.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        openAmazonLightbox();
      });
    }

    lightbox?.addEventListener("click", (event) => {
      const openedAt = Number(lightbox.dataset.openedAt || 0);
      if (event.target === lightbox) {
        if (Date.now() - openedAt < 240) {
          return;
        }

        closeAmazonLightbox();
      }
    });

    lightboxClose?.addEventListener("click", closeAmazonLightbox);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox?.getAttribute("aria-hidden") === "false") {
        closeAmazonLightbox();
      }
    });
  });

  const portfolioVideos = Array.from(document.querySelectorAll(".video-stage video"));

  portfolioVideos.forEach((video) => {
    const stage = video.closest(".video-stage");
    const playButton = stage?.querySelector(".video-stage__play");
    const timeLabel = stage?.querySelector(".video-time");
    const progress = stage?.querySelector(".video-progress");
    const audioButton = stage?.querySelector(".video-audio");
    let isSeeking = false;
    let isShowingCover = false;

    function formatTime(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
      }

      const totalSeconds = Math.floor(seconds);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");

      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${remainingSeconds}`;
      }

      return `${minutes}:${remainingSeconds}`;
    }

    function syncAudioButton() {
      if (!audioButton) {
        return;
      }

      const isMuted = video.muted || video.volume === 0;
      audioButton.classList.toggle("is-muted", isMuted);
      audioButton.setAttribute("aria-pressed", String(isMuted));
      audioButton.setAttribute("aria-label", isMuted ? "打开声音" : "关闭声音");
    }

    function syncProgress() {
      if (!stage || !Number.isFinite(video.duration) || video.duration <= 0) {
        if (timeLabel) {
          timeLabel.textContent = "0:00 / 0:00";
        }
        return;
      }

      const displayTime = isShowingCover ? 0 : video.currentTime;
      const progressValue = Math.max(0, Math.min(displayTime / video.duration, 1)) * 100;
      stage.style.setProperty("--video-progress", `${progressValue}%`);
      if (timeLabel) {
        timeLabel.textContent = `${formatTime(displayTime)} / ${formatTime(video.duration)}`;
      }
      progress?.setAttribute("aria-valuenow", String(Math.round(progressValue)));
    }

    function seekFromPointer(event) {
      if (!progress || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      const rect = progress.getBoundingClientRect();
      const ratio = Math.max(0, Math.min((event.clientX - rect.left) / rect.width, 1));
      isShowingCover = false;
      video.currentTime = ratio * video.duration;
      syncProgress();
    }

    function togglePlayback() {
      if (video.paused) {
        if (isShowingCover) {
          video.currentTime = 0;
          isShowingCover = false;
          syncProgress();
        }
        video.play();
      } else {
        video.pause();
      }
    }

    video.muted = false;
    if (video.volume === 0) {
      video.volume = 1;
    }
    syncAudioButton();

    if (video.readyState >= 1) {
      syncProgress();
    } else {
      video.addEventListener("loadedmetadata", syncProgress, { once: true });
    }

    video.addEventListener("durationchange", syncProgress);
    video.addEventListener("timeupdate", syncProgress);
    video.addEventListener("seeked", syncProgress);
    video.addEventListener("volumechange", syncAudioButton);

    video.addEventListener("play", () => {
      portfolioVideos.forEach((otherVideo) => {
        if (otherVideo !== video) {
          otherVideo.pause();
        }
      });

      stage?.classList.add("is-playing");
    });

    video.addEventListener("pause", () => {
      stage?.classList.remove("is-playing");
    });

    video.addEventListener("ended", () => {
      stage?.classList.remove("is-playing");
    });

    playButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      togglePlayback();
    });

    video.addEventListener("click", () => {
      togglePlayback();
    });

    audioButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) {
        video.volume = 1;
      }
      syncAudioButton();
    });

    progress?.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      isSeeking = true;
      stage?.classList.add("is-seeking");
      progress.setPointerCapture?.(event.pointerId);
      seekFromPointer(event);
    });

    progress?.addEventListener("pointermove", (event) => {
      if (isSeeking) {
        seekFromPointer(event);
      }
    });

    progress?.addEventListener("pointerup", (event) => {
      if (!isSeeking) {
        return;
      }

      seekFromPointer(event);
      isSeeking = false;
      stage?.classList.remove("is-seeking");
      progress.releasePointerCapture?.(event.pointerId);
    });

    progress?.addEventListener("pointercancel", () => {
      isSeeking = false;
      stage?.classList.remove("is-seeking");
    });

    progress?.addEventListener("keydown", (event) => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      const step = event.shiftKey ? 10 : 5;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        isShowingCover = false;
        video.currentTime = Math.max(0, video.currentTime - step);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        isShowingCover = false;
        video.currentTime = Math.min(video.duration, video.currentTime + step);
      } else if (event.key === "Home") {
        event.preventDefault();
        isShowingCover = false;
        video.currentTime = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        isShowingCover = false;
        video.currentTime = video.duration;
      }

      syncProgress();
    });
  });

  function activateResumeItem(current) {
    const group = current.closest(".resume-accordion");

    group.querySelectorAll(".resume-item").forEach((item) => {
      const isCurrent = item === current;
      const itemTrigger = item.querySelector(".resume-trigger");
      const marker = itemTrigger.querySelector("b");

      item.classList.toggle("is-open", isCurrent);
      itemTrigger.setAttribute("aria-expanded", String(isCurrent));
      marker.textContent = isCurrent ? "-" : "+";
    });
  }

  document.querySelectorAll(".resume-item").forEach((item) => {
    item.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      activateResumeItem(item);
    });

    item.querySelector(".resume-trigger").addEventListener("focus", () => {
      activateResumeItem(item);
    });

    item.querySelector(".resume-trigger").addEventListener("click", () => {
      activateResumeItem(item);
    });
  });
});
