(() => {
  const data = window.PORTFOLIO || { films: [], motion: [], reels: [] };
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
  const arrow = '<span class="film-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg></span>';

  const media = (p, ratio, eager) => `
    <div class="${ratio}">
      <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="${eager ? "eager" : "lazy"}" decoding="async">
      ${p.preview ? `<video class="preview" muted loop playsinline preload="none" data-src="${esc(p.preview)}" aria-hidden="true"></video>` : ""}
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

  /* Muted previews: play while the card is on screen, pause when it leaves */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const previews = document.querySelectorAll("video.preview");
  const startPreview = (v) => {
    if (!v.src) v.src = v.dataset.src;
    const p = v.play();
    if (p) p.then(() => v.classList.add("is-playing")).catch(() => {});
  };
  const stopPreview = (v) => {
    v.pause();
    v.classList.remove("is-playing");
  };
  if (!reduce && !saveData && "IntersectionObserver" in window) {
    const pio = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? startPreview(e.target) : stopPreview(e.target))),
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
    const list = { film: data.films, motion: data.motion, reel: data.reels }[kind] || [];
    const item = list[index];
    if (!item || !player) return;
    lastFocus = document.activeElement;
    document.getElementById("playerTitle").textContent = item.title;
    document.getElementById("playerCat").textContent = item.category || item.client || "";
    const link = document.getElementById("playerLink");
    link.href = item.url || "#";
    link.hidden = !item.url;
    stage.classList.toggle("is-vertical", kind === "reel");
    stage.classList.remove("is-error");
    pv.poster = item.image;
    loadSource(item.video);
    player.hidden = false;
    document.body.classList.add("menu-open");
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
    document.body.classList.remove("menu-open");
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

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Header + mobile nav */
  const header = document.querySelector(".header");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const setMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };
  if (toggle) toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  if (menu) menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

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
