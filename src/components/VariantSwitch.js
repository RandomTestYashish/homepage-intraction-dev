import { el } from "../lib/dom.js";

// Each group is its own dropdown. Ids go in the URL, so they stay unique across groups.
const GROUPS = [
  {
    title: "Homepage interaction",
    short: "Home",
    variants: [
      { id: "1", name: "V1", text: "Top nav small icons" },
      { id: "2", name: "V2", text: "Top nav only titles" },
      { id: "3", name: "V3", text: "Glass effect" },
      { id: "4", name: "V4", text: "Bottom nav shrinks" },
      { id: "5", name: "V5", text: "New top nav" },
    ],
  },
  {
    title: "New inventories",
    short: "New",
    variants: [
      { id: "n1", name: "V1", text: "Top Strip" },
      { id: "n2", name: "V2", text: "Ticket tape" },
      { id: "n3", name: "V3", text: "Smart Icon" },
    ],
  },
];
const VARIANTS = GROUPS.flatMap((group) => group.variants);

/**
 * Preview control for switching between versions of the prototype: one dropdown per
 * group ("Homepage interaction", "New inventories"), each listing its versions. The
 * choice lives in the URL (`?v=2`, `?v=n1`), so a link opens on the same version. On
 * desktop the dropdowns sit beside the phone; on phones CSS turns each into a small
 * pill at the right edge that shows the current version, or the group's short name,
 * and opens its list under it.
 */
export function VariantSwitch({ onChange }) {
  const params = new URLSearchParams(location.search);
  let current = VARIANTS.some((variant) => variant.id === params.get("v")) ? params.get("v") : "1";

  const root = el(`
    <div class="variant-menus">
      ${GROUPS.map(
        (group, index) => `
        <div class="variant-menu">
          <button class="variant-menu__toggle" type="button" aria-expanded="false" aria-controls="variant-list-${index}">
            <span class="variant-menu__title">${group.title}</span>
            <span class="variant-menu__short" aria-hidden="true">${group.short}</span>
            <strong class="variant-menu__current"></strong>
            <svg class="variant-menu__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <fieldset class="variant-switch" id="variant-list-${index}" aria-label="${group.title} version" hidden>
            ${group.variants
              .map(
                (variant) => `
              <button class="variant-switch__button" type="button" data-variant="${variant.id}"
                aria-label="${variant.name}: ${variant.text}">
                <strong>${variant.name}</strong><span class="variant-switch__text">${variant.text}</span>
              </button>`,
              )
              .join("")}
          </fieldset>
        </div>`,
      ).join("")}
    </div>
  `);

  const menus = [...root.querySelectorAll(".variant-menu")].map((menu) => ({
    menu,
    toggle: menu.querySelector(".variant-menu__toggle"),
    list: menu.querySelector(".variant-switch"),
    chip: menu.querySelector(".variant-menu__current"),
  }));
  const buttons = [...root.querySelectorAll(".variant-switch__button")];

  // Only one dropdown is open at a time.
  const setOpen = (target, open) => {
    menus.forEach(({ toggle, list }) => {
      const show = open && list === target;
      toggle.setAttribute("aria-expanded", String(show));
      list.hidden = !show;
    });
  };
  const closeAll = () => setOpen(null, false);

  // The group holding the current version shows it on its button; the others show none.
  const showCurrent = () => {
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.variant === current)));
    menus.forEach(({ menu, list, chip }) => {
      const chosen = list.querySelector('[aria-pressed="true"] strong');
      chip.textContent = chosen ? chosen.textContent : "";
      chip.hidden = !chosen;
      menu.classList.toggle("is-current", Boolean(chosen));
    });
  };

  menus.forEach(({ toggle, list }) => toggle.addEventListener("click", () => setOpen(list, list.hidden)));
  document.addEventListener("pointerdown", (event) => {
    if (!root.contains(event.target)) closeAll();
  });
  root.addEventListener("keydown", (event) => {
    const open = menus.find(({ list }) => !list.hidden);
    if (event.key !== "Escape" || !open) return;
    closeAll();
    open.toggle.focus();
  });

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      current = button.dataset.variant;
      showCurrent();
      closeAll();

      const url = new URL(location.href);
      if (current === "1") url.searchParams.delete("v");
      else url.searchParams.set("v", current);
      history.replaceState(null, "", url);

      onChange(current);
    });
  });

  showCurrent();
  onChange(current);
  return root;
}
