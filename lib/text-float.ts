// Встроенный скрипт «плавающих надписей»: каждая надпись магазина медленно
// покачивается вверх-вниз в своём ритме, чтобы текст не двигался строем.
// Работает сразу после загрузки HTML, не дожидаясь React, и не меняет атрибуты
// элементов (Web Animations API), поэтому не конфликтует с гидратацией.
// Анимации идут только у надписей на экране — остальные стоят на паузе.

function textFloat() {
  if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const TEXT = "h1, h2, h3, p, dt, dd, label, .font-display, .tabular-nums";
  const SKIP = "[data-static-text]";

  // Крупный текст качается заметнее, мелкий — едва-едва, чтобы читался.
  const amplitude = (el: Element) => {
    if (/^H[12]$/.test(el.tagName)) return 7;
    if (el.tagName === "H3" || el.tagName === "DT" || el.classList.contains("font-display")) return 5;
    return 3;
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
        area.querySelectorAll(TEXT).forEach((el) => {
          if (anims.has(el) || el.closest(SKIP)) return;
          const amp = amplitude(el);
          const duration = 3200 + Math.random() * 2400;
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
    // Новые надписи появляются при переходах между страницами и в корзине.
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}

export const TEXT_FLOAT_SCRIPT = `(${textFloat.toString()})();`;
