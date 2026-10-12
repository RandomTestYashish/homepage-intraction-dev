# Airtel homepage interactions

Web prototype of the "Manage Landing" Figma screen (375 × 812), shown inside an iPhone mockup.
Plain HTML, CSS and JavaScript modules with no build step. Springs use [Motion](https://motion.dev),
vendored in `src/vendor/` so nothing is installed or fetched at runtime.

## Run

```
python3 serve.py
```

`serve.py` is Python's built-in file server with browser caching switched off, so a normal refresh
always shows the latest files.

Then open http://localhost:3000.

On a desktop browser the screen is shown inside an iPhone mockup. On a phone the mockup is dropped and
the screen fills the browser. Add `?view=mobile` or `?view=mockup` to the URL to force either mode.

Five versions are switchable from the "Homepage interaction" dropdown at the top left of the desktop
preview, from the small current-version pill at the right edge on a phone (tap it for the list), or with `?v=2` / `?v=3` / `?v=4` / `?v=5`:
**V1** shrinks the category tab icons once the page is scrolled; **V2** hides them and keeps only the titles;
**V3** is V1 with an iOS-style glass background on the header, category tabs and bottom navigation;
**V4** is V1 with a bottom navigation that never hides: its bar scales down in place while the page is
scrolling and returns to full size when scrolling stops;
**V5** has the new top nav: the selected category is a folder-tab shape that runs into the page, with a
filled icon, and once the page is scrolled it keeps only the titles, as V2 does. V5 also has its own
pages under the tabs: the All page (Claim Rewards, recommendations, add-ons, services, products) and the
Prepaid page (connection status, quick actions, rewards, benefits, data usage and the current pack).

A second dropdown, "New inventories", holds prototypes of new homepage inventory: **V1 – Top Strip**
(`?v=n1`) puts a strip for events and new launches above the app. The homepage starts at the top,
covering it, comes down off it after one second, and slides back up over it as the page scrolls (`src/components/TopStripPage.js`, `src/styles/inventories.css`).

**V2 – Ticket tape** (`?v=n2`) runs "Zakir Khan Live • Airtel postpaid the advantage club" right to left
under the header, in a loop, with a chevron at its end. On scroll the tape stays stuck at the top, with the
category tabs pinned under it.

**V3 – Smart Icon** (`?v=n3`) puts an offer ("Refer & Save ₹300") in the tab row, ahead of the first tab.

A third dropdown, "Top Nav", holds versions of the top nav on the V1 homepage: **V1 – Unlimited tag
shimmer** (`?v=t1`) is Homepage interaction V1 with "Unlimited" as a dark Info Tag across the bottom edge of
the Postpaid tile; a band of light crosses it and rests before the next pass (`src/styles/sections.css`).
**V2 – Stroke and banner** (`?v=t2`) waits three seconds, draws a red stroke round the Postpaid tile over one
second, then opens a banner under the tabs that points up at Postpaid. Scrolling removes the banner and the
stroke stays; Refresh plays it again (`src/components/NavNudge.js`, `startNudge` in `src/App.js`).

In all three, the Prepaid tab opens the same Prepaid page as V5, with its blue tab.

The Refresh button at the top right of the desktop preview (a round pill above the dropdowns on a
phone) replays the current version from its start.

## Layout

- `index.html` – entry page
- `src/App.js` – assembles the screen and wires the scroll behaviour
- `src/components/` – one module per UI piece (Header, BottomNavigation, PhoneFrame, …);
  `AllPageV5.js` and `PrepaidPage.js` hold the sections of V5's All and Prepaid tabs, styled in
  `src/styles/all-v5.css` and `src/styles/prepaid.css`
- `src/lib/` – motion presets, the central scroll logic, the infinite rail engine, press feedback
- `src/styles/tokens.css` – design tokens (colour, type, radius, motion)
- `src/assets/` – images and icons exported from Figma
- `reference/full.png` – Figma render of the screen, for comparison
- `src/vendor/motion.js` – Motion 14.0.0 browser bundle (MIT)
- `src/vendor/lottie.js` – lottie-web 5.12.2 light player (MIT), plays the Smart Icon animation
