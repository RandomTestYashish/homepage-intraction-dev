import { asset, el } from "../lib/dom.js";

// New inventories V2: a line of text that runs right to left under the header, in a
// loop. The track holds the message four times and slides by half its width, so the
// second half lands exactly where the first began.
const TICKER_ITEM = `<span class="ticker__item"><b>Zakir Khan Live</b> • Airtel postpaid the advantage club • </span>`;
const TickerTape = () => `
  <div class="ticker" role="marquee" aria-label="Zakir Khan Live. Airtel postpaid, the advantage club.">
    <div class="ticker__track" aria-hidden="true">${TICKER_ITEM.repeat(4)}</div>
  </div>`;

export function Header({ onMenu } = {}) {
  const header = el(`
    <header class="app-header">
      <button class="icon-btn pressable app-header__menu" type="button" aria-label="Menu" aria-haspopup="dialog">
        <img src="${asset("hdr-back.svg")}" alt="" />
      </button>
      <div class="app-header__actions">
        <button class="icon-btn pressable" type="button" aria-label="Search">
          <img src="${asset("hdr-question.svg")}" alt="" />
        </button>
        <button class="scan-btn pressable" type="button" aria-label="Scan QR">
          <img src="${asset("hdr-append.png")}" alt="" />
        </button>
      </div>
      ${TickerTape()}
    </header>
  `);

  header.querySelector(".app-header__menu").addEventListener("click", () => onMenu?.());
  return header;
}
