(function () {
  const DEFAULT_LANG = "en";
  const SUPPORTED = ["en", "fr"];

  function dict() {
    return window.TRANSLATIONS || {};
  }
  function getLang() {
    const saved = localStorage.getItem("lang");
    return SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
  }
  function apply(lang) {
    const table = dict()[lang] || {};
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (table[key] != null) el.textContent = table[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (table[key] != null) el.setAttribute("placeholder", table[key]);
    });
    document.documentElement.lang = lang;
    const toggle = document.getElementById("langToggle");
    if (toggle) toggle.textContent = lang === "en" ? "FR" : "EN";
    localStorage.setItem("lang", lang);
  }
  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("langToggle");
    if (toggle) toggle.addEventListener("click", () => apply(getLang() === "en" ? "fr" : "en"));
    apply(getLang());
  });
  window.__getLang = getLang;
})();
