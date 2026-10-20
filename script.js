// Страницы для печатной машинки — меняем здесь.
// Каждая страница — массив строк (до ~50 символов, иначе не влезет на лист).
const pages = [
  [
    "БЕЗ СЛОВ",
    "",
    "«Я люблю тебя!» — говорят громко и чётко",
    "В ресторане, на площади, в парке и дома,",
    "Но признанье в любви должно быть тихим и кротким",
    "«Я люблю тебя» — и будет слышно даже глухому."
  ],
  [
    "СЛОВА",
    "",
    "Острой бритвой в гневе становятся слова,",
    "Что бросаешь в человека для тебя родного.",
    "Они сердце поразят, как поражает цель стрела",
    "И ждать исхода не приходится иного."
  ],
  [
    "ПРИЗРАКИ ПРОШЛОГО",
    "",
    "Я увижу тебя через долгие десятки лет",
    "Снова эти глаза, этот смех, этот голос,",
    "Но родного в них для меня ничего уже нет",
    "И в разговоре с тобой я чувствую холод."
  ]
];

const CHAR_W = 7.938;    // ширина символа на листе = шаг линейки
const TYPE_SPEED = 75;   // мс на символ (+ случайный разброс)
const LINE_PAUSE = 520;  // возврат каретки
const PAGE_HOLD = 3600;  // пауза на готовой странице

const carriage = document.getElementById("tw-carriage");
const textEl = document.getElementById("tw-text");
const keyboard = document.getElementById("tw-keyboard");
const live = document.getElementById("tw-live");
const tw = document.querySelector(".tw");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Клавиатура: ряды и координаты из Figma
const rows = [
  { keys: "1234567890—", left: 225.4, top: 485.1 },
  { keys: "ЙЦУКЕНГШЩЗХЪ", left: 200.9, top: 537.04 },
  { keys: "ФЫВАПРОЛДЖЭ", left: 233.24, top: 588.98 }
];
const keyMap = {};
rows.forEach(({ keys, left, top }) => {
  [...keys].forEach((ch, i) => {
    const k = document.createElement("span");
    k.className = "key";
    k.textContent = ch;
    k.style.left = left + i * 49 + "px";
    k.style.top = top + "px";
    keyboard.appendChild(k);
    keyMap[ch] = k;
  });
});
keyMap["-"] = keyMap["–"] = keyMap["—"];
keyMap["Ё"] = keyMap["Е"];

function press(ch) {
  const k = keyMap[ch.toUpperCase()];
  if (!k) return;
  k.classList.add("is-pressed");
  setTimeout(() => k.classList.remove("is-pressed"), 90);
}

function moveCarriage(col, returning = false) {
  carriage.classList.toggle("is-returning", returning);
  carriage.style.transform = `translateX(${-col * CHAR_W}px)`;
}

function renderStatic(page) {
  textEl.innerHTML = "";
  page.forEach((line) => {
    const d = document.createElement("div");
    d.textContent = line;
    textEl.appendChild(d);
  });
}

async function typePage(page) {
  textEl.innerHTML = "";
  live.textContent = page.join(" ");
  for (const line of page) {
    const row = document.createElement("div");
    textEl.appendChild(row);
    for (let c = 0; c < line.length; c++) {
      row.textContent = line.slice(0, c + 1);
      press(line[c]);
      moveCarriage(c + 1);
      await sleep(TYPE_SPEED + Math.random() * 70 + (line[c] === " " ? 40 : 0));
    }
    await sleep(260);
    moveCarriage(0, true); // возврат каретки
    await sleep(LINE_PAUSE);
  }
}

async function run() {
  if (reduceMotion) {
    renderStatic(pages[0]);
    live.textContent = pages[0].join(" ");
    return;
  }
  for (let i = 0; ; i = (i + 1) % pages.length) {
    textEl.classList.remove("is-feeding");
    await typePage(pages[i]);
    await sleep(PAGE_HOLD);
    textEl.classList.add("is-feeding"); // лист уезжает вверх
    await sleep(700);
  }
}

// Масштаб машинки: на узких экранах уменьшаем, но не мельче 0.6 (края обрезаются)
function fit() {
  const s = Math.min(1, Math.max(0.6, (window.innerWidth - 32) / 980));
  tw.style.setProperty("--s", s);
}
fit();
window.addEventListener("resize", fit);
run();

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
