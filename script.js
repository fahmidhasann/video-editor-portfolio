(() => {
  const data = window.PORTFOLIO || { films: [], motion: [], reels: [] };
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");

  /* Scroll lock that also holds on iOS Safari (overflow:hidden alone doesn't) */
  let lockCount = 0, lockY = 0;
  const lockScroll = () => {
    if (lockCount++ > 0) return;
    lockY = window.scrollY;
    document.body.style.top = `-${lockY}px`;
    document.body.classList.add("is-locked");
  };
  const unlockScroll = () => {
    if (lockCount === 0 || --lockCount > 0) return;
    document.body.classList.remove("is-locked");
    document.body.style.top = "";
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, lockY);
    html.style.scrollBehavior = prev;
  };
  const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
  const arrow = '<span class="film-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg></span>';

  const media = (p, ratio, eager) => `
    <div class="${ratio}">
      <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="${eager ? "eager" : "lazy"}" decoding="async">
      ${p.preview ? `<video class="preview" muted loop playsinline webkit-playsinline disablepictureinpicture disableremoteplayback x-webkit-airplay="deny" preload="none" tabindex="-1" data-src="${esc(p.preview)}" aria-hidden="true"></video>` : ""}
      <span class="play">${playIcon}</span>
    </div>`;

  const card16 = (list, kind) =>
    list
      .map(
        (f, i) => `
      <button type="button" class="film reveal ${kind === "film" && i === 0 ? "film-featured" : ""}" data-kind="${kind}" data-index="${i}" aria-label="Play ${esc(f.title)}">
        ${media(f, "film-media", i === 0)}
        <div class="film-info">
          <span class="mono film-index">${pad(i + 1)}</span>
          <div>
            <p class="film-cat">${esc(f.category || "Film")}</p>
            <h3 class="film-title">${esc(f.title)}</h3>
            <p class="film-desc">${esc(f.description || "")}</p>
          </div>
          ${arrow}
        </div>
      </button>`
      )
      .join("");

  const films = document.getElementById("films");
  if (films) films.innerHTML = card16(data.films || [], "film");
  const motion = document.getElementById("motion-grid");
  if (motion) motion.innerHTML = card16(data.motion || [], "motion");

  const track = document.getElementById("reels-track");
  if (track) {
    track.innerHTML = (data.reels || [])
      .map(
        (r, i) => `
      <button type="button" class="reel" data-kind="reel" data-index="${i}" aria-label="Play ${esc(r.title)}">
        ${media(r, "reel-media", false)}
        <p class="reel-client">${esc(r.client || "")}</p>
        <h3 class="reel-title">${esc(r.title)}</h3>
      </button>`
      )
      .join("");
    document.querySelectorAll("[data-scroll]").forEach((btn) =>
      btn.addEventListener("click", () =>
        track.scrollBy({ left: Number(btn.dataset.scroll) * track.clientWidth * 0.8, behavior: "smooth" })
      )
    );
  }

  const explainers = document.getElementById("explainer-grid");
  if (explainers) {
    const all = (data.explainers || []).map((r, i) => ({ ...r, i }));
    const wide = all.filter((r) => r.wide);
    const tall = all.filter((r) => !r.wide);
    explainers.innerHTML =
      wide
        .map(
          (f) => `
      <button type="button" class="film film-featured reveal" data-kind="explainer" data-index="${f.i}" aria-label="Play ${esc(f.title)}">
        ${media(f, "film-media", false)}
        <div class="film-info">
          <span class="mono film-index">Long-form</span>
          <div>
            <p class="film-cat">${esc(f.category || "")}</p>
            <h3 class="film-title">${esc(f.title)}</h3>
            <p class="film-desc">${esc(f.description || "")}</p>
          </div>
          ${arrow}
        </div>
      </button>`
        )
        .join("") +
      `<div class="explainer-reels">${tall
        .map(
          (r) => `
      <button type="button" class="reel reveal" data-kind="explainer" data-index="${r.i}" aria-label="Play ${esc(r.title)}">
        ${media(r, "reel-media", false)}
        <p class="reel-client">${esc(r.category || "")}</p>
        <h3 class="reel-title">${esc(r.title)}</h3>
      </button>`
        )
        .join("")}</div>`;
  }

  /* Muted previews: play while the card is on screen, pause when it leaves */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const previews = document.querySelectorAll("video.preview");
  const touch = window.matchMedia("(hover: none)").matches;
  const startPreview = (v) => {
    v.muted = true; v.defaultMuted = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
    if (touch) previews.forEach((o) => { if (o !== v && !o.paused) stopPreview(o); });
    if (!v.getAttribute("src")) v.src = v.dataset.src;
    const p = v.play();
    if (p) p.then(() => v.classList.add("is-playing")).catch(() => {});
  };
  const stopPreview = (v) => {
    v.pause();
    v.classList.remove("is-playing");
  };
  if (!reduce && !saveData && "IntersectionObserver" in window) {
    /* Wait until a card has stayed on screen briefly before loading/decoding
       its video, so fast scrolling never stalls on video work. */
    const timers = new WeakMap();
    const pio = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target;
          clearTimeout(timers.get(v));
          if (e.isIntersecting) timers.set(v, setTimeout(() => startPreview(v), touch ? 350 : 150));
          else stopPreview(v);
        }),
      { threshold: 0.6 }
    );
    previews.forEach((v) => pio.observe(v));
  }

  /* Player */
  let hls = null;
  const HLS_CDN = "vendor/hls.min.js";
  const loadScript = (src) =>
    new Promise((res, rej) => {
      if (window.Hls) return res();
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  const loadSource = (src) => {
    if (hls) { hls.destroy(); hls = null; }
    const isHls = /\.m3u8($|\?)/.test(src);
    if (!isHls || pv.canPlayType("application/vnd.apple.mpegurl")) {
      pv.src = src;
      const p = pv.play(); if (p) p.catch(() => {});
      return;
    }
    loadScript(HLS_CDN)
      .then(() => {
        if (!window.Hls || !window.Hls.isSupported()) { stage.classList.add("is-error"); return; }
        hls = new window.Hls({
          startLevel: -1,
          capLevelToPlayerSize: false,
          abrEwmaDefaultEstimate: 4000000,
          abrBandWidthUpFactor: 0.8,
          maxBufferLength: 30
        });
        hls.loadSource(src);
        hls.attachMedia(pv);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => { const p = pv.play(); if (p) p.catch(() => {}); });
        hls.on(window.Hls.Events.ERROR, (_, d) => { if (d.fatal) stage.classList.add("is-error"); });
      })
      .catch(() => stage.classList.add("is-error"));
  };
  const player = document.getElementById("player");
  const pv = document.getElementById("playerVideo");
  const stage = document.getElementById("playerStage");
  let lastFocus = null;
  const openPlayer = (kind, index) => {
    const list = { film: data.films, motion: data.motion, reel: data.reels, explainer: data.explainers }[kind] || [];
    const item = list[index];
    if (!item || !player) return;
    lastFocus = document.activeElement;
    document.getElementById("playerTitle").textContent = item.title;
    document.getElementById("playerCat").textContent = item.category || item.client || "";
    const link = document.getElementById("playerLink");
    link.href = item.url || "#";
    link.hidden = !item.url;
    stage.classList.toggle("is-vertical", kind === "reel" || (kind === "explainer" && !item.wide));
    stage.classList.remove("is-error");
    pv.poster = item.image;
    loadSource(item.video);
    player.hidden = false;
    lockScroll();
    requestAnimationFrame(() => player.classList.add("is-open"));
    previews.forEach(stopPreview);
    player.querySelector(".player-box .icon-btn").focus({ preventScroll: true });
  };
  const closePlayer = () => {
    if (!player || player.hidden) return;
    pv.pause();
    if (hls) { hls.destroy(); hls = null; }
    pv.removeAttribute("src");
    pv.load();
    player.classList.remove("is-open");
    player.hidden = true;
    unlockScroll();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-kind]");
    if (card) return openPlayer(card.dataset.kind, Number(card.dataset.index));
    if (e.target.closest("[data-close]")) closePlayer();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePlayer();
  });
  /* If a video file ever fails, fall back to the original post */
  pv.addEventListener("error", () => {
    const link = document.getElementById("playerLink");
    if (!player.hidden && link && link.href && !link.hidden) {
      stage.classList.add("is-error");
    }
  });
  pv.addEventListener("loadeddata", () => stage.classList.remove("is-error"));

  /* Photography */
  const photos = data.photos || [];
  const pgrid = document.getElementById("photo-grid");
  if (pgrid) {
    pgrid.innerHTML = photos
      .map(
        (p, i) => `
      <button type="button" class="photo reveal${p.w > p.h ? " photo--wide" : ""}" data-photo="${i}" aria-label="View photo: ${esc(p.alt)}">
        <img src="${esc(p.src)}-800.webp" srcset="${esc(p.src)}-800.webp 800w, ${esc(p.src)}-1600.webp 1600w"
          sizes="${p.w > p.h ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 760px) 50vw, 25vw"}"
          width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy" decoding="async">
      </button>`
      )
      .join("");
  }
  const viewer = document.getElementById("viewer");
  const vImg = document.getElementById("viewerImg");
  const vCount = document.getElementById("viewerCount");
  let vIndex = 0, vLast = null;
  const showPhoto = (i) => {
    vIndex = (i + photos.length) % photos.length;
    const p = photos[vIndex];
    vImg.src = p.src + "-1600.webp";
    vImg.alt = p.alt;
    vCount.textContent = `${pad(vIndex + 1)} / ${pad(photos.length)}`;
    [vIndex + 1, vIndex - 1].forEach((j) => { const q = photos[(j + photos.length) % photos.length]; if (q) new Image().src = q.src + "-1600.webp"; });
  };
  const openViewer = (i) => {
    if (!viewer) return;
    vLast = document.activeElement;
    showPhoto(i);
    viewer.hidden = false;
    lockScroll();
    requestAnimationFrame(() => viewer.classList.add("is-open"));
    viewer.querySelector(".viewer-close").focus({ preventScroll: true });
  };
  const closeViewer = () => {
    if (!viewer || viewer.hidden) return;
    viewer.classList.remove("is-open");
    viewer.hidden = true;
    unlockScroll();
    if (vLast) vLast.focus({ preventScroll: true });
  };
  if (viewer) {
    document.addEventListener("click", (e) => {
      const ph = e.target.closest("[data-photo]");
      if (ph) return openViewer(Number(ph.dataset.photo));
      const st = e.target.closest("[data-vstep]");
      if (st) return showPhoto(vIndex + Number(st.dataset.vstep));
      if (e.target.closest("[data-vclose]") || e.target === viewer) closeViewer();
    });
    document.addEventListener("keydown", (e) => {
      if (viewer.hidden) return;
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") showPhoto(vIndex + 1);
      if (e.key === "ArrowLeft") showPhoto(vIndex - 1);
    });
    let tx = null;
    viewer.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener("touchend", (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) showPhoto(vIndex + (dx < 0 ? 1 : -1));
      tx = null;
    });
  }

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Header + mobile nav */
  const header = document.querySelector(".header");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  let scrolled = null, ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (document.body.classList.contains("is-locked")) return;
      const s = window.scrollY > 10;
      if (s !== scrolled && header) { scrolled = s; header.classList.toggle("is-scrolled", s); }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  let menuOpen = false;
  const setMenu = (open, jumpTo) => {
    if (!toggle || !menu || open === menuOpen) return;
    menuOpen = open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    if (open) lockScroll();
    else {
      unlockScroll();
      if (jumpTo) {
        const t = document.querySelector(jumpTo);
        if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    }
  };
  if (toggle) toggle.addEventListener("click", () => setMenu(!menuOpen));
  if (menu)
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", (e) => {
        if (!menuOpen) return;
        e.preventDefault();
        const hash = a.getAttribute("href");
        setMenu(false, hash);
        if (history.replaceState) history.replaceState(null, "", hash);
      })
    );
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 761px)").addEventListener("change", (m) => { if (m.matches) setMenu(false); });

  /* Reveal on scroll */
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-visible"));
  }
})();
