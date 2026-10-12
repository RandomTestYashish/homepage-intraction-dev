import { asset, el } from "../lib/dom.js";

const WIDTH = 343;
const POINTER = 7.617; // half the width of the pointer on the card's top edge
// The card's outline, from the Figma vector, with its pointer wherever `x` puts it.
const outline = (x) =>
  `M${x + POINTER} 12H311C326.085 12 333.627 12.0002 338.313 16.6865C343 21.3728 343 28.9151 343 44V74` +
  `C343 89.0849 343 96.6272 338.313 101.313C333.627 106 326.085 106 311 106H32` +
  `C16.9151 106 9.37281 106 4.68652 101.313C0.000231936 96.6272 0 89.0849 0 74V44` +
  `C0 28.9151 0.000232122 21.3728 4.68652 16.6865C9.37281 12.0002 16.9151 12 32 12H${x - POINTER}L${x} 0Z`;

/**
 * Top Nav V2: a banner under the category tabs, lying over the top of the page, that points
 * up at one of them. It starts hidden; App.js shows it once the stroke around that tab's tile is complete, and
 * removes it when the page is scrolled.
 */
export function NavNudge() {
  const root = el(`
    <div class="nav-nudge" aria-hidden="true">
      <div class="nav-nudge__card">
        <svg class="nav-nudge__shape" width="${WIDTH}" height="106" viewBox="0 0 ${WIDTH} 106" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="nav-nudge-fill" x1="14.6633" y1="106" x2="348.937" y2="48.0826" gradientUnits="userSpaceOnUse">
              <stop stop-color="#D90C00" /><stop offset="1" stop-color="#FD6400" />
            </linearGradient>
            <linearGradient id="nav-nudge-light" x1="0" x2="1" y1="0" y2="0">
              <stop stop-color="#fff" stop-opacity="0" /><stop offset="0.5" stop-color="#fff" stop-opacity="0.45" />
              <stop offset="1" stop-color="#fff" stop-opacity="0" />
            </linearGradient>
            <clipPath id="nav-nudge-clip"><path /></clipPath>
          </defs>
          <path class="nav-nudge__fill" fill="url(#nav-nudge-fill)" />
          <g clip-path="url(#nav-nudge-clip)">
            <rect class="nav-nudge__shine" x="0" y="0" width="90" height="106" fill="url(#nav-nudge-light)" />
          </g>
        </svg>
        <p class="nav-nudge__title">Faster than ever</p>
        <p class="nav-nudge__text">Upgrade at ₹499</p>
        <img class="nav-nudge__photo" src="${asset("nudge-photo.png")}" alt="" />
      </div>
    </div>
  `);
  const card = root.querySelector(".nav-nudge__card");
  const shapes = root.querySelectorAll("path"); // the fill, and the same outline clipping the shimmer

  /** Opens the banner with its pointer `x` px from the card's left edge. */
  root.show = (x) => {
    const at = Math.max(32 + POINTER, Math.min(x, WIDTH - 32 - POINTER)); // clear of the rounded corners
    shapes.forEach((shape) => shape.setAttribute("d", outline(at)));
    card.style.transformOrigin = `${at}px 0`; // it grows out of the pointer
    root.classList.add("is-shown");
    root.setAttribute("aria-hidden", "false");
  };
  root.hide = () => {
    root.classList.remove("is-shown");
    root.setAttribute("aria-hidden", "true");
  };
  return root;
}
