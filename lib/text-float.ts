// Встроенный скрипт «плавающего магазина»: надписи, карточки, фото, кнопки и
// поля медленно покачиваются вверх-вниз, каждый элемент в своём ритме, чтобы
// ничего не двигалось строем. Действует только внутри [data-animate-text] —
// это витрина; в админ-панели такой разметки нет, там всё неподвижно.
//
// Работает сразу после загрузки HTML, не дожидаясь React, и не меняет атрибуты
// элементов (Web Animations API), поэтому не конфликтует с гидратацией.
// Анимации идут только у элементов на экране — остальные стоят на паузе.

function shopFloat() {
  if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const FLOATING = [
    // Надписи.
    "h1, h2, h3, p, dt, dd, label, .font-display, .tabular-nums",
    // Карточки, плитки, позиции корзины.
    "article, .panel, li",
    // Фото и иллюстрации вне карточек (например, на странице товара).
    ".aspect-square",
    // Кнопки, ссылки-«таблетки», поля ввода.
    ".btn, .btn-outline, button, a.rounded-full, input, select, textarea",
  ].join(", ");
  const SKIP = "[data-static-text]";

  // [амплитуда в px, минимальный период в мс]: крупное плывёт шире и медленнее.
  const motion = (el: Element): [number, number] => {
    const tag = el.tagName;
    if (tag === "ARTICLE" || el.classList.contains("panel") || tag === "LI") return [6, 5200];
    if (el.classList.contains("aspect-square")) return [8, 6000];
    if (/^H[12]$/.test(tag)) return [7, 3600];
    if (tag === "H3" || tag === "DT" || el.classList.contains("font-display")) return [5, 3400];
    if (/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(tag)) return [3, 3000];
    return [3, 3200];
  };

  const start = () => {
    const anims = new WeakMap<Element, Animation>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const anim = anims.get(entry.target);
        if (!anim) continue;
        if (entry.isIntersecting) anim.play();
        else anim.pause();
      }
    });

    const scan = () => {
      document.querySelectorAll("[data-animate-text]").forEach((area) => {
        area.querySelectorAll(FLOATING).forEach((el) => {
          if (anims.has(el) || el.closest(SKIP)) return;
          const [amp, minPeriod] = motion(el);
          const duration = minPeriod + Math.random() * 2400;
          const anim = el.animate(
            [
              { transform: "translateY(0)" },
              { transform: `translateY(${-amp}px)` },
              { transform: "translateY(0)" },
            ],
            { duration, iterations: Infinity, easing: "ease-in-out", delay: -Math.random() * duration },
          );
          anim.pause();
          anims.set(el, anim);
          io.observe(el);
        });
      });
    };

    scan();
    // Новые элементы появляются при переходах между страницами и в корзине.
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}

export const TEXT_FLOAT_SCRIPT = `(${shopFloat.toString()})();`;
