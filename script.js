document.addEventListener("DOMContentLoaded", () => {

  // ===== SEÇÕES =====
  window.openSection = function (id) {
    document.querySelectorAll(".content").forEach(sec => {
      sec.style.display = "none";
    });
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
  };

  // ===== SONS =====
  const clickSound = document.getElementById("click-sound");
  const hoverSound = document.getElementById("hover-sound");
  const ambientSound = document.getElementById("ambient-sound");
  const muteBtn = document.getElementById("mute-btn");

  let muted = false;

  function safePlay(sound, { reset = true } = {}) {
    if (!sound) return;
    try {
      if (reset) sound.currentTime = 0;
      // garante que não está mutado
      sound.muted = muted;
      const p = sound.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (_) {}
  }

  // Hover/Click em menu + botões
  document.querySelectorAll(".menu li, .icon-btn").forEach(item => {
    item.addEventListener("mouseenter", () => safePlay(hoverSound));
    item.addEventListener("click", () => safePlay(clickSound));
  });

  // ===== TRILHA AMBIENTE (INICIAR NA 1ª INTERAÇÃO) =====
  // pointerdown é mais confiável que click no mobile
  let ambientStarted = false;

  async function startAmbient() {
    if (ambientStarted || !ambientSound) return;
    ambientStarted = true;

    try {
      ambientSound.loop = true;
      ambientSound.volume = 0.22;     // ajuste de volume (0.0 a 1.0)
      ambientSound.muted = muted;

      await ambientSound.play();
    } catch (e) {
      // se falhar, libera para tentar de novo na próxima interação
      ambientStarted = false;
      console.warn("Ambient blocked (needs user gesture):", e);
    }
  }

  document.addEventListener("pointerdown", startAmbient, { once: false });

  // ===== MUTE =====
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      muted = !muted;

      [clickSound, hoverSound, ambientSound].forEach(s => {
        if (s) s.muted = muted;
      });

      // se desmutou e ainda não tocou, tenta iniciar
      if (!muted) startAmbient();

      muteBtn.textContent = muted ? "🔇" : "🔊";
    });
  }

  // ===== PARTICLES =====
  const canvas = document.getElementById("particles");
  if (canvas) {
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let particles = [];
    const count = 110;

    function spawn() {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 0.2,
          vy: Math.random() * 0.6 + 0.1,
          vx: (Math.random() - 0.5) * 0.15,
          a: Math.random() * 0.6 + 0.2
        });
      }
    }
    spawn();

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // não define cor fixa via CSS, mas aqui é canvas e faz parte do visual AAA:
      // se quiser eu deixo isso configurable.
      ctx.fillStyle = "rgba(0,240,255,0.7)";

      for (const p of particles) {
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
      requestAnimationFrame(animate);
    }

    animate();
  }

});