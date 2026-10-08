import { el } from "../lib/dom.js";

const VARIANTS = [
  { id: "1", name: "V1", text: "Top nav small icons" },
  { id: "2", name: "V2", text: "Top nav only titles" },
  { id: "3", name: "V3", text: "Glass effect" },
  { id: "4", name: "V4", text: "Bottom nav shrinks" },
  { id: "5", name: "V5", text: "New top nav" },
];

/**
 * Preview control for switching between versions of the prototype: a "Homepage
 * interaction" dropdown that lists them. The choice lives in the URL (`?v=2`), so a
 * link opens on the same version. On desktop it sits beside the phone; on phones CSS
 * turns it into a small pill at the right edge that shows the current version and
 * opens the "V1 / V2 / V3 / V4 / V5" list under it.
 */
export function VariantSwitch({ onChange }) {
  const params = new URLSearchParams(location.search);
  let current = VARIANTS.some((variant) => variant.id === params.get("v")) ? params.get("v") : "1";
  const nameOf = (id) => VARIANTS.find((variant) => variant.id === id).name;

  const menu = el(`
    <div class="variant-menu">
      <button class="variant-menu__toggle" type="button" aria-expanded="false" aria-controls="variant-list">
        <span class="variant-menu__title">Homepage interaction</span>
        <strong class="variant-menu__current">${nameOf(current)}</strong>
        <svg class="variant-menu__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <fieldset class="variant-switch" id="variant-list" aria-label="Prototype version" hidden>
        ${VARIANTS.map(
          (variant) => `
          <button class="variant-switch__button" type="button" data-variant="${variant.id}"
            aria-pressed="${variant.id === current}" aria-label="${variant.name}: ${variant.text}">
            <strong>${variant.name}</strong><span class="variant-switch__text">${variant.text}</span>
          </button>`,
        ).join("")}
      </fieldset>
    </div>
  `);

  const toggle = menu.querySelector(".variant-menu__toggle");
  const list = menu.querySelector(".variant-switch");
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
  };
  toggle.addEventListener("click", () => setOpen(list.hidden));
  document.addEventListener("pointerdown", (event) => {
    if (!menu.contains(event.target)) setOpen(false);
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || list.hidden) return;
    setOpen(false);
    toggle.focus();
  });

  const buttons = [...list.querySelectorAll("button")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      current = button.dataset.variant;
      buttons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      menu.querySelector(".variant-menu__current").textContent = nameOf(current);
      setOpen(false);

      const url = new URL(location.href);
      if (current === "1") url.searchParams.delete("v");
      else url.searchParams.set("v", current);
      history.replaceState(null, "", url);

      onChange(current);
    });
  });

  onChange(current);
  return menu;
}
