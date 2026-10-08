import { asset, el } from "../lib/dom.js";
import { Recommended, Services } from "./AllPageV5.js";
import { Button } from "./Button.js";
import { IconActionGrid } from "./IconActionGrid.js";

/**
 * New inventories V1: a strip for events and new launches. It sits above the app, behind
 * a white sheet that carries the header and the page; App.js slides the sheet up over
 * it as the page scrolls.
 */
export function TopStrip() {
  return el(`
    <aside class="top-strip" aria-label="Zakir Khan Live">
      <img class="top-strip__texture" src="${asset("inv1-texture.png")}" alt="" />
      <div class="top-strip__body">
        <span class="top-strip__logo">
          <img class="top-strip__logo-art" src="${asset("inv1-logo.svg")}" alt="Airtel Thanks: The Advantage Club" />
          <img class="top-strip__logo-mark" src="${asset("inv1-logo-mark.svg")}" alt="" />
          <span class="top-strip__ribbon">
            <img src="${asset("inv1-logo-ribbon.svg")}" alt="" /><span>Delhi Edition</span>
          </span>
        </span>
        <p class="top-strip__note">Exclusive Show.<br />Limited seats.</p>
        <span class="top-strip__person"><img src="${asset("inv1-person.png")}" alt="" /></span>
        <p class="top-strip__title">Zakir Khan Live</p>
        <button class="top-strip__cta pressable" type="button">Know More</button>
      </div>
    </aside>
  `);
}

/**
 * New inventories V2: a line of text that runs right to left under the header, in a
 * loop, with a chevron at its end. The track holds the message four times and slides by
 * half its width, so the second half lands exactly where the first began. App.js keeps
 * it under the header and, once that has gone, stuck at the top above the tabs.
 */
export function TickerTape() {
  const item = `<span class="ticker__item"><b>Zakir Khan Live</b> • Airtel postpaid the advantage club • </span>`;
  return el(`
    <div class="ticker">
      <div class="ticker__view" role="marquee" aria-label="Zakir Khan Live. Airtel postpaid, the advantage club.">
        <div class="ticker__track" aria-hidden="true">${item.repeat(4)}</div>
      </div>
      <button class="ticker__more pressable" type="button" aria-label="Know more">
        <img src="${asset("all5-chevron-20.svg")}" alt="" />
      </button>
    </div>
  `);
}

function Welcome() {
  return el(`
    <section class="inv1 welcome1" aria-label="New postpaid">
      <img class="welcome1__wash" src="${asset("inv1-wash.png")}" alt="" />
      <img class="welcome1__shadow" src="${asset("inv1-sim-shadow.svg")}" alt="" />
      <img class="welcome1__sim" src="${asset("inv1-sim.png")}" alt="" />
      <h2 class="welcome1__title">Welcome to the all<br />new postpaid.</h2>
      <p class="welcome1__body">Enjoy unlimited data &amp; benefits worth ₹99</p>
      ${Button({ label: "Know More" })}
    </section>
  `);
}

/** The sections shown under the tabs while the Top Strip version is selected. */
export function TopStripPage() {
  const sections = [Welcome(), Recommended(), Services(), IconActionGrid()];
  sections.forEach((section) => {
    section.classList.remove("all5");
    section.classList.add("inv1");
  });
  return sections;
}
