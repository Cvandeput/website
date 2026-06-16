function initCarousel(root) {
  const track = root.querySelector(".carousel-track");
  const slides = Array.from(root.querySelectorAll(".carousel-slide"));
  const dotsWrap = root.querySelector(".carousel-dots");
  const prev = root.querySelector(".carousel-prev");
  const next = root.querySelector(".carousel-next");
  let index = 0;
  let timer = null;

  if (slides.length <= 1) {
    if (prev) prev.style.display = "none";
    if (next) next.style.display = "none";
  }

  const dots = slides.map((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "carousel-dot";
    d.setAttribute("aria-label", "Aller a l'image " + (i + 1));
    d.addEventListener("click", () => {
      go(i);
      restart();
    });
    dotsWrap.appendChild(d);
    return d;
  });

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = "translateX(" + -index * 100 + "%)";
    dots.forEach((d, di) => d.classList.toggle("active", di === index));
  }

  function play() {
    if (slides.length <= 1 || timer) return;
    timer = setInterval(() => go(index + 1), 1500);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restart() {
    if (timer) {
      stop();
      play();
    }
  }

  if (prev) prev.addEventListener("click", () => { go(index - 1); restart(); });
  if (next) next.addEventListener("click", () => { go(index + 1); restart(); });

  root.addEventListener("mouseenter", play);
  root.addEventListener("mouseleave", () => { stop(); go(0); });

  go(0);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-carousel]").forEach(initCarousel);
});
