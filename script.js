// Hero: «Кричащая тишина» — буквы наливаются весом рядом с курсором, без курсора идёт тихая волна.
const BASE_WEIGHT = Math.round((200 + 0.3 * (900 - 200)) * 0.9); // самое тонкое начертание ≈ 369
const MAX_WEIGHT = 900;
const RADIUS = 320; // px — с какого расстояния буква «чувствует» курсор

const stage = document.getElementById("stage");
const heroWords = [...stage.querySelectorAll(".hero__word")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Каждое слово — в .w (на мобильном переносим только между словами), каждая буква — свой span
const letters = [];
heroWords.forEach((el) => {
  el.dataset.text.split(" ").forEach((word, i) => {
    if (i) el.append(" ");
    const w = document.createElement("span");
    w.className = "w";
    [...word].forEach((ch) => {
      const s = document.createElement("span");
      s.textContent = ch;
      w.append(s);
      letters.push(s);
    });
    el.append(w);
  });
});

// Активная зона по вертикали: от середины между верхом сцены и текстом до середины между текстом и низом сцены
let mouse = null;
let t = 0;
stage.addEventListener("pointermove", (e) => {
  const st = stage.getBoundingClientRect();
  const top = (st.top + heroWords[0].getBoundingClientRect().top) / 2;
  const bottom = (heroWords[heroWords.length - 1].getBoundingClientRect().bottom + st.bottom) / 2;
  mouse = e.clientY >= top && e.clientY <= bottom ? { x: e.clientX, y: e.clientY } : null;
});
stage.addEventListener("pointerleave", () => (mouse = null));

function frame() {
  t += 0.03;
  letters.forEach((s, i) => {
    let k; // 0…1 — насколько «кричит» буква
    if (mouse) {
      const b = s.getBoundingClientRect();
      const d = Math.hypot(b.left + b.width / 2 - mouse.x, b.top + b.height / 2 - mouse.y);
      k = Math.max(0, 1 - d / RADIUS);
    } else {
      k = ((Math.sin(t - i * 0.45) + 1) / 2) * 0.6;
    }
    s.style.fontWeight = Math.round(BASE_WEIGHT + (MAX_WEIGHT - BASE_WEIGHT) * k);
    s.classList.toggle("hot", k > 0.75);
  });
  if (!reduceMotion) requestAnimationFrame(frame);
}
frame();

// Стихи: переключение вкладок
const tabs = [...document.querySelectorAll('.reader__list [role="tab"]')];
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  });
});

// Навигация: подсветка текущего раздела
const navLinks = [...document.querySelectorAll(".nav a")];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle("is-active", a.hash === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("#books, #poems, #about").forEach((s) => observer.observe(s));

document.getElementById("year").textContent = new Date().getFullYear();
