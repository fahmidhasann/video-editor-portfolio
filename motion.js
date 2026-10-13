/* ==========================================================
   Motion layer — "the site is an edit timeline".
   Additive and self-contained. One rAF loop that only runs
   while something is moving; everything writes transforms.
   ========================================================== */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const body = document.body;

  /* Atmosphere layers (grain stays even in reduced motion; it is static there) */
  const atmos = document.createElement("div");
  atmos.className = "atmos";
  atmos.setAttribute("aria-hidden", "true");
  atmos.innerHTML = '<div class="leak leak-a"></div><div class="leak leak-b"></div>';
  body.prepend(atmos);
  const grain = document.createElement("div");
  grain.className = "grain";
  grain.setAttribute("aria-hidden", "true");
  body.appendChild(grain);

  if (reduce) return;
  root.classList.add("m-on");

  const header = document.querySelector(".header");
  const nav = header && header.querySelector(".nav");
  const vh = () => window.innerHeight;

  /* ---------- Header scrub line + timecode chip ---------- */
  const scrub = document.createElement("span");
  scrub.className = "scrub";
  scrub.setAttribute("aria-hidden", "true");
  if (header) header.appendChild(scrub);
  const tc = document.createElement("span");
  tc.className = "tc";
  tc.setAttribute("aria-hidden", "true");
  tc.innerHTML = "<i></i><span>00:00:00</span>";
  const tcText = tc.querySelector("span");
  const cta = nav && nav.querySelector(".nav-cta");
  if (nav && cta) nav.insertBefore(tc, cta);

  /* ---------- Timeline rail ---------- */
  const chapters = [
    ["top", "Open"], ["work", "Films"], ["motion", "Motion"], ["explainers", "Explainers"],
    ["reels", "Reels"], ["photos", "Photos"], ["about", "About"], ["contact", "Contact"]
  ]
    .map(([id, label]) => ({ id, label, el: id === "top" ? document.querySelector(".hero") : document.getElementById(id) }))
    .filter((c) => c.el);
  const rail = document.createElement("nav");
  rail.className = "rail";
  rail.setAttribute("aria-label", "Timeline");
  rail.innerHTML =
    '<span class="rail-line"></span><span class="rail-fill"></span><span class="rail-head"></span>' +
    chapters.map((c, i) => `<a class="rail-mark" href="#${c.id}" data-i="${i}"><span>${String(i).padStart(2, "0")} ${c.label}</span></a>`).join("") +
    '<span class="rail-tc">00:00:00:00</span>';
  body.appendChild(rail);
  const railFill = rail.querySelector(".rail-fill");
  const railHead = rail.querySelector(".rail-head");
  const railTc = rail.querySelector(".rail-tc");
  const marks = [...rail.querySelectorAll(".rail-mark")];

  /* ---------- Hero title: split into masked lines ---------- */
  const title = document.querySelector(".hero-title");
  if (title) {
    const parts = [...title.childNodes].filter((n) => n.nodeType === 1 || n.textContent.trim());
    title.textContent = "";
    parts.forEach((n, i) => {
      const ln = document.createElement("span");
      ln.className = "ln";
      const inner = document.createElement("span");
      if (n.nodeType === 3) inner.textContent = n.textContent.trim();
      else inner.appendChild(n);
      ln.appendChild(inner);
      title.appendChild(ln);
      if (i < parts.length - 1) title.appendChild(document.createTextNode(" "));
    });
  }
  const heroPic = document.querySelector(".hero-frame picture");
  const hero = document.querySelector(".hero");

  /* ---------- Letterbox frames ---------- */
  const shots = document.querySelectorAll(".film-media");
  const sio = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-shot"); sio.unobserve(e.target); } }),
    { threshold: 0.35 }
  );
  shots.forEach((s) => sio.observe(s));

  /* ---------- Contact sweep only while visible ---------- */
  const contact = document.getElementById("contact");
  if (contact) {
    new IntersectionObserver((es) => es.forEach((e) => contact.classList.toggle("is-live", e.isIntersecting)), { threshold: 0.2 }).observe(contact);
  }

  /* ---------- Photo parallax: only the ones on screen ---------- */
  const visiblePhotos = new Set();
  const pio = new IntersectionObserver(
    (es) => es.forEach((e) => (e.isIntersecting ? visiblePhotos.add(e.target) : visiblePhotos.delete(e.target))),
    { rootMargin: "10% 0px" }
  );
  const watchPhotos = () => document.querySelectorAll(".photo").forEach((p) => pio.observe(p));
  watchPhotos();

  /* ---------- Layout cache ---------- */
  let maxScroll = 1, starts = [];
  const measure = () => {
    maxScroll = Math.max(1, root.scrollHeight - vh());
    starts = chapters.map((c) => Math.min(1, Math.max(0, (c.el.getBoundingClientRect().top + window.scrollY - 1) / maxScroll)));
    marks.forEach((m, i) => (m.style.top = `${(i / Math.max(1, marks.length - 1)) * 100}%`));
    kick();
  };

  /* Marks sit evenly on the rail; the head maps page progress between them */
  const railPos = (p) => {
    const n = starts.length;
    if (n < 2) return p;
    for (let i = n - 1; i >= 0; i--) {
      if (p >= starts[i]) {
        const a = starts[i], b = i < n - 1 ? starts[i + 1] : 1;
        const f = b > a ? Math.min(1, (p - a) / (b - a)) : 1;
        return Math.min(1, (i + (i < n - 1 ? f : 0)) / (n - 1));
      }
    }
    return 0;
  };

  /* ---------- Timecode: the page plays like a 3-minute cut at 24 fps ---------- */
  const FPS = 24, TOTAL = 180 * FPS;
  const p2 = (n) => String(n).padStart(2, "0");
  let lastFrame = -1;
  const timecode = (p) => {
    const f = Math.round(p * TOTAL);
    if (f === lastFrame) return;
    lastFrame = f;
    const s = Math.floor(f / FPS);
    const t = `${p2(Math.floor(s / 60))}:${p2(s % 60)}:${p2(f % FPS)}`;
    tcText.textContent = t;
    railTc.textContent = "00:" + t;
  };

  /* ---------- The loop ---------- */
  let running = false, sy = window.scrollY, lp = -1, leakY = 0, idle = 0;
  const frame = () => {
    let moving = false;
    if (!body.classList.contains("is-locked")) sy = window.scrollY;
    const p = Math.min(1, Math.max(0, sy / maxScroll));

    if (Math.abs(p - lp) > 0.00005) {
      lp = p;
      scrub.style.transform = `scaleX(${p})`;
      const rp = railPos(p);
      railFill.style.transform = `scaleY(${rp})`;
      railHead.style.transform = `translate3d(0, ${rp * rail.clientHeight}px, 0)`;
      rail.classList.toggle("is-on", sy > vh() * 0.5);
      timecode(p);
      let a = 0;
      for (let i = 0; i < starts.length; i++) if (p + 0.002 >= starts[i]) a = i;
      marks.forEach((m, i) => m.classList.toggle("is-active", i === a));

      /* hero push-in while it leaves */
      if (heroPic && hero) {
        const h = hero.offsetHeight || 1;
        const k = Math.min(1, sy / h);
        if (k < 1 || heroPic._k !== 1) {
          heroPic.style.transform = `translate3d(0, ${k * 9}%, 0) scale(${1 + k * 0.12})`;
          heroPic._k = k;
        }
      }
    }

    /* light leaks drift with the story, smoothed */
    const targetLeak = p;
    leakY += (targetLeak - leakY) * 0.08;
    if (Math.abs(targetLeak - leakY) > 0.0005) moving = true;
    const t = leakY * Math.PI * 2;
    atmos.firstChild.style.transform = `translate3d(${Math.sin(t) * -18}vw, ${leakY * 70}vh, 0) scale(${1 + Math.sin(t * 0.5) * 0.15})`;
    atmos.lastChild.style.transform = `translate3d(${Math.cos(t) * 22}vw, ${Math.sin(t) * -25}vh, 0)`;
    atmos.lastChild.style.opacity = String(0.25 + Math.abs(Math.sin(t * 1.5)) * 0.75);

    /* photos */
    const H = vh();
    visiblePhotos.forEach((ph) => {
      const r = ph.getBoundingClientRect();
      const c = (r.top + r.height / 2 - H / 2) / (H / 2 + r.height / 2); /* -1 .. 1 */
      ph.style.setProperty("--py", `${(-c * r.height * 0.07).toFixed(1)}px`);
    });

    if (moving) idle = 0; else idle++;
    if (idle > 3) { running = false; return; }
    requestAnimationFrame(frame);
  };
  function kick() {
    if (running) return;
    running = true; idle = 0;
    requestAnimationFrame(frame);
  }
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("load", measure);
  if ("ResizeObserver" in window) {
    let rt;
    new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(measure, 120); }).observe(document.querySelector("main") || body);
  }
  measure();
})();
