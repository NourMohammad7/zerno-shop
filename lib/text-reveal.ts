// Встроенный скрипт проявления текста. Работает сразу после загрузки HTML,
// не дожидаясь React, и не меняет атрибуты элементов (Web Animations API),
// поэтому не конфликтует с гидратацией.
//
// CSS (html.tr-ready в globals.css) прячет текст внутри [data-animate-text]
// заранее; скрипт проигрывает появление, когда текст попадает на экран.
// Тексты одной «волны» идут по очереди. Список TEXT должен совпадать с CSS.

function textReveal() {
  const root = document.documentElement;
  if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;
  root.classList.add("tr-ready");

  const TEXT = "h1, h2, h3, p, dt, dd, label, .font-display, .tabular-nums";
  const SKIP = "[data-static-text], .fade-up";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const show = (el: Element, i: number) => {
    el.animate(
      reduce
        ? [{ opacity: 1 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translateY(16px)", filter: "blur(5px)" },
            { opacity: 1, transform: "none", filter: "none" },
          ],
      {
        duration: reduce ? 1 : 750,
        delay: reduce ? 0 : Math.min(i * 70, 560),
        easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        fill: "both",
      },
    );
  };

  const start = () => {
    try {
      const seen = new WeakSet<Element>();
      const io = new IntersectionObserver(
        (entries) => {
          let i = 0;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            show(entry.target, i++);
            io.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -6% 0px" },
      );
      const scan = () => {
        document.querySelectorAll("[data-animate-text]").forEach((area) => {
          area.querySelectorAll(TEXT).forEach((el) => {
            if (seen.has(el) || el.closest(SKIP)) return;
            seen.add(el);
            io.observe(el);
          });
        });
      };
      scan();
      // Новые тексты появляются при переходах между страницами и в корзине.
      new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    } catch {
      root.classList.remove("tr-ready");
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}

export const TEXT_REVEAL_SCRIPT = `(${textReveal.toString()})();`;
