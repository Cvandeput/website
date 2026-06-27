/* Projects page: config-driven editorial rows, README images pulled live
   from the GitHub API, with auto-playing carousels. */

const GH_USER = "Cvandeput";

/* Ordered list. type "repo" pulls images from the GitHub README;
   type "manual" is a project without a repo yet (placeholder + "soon" badge). */
const PROJECTS = [
  {
    type: "repo", repo: "IpCrypt", branch: "main",
    title: "IpCrypt", descKey: "projd.ipcrypt",
    badges: ["Python", "CustomTkinter", "PostgreSQL"], accent: "#185FA5",
    fallbackImages: [
      "https://raw.githubusercontent.com/Cvandeput/IpCrypt/main/code/images/pageSplash.png",
      "https://raw.githubusercontent.com/Cvandeput/IpCrypt/main/code/images/pageConnexion.png",
      "https://raw.githubusercontent.com/Cvandeput/IpCrypt/main/code/images/pageMenu.png",
      "https://raw.githubusercontent.com/Cvandeput/IpCrypt/main/code/images/pageIpVerification.png",
      "https://raw.githubusercontent.com/Cvandeput/IpCrypt/main/code/images/pageAssociationIp.png",
      "https://raw.githubusercontent.com/Cvandeput/IpCrypt/main/code/images/pageTableauCIDR.png"
    ]
  },
  {
    type: "repo", repo: "TOTEM-TRIALS", branch: "master",
    title: "Totem Trials", descKey: "projd.totem",
    badges: ["Java", "JavaFX", "Maven", "JUnit"], accent: "#993C1D",
    fallbackImages: [
      "https://raw.githubusercontent.com/Cvandeput/TOTEM-TRIALS/master/docs/assets/banner.png",
      "https://raw.githubusercontent.com/Cvandeput/TOTEM-TRIALS/master/docs/assets/plateau-jeu-javaFX.png",
      "https://raw.githubusercontent.com/Cvandeput/TOTEM-TRIALS/master/docs/assets/Prototypeplateau.png"
    ]
  },
  {
    type: "repo", repo: "SpaceMouse", branch: "master",
    title: "Space Mouse", descKey: "projd.spacemouse",
    badges: ["C++", "Arduino"], accent: "#0F6E56", fallbackImages: []
  },
  {
    type: "repo", repo: "Zoo-Gestion", branch: "main",
    title: "Zoo-Gestion", descKey: "projd.zoo",
    badges: ["C"], accent: "#3B6D11", fallbackImages: []
  },
  {
    type: "manual", titleKey: "proj.title.pid", title: "PID Controller",
    descKey: "projd.pid", statusKey: "projp.soon",
    badges: ["Automatique", "PID"], accent: "#534AB7"
  },
  {
    type: "manual", titleKey: "proj.title.volant", title: "Sim Racing Wheel",
    descKey: "projd.volant", statusKey: "projp.soon",
    badges: ["Arduino", "C++", "3D Print"], accent: "#993556"
  },
  {
    type: "repo", repo: "ad-generator", branch: "main",
    titleKey: "proj.title.n8n", title: "Ad Generator (N8N)",
    descKey: "projd.adgen", statusKey: "projp.onhold",
    badges: ["N8N", "JavaScript", "Ollama"], accent: "#854F0B", fallbackImages: []
  }
];

