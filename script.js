document.addEventListener("DOMContentLoaded", () => {
  // ====== AUDIO ======
  const clickSound = document.getElementById("click-sound");
  const hoverSound = document.getElementById("hover-sound");
  const ambientSound = document.getElementById("ambient-sound");
  const muteBtn = document.getElementById("muteBtn");
  const volSlider = document.getElementById("volSlider");

  let muted = false;
  let ambientStarted = false;

  function safePlay(sound, { reset = true } = {}) {
    if (!sound) return;
    try {
      if (reset) sound.currentTime = 0;
      sound.muted = muted;
      const p = sound.play();
      if (p && p.catch) p.catch(() => {});
    } catch (_) {}
  }

  async function startAmbient() {
    if (!ambientSound || ambientStarted) return;
    ambientStarted = true;
    try {
      ambientSound.loop = true;
      ambientSound.muted = muted;
      ambientSound.volume = (Number(volSlider?.value ?? 22) / 100) * 0.6; // escala
      await ambientSound.play();
    } catch (e) {
      ambientStarted = false;
      console.warn("Ambient blocked:", e);
    }
  }

  // Start audio on first gesture
  const unlock = () => startAmbient();
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });

  if (volSlider) {
    volSlider.addEventListener("input", () => {
      const v = (Number(volSlider.value) / 100) * 0.6;
      if (ambientSound) ambientSound.volume = v;
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      muted = !muted;
      [clickSound, hoverSound, ambientSound].forEach(s => s && (s.muted = muted));
      muteBtn.textContent = muted ? "🔇" : "🔊";
      if (!muted) startAmbient();
      safePlay(clickSound);
    });
  }

  // ====== PRELOADER ======
  const preloader = document.getElementById("preloader");
  const barFill = document.getElementById("barFill");
  let prog = 0;
  const it = setInterval(() => {
    prog = Math.min(100, prog + 6);
    if (barFill) barFill.style.width = prog + "%";
    if (prog >= 100) {
      clearInterval(it);
      setTimeout(() => {
        if (preloader) preloader.style.display = "none";
      }, 300);
    }
  }, 90);

  // ====== MENU / NAV ======
  const menuList = document.getElementById("menuList");
  const items = Array.from(document.querySelectorAll(".menu-item"));
  const selector = document.getElementById("selector");

  let idx = 0;

  function setActive(i, play = true) {
    idx = (i + items.length) % items.length;
    items.forEach((el, n) => el.classList.toggle("is-active", n === idx));
    if (selector) {
      const target = items[idx];
      const top = target.offsetTop + 10; // ajuste visual
      selector.style.top = top + "px";
    }
    if (play) safePlay(hoverSound);
  }

  function openSection(id) {
    document.querySelectorAll(".content").forEach(sec => sec.classList.remove("is-open"));
    const el = document.getElementById(id);
    if (el) el.classList.add("is-open");
    safePlay(clickSound);
  }

  // Expor para compatibilidade
  window.openSection = openSection;

  // mouse hover
  items.forEach((el, i) => {
    el.addEventListener("mouseenter", () => setActive(i, true));
    el.addEventListener("click", () => openSection(el.dataset.target));
  });

  // teclado
  document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("modal");
    const modalOpen = modal?.classList.contains("is-open");

    if (e.key === "ArrowUp") setActive(idx - 1, true);
    if (e.key === "ArrowDown") setActive(idx + 1, true);
    if (e.key === "Enter") openSection(items[idx].dataset.target);

    if (e.key === "Escape" && modalOpen) closeModal();
  });

  // inicial
  setTimeout(() => setActive(0, false), 0);

  // ====== FILTERS ======
  const chips = Array.from(document.querySelectorAll(".chip"));
  const cards = Array.from(document.querySelectorAll(".card"));

  function applyFilter(cat) {
    chips.forEach(c => c.classList.toggle("is-on", c.dataset.filter === cat));
    cards.forEach(card => {
      const ok = (cat === "all") || (card.dataset.cat === cat);
      card.style.display = ok ? "" : "none";
    });
    safePlay(clickSound);
  }

  chips.forEach(ch => {
    ch.addEventListener("mouseenter", () => safePlay(hoverSound));
    ch.addEventListener("click", () => applyFilter(ch.dataset.filter));
  });

  // ====== MODAL (FULLSCREEN IMAGE) ======
  // ====== MODAL (IMAGE + VIDEO) ======
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalVideo = document.getElementById("modalVideo");
const modalCap = document.getElementById("modalCap");
const modalClose = document.getElementById("modalClose");

function openMedia({ type, src, title }) {
  if (!modal) return;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  // reset
  if (modalImg) { modalImg.style.display = "none"; modalImg.src = ""; }
  if (modalVideo) {
    modalVideo.style.display = "none";
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
  }

  if (type === "video") {
    if (modalVideo) {
      modalVideo.style.display = "block";
      modalVideo.src = src;
      modalVideo.load();
      modalVideo.play().catch(()=>{});
    }
  } else {
    if (modalImg) {
      modalImg.style.display = "block";
      modalImg.src = src;
    }
  }

  if (modalCap) modalCap.textContent = title || "";
  safePlay(clickSound);
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  if (modalVideo) {
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
  }
  safePlay(clickSound);
}

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mouseenter", () => safePlay(hoverSound));

  card.addEventListener("click", () => {
    const type = card.dataset.type || "image";
    const src = card.dataset.src || "";
    const title = card.dataset.title || "Showcase";

    if (!src) return;
    openMedia({ type, src, title });
  });
});

modalClose?.addEventListener("mouseenter", () => safePlay(hoverSound));
modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
});
  // ====== PARTICLES ======
  const canvas = document.getElementById("particles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const P = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      P.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.2,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() * 0.65 + 0.15),
        a: Math.random() * 0.55 + 0.15
      });
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,240,255,0.75)";
      for (const p of P) {
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.y -= p.vy;
        p.x += p.vx;

        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }
    loop();
  }

});