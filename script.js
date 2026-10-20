// Строки для печатной машинки — меняем здесь
const lines = [
  "Слова приходят тихо.",
  "Строка за строкой.",
  "Это — мои стихи."
];

const TYPE_SPEED = 70;    // мс на символ
const ERASE_SPEED = 35;
const HOLD_TIME = 2200;   // пауза после строки

const el = document.getElementById("typewriter");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function typewriter() {
  if (reduceMotion) {
    el.textContent = lines[lines.length - 1];
    return;
  }
  for (let i = 0; ; i = (i + 1) % lines.length) {
    const text = lines[i];
    for (let c = 1; c <= text.length; c++) {
      el.textContent = text.slice(0, c);
      await sleep(TYPE_SPEED + Math.random() * 60);
    }
    await sleep(HOLD_TIME);
    for (let c = text.length; c >= 0; c--) {
      el.textContent = text.slice(0, c);
      await sleep(ERASE_SPEED);
    }
    await sleep(400);
  }
}

typewriter();
document.getElementById("year").textContent = new Date().getFullYear();