function placeholderSVG(title, accent) {
  const t = String(title).replace(/[<&>]/g, "");
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'>" +
    "<rect width='1200' height='675' fill='#e7eff3'/>" +
    "<rect width='1200' height='10' fill='" + accent + "'/>" +
    "<text x='600' y='340' font-family='Space Grotesk, sans-serif' font-size='52' " +
    "fill='#4c809a' text-anchor='middle' font-weight='700'>" + t + "</text>" +
    "<text x='600' y='400' font-family='Space Grotesk, sans-serif' font-size='26' " +
    "fill='#9bb4c2' text-anchor='middle'>visuels bientot disponibles</text></svg>";
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function isUsableImage(url) {
  if (/shields\.io|img\.shields|badge|githubusercontent\.com\/u\//i.test(url)) return false;
  return /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(url);
}

function extractReadmeImages(markdown, repo, branch) {
  const urls = [];
  const push = (u) => {
    if (!u) return;
    u = u.trim().replace(/^<|>$/g, "");
    if (/^https?:\/\//i.test(u)) {
      if (isUsableImage(u)) urls.push(u);
    } else {
      const clean = u.replace(/^\.?\//, "");
      const abs = "https://raw.githubusercontent.com/" + GH_USER + "/" + repo + "/" + branch + "/" + clean;
      if (isUsableImage(abs)) urls.push(abs);
    }
  };
  let m;
  const md = /!\[[^\]]*\]\(\s*([^)\s]+)/g;
  while ((m = md.exec(markdown))) push(m[1]);
  const html = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((m = html.exec(markdown))) push(m[1]);
  return urls.filter((u, i) => urls.indexOf(u) === i).slice(0, 10);
}

async function fetchReadmeImages(repo, branch) {
  const res = await fetch("https://api.github.com/repos/" + GH_USER + "/" + repo + "/readme", {
    headers: { Accept: "application/vnd.github.v3+json" }
  });
  if (!res.ok) throw new Error("readme " + res.status);
  const data = await res.json();
  let text = "";
  try { text = decodeURIComponent(escape(atob((data.content || "").replace(/\s/g, "")))); }
  catch (e) { text = atob((data.content || "").replace(/\s/g, "")); }
  return extractReadmeImages(text, repo, branch);
}

function setSlides(track, urls, title) {
  track.innerHTML = "";
  urls.forEach((u, i) => {
    const img = document.createElement("img");
    img.className = "carousel-slide";
    img.loading = "lazy";
    img.src = u;
    img.alt = title + " - " + (i + 1);
    track.appendChild(img);
  });
}

function buildRow(p) {
  const article = document.createElement("article");
  article.className = "project-row";

  const car = document.createElement("div");
  car.className = "carousel";
  car.setAttribute("data-carousel", "");
  car.setAttribute("aria-roledescription", "carousel");
  const track = document.createElement("div");
  track.className = "carousel-track";
  car.appendChild(track);
  const prev = document.createElement("button");
  prev.type = "button"; prev.className = "carousel-btn carousel-prev";
  prev.setAttribute("aria-label", "Previous image"); prev.innerHTML = "&#8249;";
  const next = document.createElement("button");
  next.type = "button"; next.className = "carousel-btn carousel-next";
  next.setAttribute("aria-label", "Next image"); next.innerHTML = "&#8250;";
  const dots = document.createElement("div");
  dots.className = "carousel-dots"; dots.setAttribute("aria-hidden", "true");
  car.appendChild(prev); car.appendChild(next); car.appendChild(dots);

  const info = document.createElement("div");
  info.className = "project-info";

  const h2 = document.createElement("h2");
  h2.className = "text-[#0d171b] text-[22px] font-bold leading-tight tracking-[-0.015em]";
  const titleSpan = document.createElement("span");
  if (p.titleKey) titleSpan.setAttribute("data-i18n", p.titleKey);
  titleSpan.textContent = p.title;
  h2.appendChild(titleSpan);
  if (p.statusKey) {
    h2.appendChild(document.createTextNode(" "));
    const st = document.createElement("span");
    st.className = "text-[#4c809a] text-sm font-normal";
    st.setAttribute("data-i18n", p.statusKey);
    st.textContent = "(soon)";
    h2.appendChild(st);
  }
  info.appendChild(h2);

  const badges = document.createElement("div");
  badges.className = "project-badges";
  (p.badges || []).forEach((b, i) => {
    const s = document.createElement("span");
    s.className = "lang-badge" + (i === 0 ? " lang-badge-accent" : "");
    s.textContent = b;
    badges.appendChild(s);
  });
  info.appendChild(badges);

  const desc = document.createElement("p");
  desc.className = "text-[#4c809a] text-sm font-normal leading-normal";
  desc.setAttribute("data-i18n", p.descKey);
  desc.textContent = "";
  info.appendChild(desc);

  if (p.type === "repo") {
    const a = document.createElement("a");
    a.className = "project-link";
    a.href = "https://github.com/" + GH_USER + "/" + p.repo;
    a.target = "_blank"; a.rel = "noopener";
    a.setAttribute("data-i18n", "projp.view_github");
    a.innerHTML = "View on GitHub &#8599;";
    info.appendChild(a);
  }

  article.appendChild(car);
  article.appendChild(info);

  const initial = (p.fallbackImages && p.fallbackImages.length)
    ? p.fallbackImages
    : [placeholderSVG(p.title, p.accent || "#13a4ec")];
  setSlides(track, initial, p.title);

  return { article, track, title: p.title };
}

function initCarousel(root) {
  const track = root.querySelector(".carousel-track");
  const slides = Array.from(root.querySelectorAll(".carousel-slide"));
  const dotsWrap = root.querySelector(".carousel-dots");
  const prev = root.querySelector(".carousel-prev");
  const next = root.querySelector(".carousel-next");
  let index = 0;
  let timer = null;

  dotsWrap.innerHTML = "";
  if (slides.length <= 1) {
    if (prev) prev.style.display = "none";
    if (next) next.style.display = "none";
  } else {
    if (prev) prev.style.display = "";
    if (next) next.style.display = "";
  }

  const dots = slides.map((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "carousel-dot";
    d.setAttribute("aria-label", "Image " + (i + 1));
    d.addEventListener("click", () => { go(i); restart(); });
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
    timer = setInterval(() => go(index + 1), 3000);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function restart() { stop(); play(); }

  if (prev) prev.addEventListener("click", () => { go(index - 1); restart(); });
  if (next) next.addEventListener("click", () => { go(index + 1); restart(); });
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", play);

  go(0);
  play();
}

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("projects-list");
  if (!list) return;

  const built = PROJECTS.map((p) => {
    const row = buildRow(p);
    list.appendChild(row.article);
    initCarousel(row.article);
    return { p, row };
  });

  if (window.__applyI18n && window.__getLang) window.__applyI18n(window.__getLang());

  built.forEach(({ p, row }) => {
    if (p.type !== "repo") return;
    fetchReadmeImages(p.repo, p.branch)
      .then((imgs) => {
        if (imgs && imgs.length) {
          setSlides(row.track, imgs, row.title);
          initCarousel(row.article);
        }
      })
      .catch(() => { /* keep fallback */ });
  });
});
