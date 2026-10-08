import { el } from "./lib/dom.js";
import { enableDragScroll } from "./lib/dragScroll.js";
import { animate, reducedMotion, transition } from "./lib/motion.js";
import { enablePressFeedback } from "./lib/press.js";
import { createScrollMotion } from "./lib/scrollMotion.js";
import { BottomNavigation } from "./components/BottomNavigation.js";
import { CuratedBanners, FeaturingFresh, RechargeForOthers, YouMightLike } from "./components/Carousels.js";
import { CategoryTabs } from "./components/CategoryTabs.js";
import { ExploreProducts } from "./components/ExploreProducts.js";
import { HamburgerMenu } from "./components/HamburgerMenu.js";
import { Header } from "./components/Header.js";
import { IconActionGrid } from "./components/IconActionGrid.js";
import { IllustrativeGrid } from "./components/IllustrativeGrid.js";
import { MyServices } from "./components/MyServices.js";
import { NextBestAction } from "./components/NextBestAction.js";
import { AllPageV5 } from "./components/AllPageV5.js";
import { PhoneFrame } from "./components/PhoneFrame.js";
import { PrepaidPage } from "./components/PrepaidPage.js";
import { ProductShowcase } from "./components/ProductShowcase.js";
import { StatusBar } from "./components/StatusBar.js";
import { TickerTape, TopStrip, TopStripPage } from "./components/TopStripPage.js";
import { VariantSwitch } from "./components/VariantSwitch.js";

const BUY_PRODUCTS = [
  { label: "Insta EMI Card", image: "tile-emi.png" },
  { label: "Gold Loan", image: "tile-gold.png" },
  { label: "Credit Card", image: "tile-credit.png" },
  { label: "Fixed Deposit", image: "tile-fd.png" },
  { label: "Refer Wi-Fi", image: "tile-referwifi.png", tag: "₹300 off" },
  { label: "Postpaid", image: "tile-postpaid.png" },
  { label: "IPTV", image: "tile-iptv.png" },
  { label: "Bundle your services", image: "tile-bundle.png" },
  { label: "New Prepaid", image: "tile-prepaid.png" },
];

const QUICK_LINKS = [
  { label: "Call Manager", image: "tile-call.png" },
  { label: "Rewards & OTTs", image: "tile-rewards.png" },
  { label: "Refer & Get ₹300", image: "tile-refer.png" },
];

const HERO_RANGE = 260; // px of scroll over which the hero card eases back
const HEADER_HEIGHT = 72;
const TABS_COMPACT_AT = 16; // scrolling past this shrinks the tabs…
const TABS_NORMAL_AT = 9; // …and they stay small until the page is back up here
const NAV_SHRUNK = 0.86; // V4: how small the bottom nav bar gets while the page is scrolling
const TABS_INSET = 16; // where the first category tab starts…
const TABS_INSET_V5 = 24; // …and where it starts in V5, whose tabs are spaced wider
const STRIP_VARIANT = "n1"; // New inventories V1: the Top Strip
const STRIP_HEIGHT = 106; // how much of the strip shows above the sheet at the top of the page
const STRIP_HEADER_RANGE = 40; // the header may only start leaving over the strip's last 40px
const TICKER_VARIANT = "n2"; // New inventories V2: the Ticket tape
const TICKER_TOP = 75; // where the tape sits below the status bar while the header is showing
const TICKER_HEIGHT = 33; // the tape is 1px taller than this, so no seam shows where the tabs pin under it
const STRIP_DELAY = 1000; // ms the homepage sits at the top before it comes down off the strip

export function App() {
  const { stage, screen } = PhoneFrame();

  const page = el(`<div class="page scroll-y" tabindex="-1"></div>`);
  const hero = NextBestAction();
  const tabs = CategoryTabs();
  page.append(
    tabs,
    hero,
    MyServices(),
    IllustrativeGrid({ title: "Buy Airtel products", link: "View all", items: BUY_PRODUCTS }),
    IconActionGrid(),
    ExploreProducts(),
    CuratedBanners(),
    IllustrativeGrid({ items: QUICK_LINKS, gap: 16 }),
    RechargeForOthers(),
    YouMightLike(),
    FeaturingFresh(),
    ProductShowcase(),
    ...AllPageV5({ products: BUY_PRODUCTS }),
    ...PrepaidPage(),
    ...TopStripPage(),
  );

  // V1–V4 show the home sections whatever tab is selected. V5 has its own pages
  // under the tabs: the Prepaid page for Prepaid, and its All page for the rest.
  // The New inventories versions share one page of their own.
  const PREPAID_TAB = 1;
  let selectedTab = 0;
  function showView() {
    const variant = screen.dataset.variant;
    const v5View = selectedTab === PREPAID_TAB ? "prepaid" : "all";
    const view = variant.startsWith("n") ? "strip" : variant === "5" ? v5View : "home"; // n… = New inventories
    if (page.dataset.view === view) return;
    page.dataset.view = view;
    page.scrollTop = 0; // a different page starts from its top
  }
  tabs.addEventListener("tabchange", (event) => {
    selectedTab = event.detail.index;
    showView();
  });

  // The header's menu button opens the side drawer over the home screen; while it
  // is open, everything behind it is taken out of the tab order.
  const menu = HamburgerMenu({
    onOpenChange: (open) => [page, header, ticker, bottomNav].forEach((layer) => (layer.inert = open)),
  });
  const header = Header({ onMenu: menu.open });
  const bottomNav = BottomNavigation({
    // Choosing a destination returns the page to the top, as native tab bars do.
    onSelect: () => page.scrollTo({ top: 0, behavior: "smooth" }),
  });

  // The strip and the sheet over it lie behind the page; only the Top Strip version shows them.
  const strip = TopStrip();
  const sheet = el(`<div class="strip-sheet"></div>`);
  const ticker = TickerTape(); // only the Ticket tape version shows it
  screen.append(strip, sheet, page, ticker, StatusBar(), header, bottomNav, menu.element);

  // Scroll-linked: the hero card recedes very slightly as the page moves under the header.
  const heroCard = hero.querySelector(".nba__card");
  let heroProgress = 0;
  function linkHero(y) {
    const progress = reducedMotion.matches ? 0 : Math.min(1, y / HERO_RANGE);
    if (progress === heroProgress) return;
    heroProgress = progress;
    heroCard.style.transform = `scale(${1 - 0.02 * progress})`;
    heroCard.style.opacity = 1 - 0.06 * progress;
  }

  // The header hides and returns on its own spring. The category tabs' position is
  // never animated: they scroll with the page, pin under the status bar, and are
  // only held clear of whatever part of the header is currently on screen.
  let headerShown = 1; // 1 = fully visible, 0 = fully hidden
  let headerAnimation = null;
  let scrollY = 0;
  let statusBar = 44; // height of the mockup's status bar; 0 on a real phone
  let pageTop = 125; // where the category tabs sit at scrollTop 0
  function measureChrome() {
    statusBar = header.offsetTop;
    pageTop = parseFloat(getComputedStyle(page).paddingTop);
    layoutChrome();
  }

  // Top Strip: the homepage starts at the top, covering the strip, and after a moment
  // comes down to show it. `stripShown` is how much of the strip is uncovered; it feeds
  // --strip-h, which is part of where the page starts (inventories.css).
  const hasStrip = () => screen.dataset.variant === STRIP_VARIANT;
  let stripShown = 0;
  let stripTimer = 0;
  let stripAnimation = null;
  function setStripShown(value) {
    pageTop += value - stripShown;
    stripShown = value;
    screen.style.setProperty("--strip-h", `${value}px`);
    layoutChrome();
  }
  function startStrip() {
    clearTimeout(stripTimer);
    stripAnimation?.stop();
    screen.style.removeProperty("--strip-h");
    stripShown = 0;
    if (!hasStrip()) return;
    screen.style.setProperty("--strip-h", "0px");
    stripTimer = setTimeout(() => {
      // Already scrolled: the strip is covered anyway, so make room for it without moving the page.
      if (page.scrollTop > 0) {
        setStripShown(STRIP_HEIGHT);
        page.scrollTop += STRIP_HEIGHT;
        return;
      }
      stripAnimation = animate(0, STRIP_HEIGHT, { ...transition("stripDrop"), onUpdate: setStripShown });
    }, STRIP_DELAY);
  }

  function layoutChrome() {
    // Top Strip: the sheet, with the header on it, rides up over the strip as the page
    // scrolls, and the header stays put until the strip is nearly covered.
    const stripLeft = hasStrip() ? Math.max(0, stripShown - scrollY) : 0;
    const shown = Math.max(headerShown, Math.min(1, stripLeft / STRIP_HEADER_RANGE));
    sheet.style.transform = `translate3d(0, ${stripLeft}px, 0)`;
    // Its corners square off as it reaches the top, so no strip shows beside them.
    const radius = `${Math.min(16, stripLeft)}px`;
    if (screen.style.getPropertyValue("--sheet-radius") !== radius) screen.style.setProperty("--sheet-radius", radius);
    const stripState = stripLeft > statusBar / 2 ? "open" : "closed";
    if (screen.dataset.strip !== stripState) screen.dataset.strip = stripState;

    const visible = HEADER_HEIGHT * shown;
    header.style.transform = `translate3d(0, ${visible - HEADER_HEIGHT + stripLeft}px, 0)`; // translateY(-100%) when hidden
    header.style.opacity = 0.6 + 0.4 * shown;

    // Ticket tape: it rides up with the page, never above the status bar and never under
    // the header, then stays stuck at the top with the tabs pinned beneath it.
    const tickerHeight = screen.dataset.variant === TICKER_VARIANT ? TICKER_HEIGHT : 0;
    let floor = statusBar + stripLeft + visible; // the tabs are held below this line
    if (tickerHeight) {
      const underHeader = statusBar + visible + (TICKER_TOP - HEADER_HEIGHT) * shown;
      const tickerY = Math.max(statusBar, statusBar + TICKER_TOP - scrollY, underHeader);
      ticker.style.transform = `translate3d(0, ${tickerY}px, 0)`;
      floor = Math.max(floor, tickerY + tickerHeight);
    }

    const pinned = Math.max(pageTop - scrollY, statusBar + tickerHeight); // where position: sticky puts the tabs
    const clearance = Math.max(0, floor - pinned);
    tabs.style.transform = clearance ? `translate3d(0, ${clearance}px, 0)` : "";
  }

  // Once the page is scrolled the tab tiles shrink; they stay small on the way
  // back up and return to full size only at the top.
  let tabsCompact = false;
  let compactAmount = 0;
  let compactAnimation = null;
  function linkTabs(y) {
    const compact = y > (tabsCompact ? TABS_NORMAL_AT : TABS_COMPACT_AT);
    if (compact === tabsCompact) return;
    tabsCompact = compact;
    compactAnimation?.stop();
    compactAnimation = animate(compactAmount, compact ? 1 : 0, {
      ...transition("header"),
      onUpdate(value) {
        compactAmount = value;
        tabs.style.setProperty("--compact", value.toFixed(3));
      },
    });
  }

  // V4 never hides the bottom nav: while the page is scrolling, either way, its bar
  // scales down in place, and it returns to full size once scrolling rests.
  const navBar = bottomNav.querySelector(".bottom-nav__bar");
  const shrinksNav = () => screen.dataset.variant === "4";
  let navAway = false;
  function setVariant(variant) {
    screen.dataset.variant = variant;
    // V5 spaces the category tabs differently and starts the page a little higher.
    tabs.relayout(variant === "5" ? TABS_INSET_V5 : TABS_INSET);
    startStrip();
    if (screen.isConnected) measureChrome();
    showView();
    // Carry the nav's current state over to however this version shows it.
    screen.dataset.nav = navAway && !shrinksNav() ? "hidden" : "visible";
    animate(bottomNav, { y: navAway && !shrinksNav() ? "110%" : "0%" }, transition("bar"));
    animate(navBar, { scale: navAway && shrinksNav() ? NAV_SHRUNK : 1 }, transition("navShrink"));
  }

  const scrollMotion = createScrollMotion(page, {
    onHeader(hidden) {
      screen.dataset.header = hidden ? "hidden" : "visible";
      headerAnimation?.stop();
      headerAnimation = animate(headerShown, hidden ? 0 : 1, {
        ...transition("header"),
        onUpdate(value) {
          headerShown = value;
          layoutChrome();
        },
      });
    },
    onNav(hidden, reason) {
      navAway = hidden;
      if (shrinksNav()) {
        // V4: the bar stays where it is and draws in about its own centre.
        animate(navBar, { scale: hidden ? NAV_SHRUNK : 1 }, transition(hidden ? "navShrink" : "navGrow"));
        return;
      }
      screen.dataset.nav = hidden ? "hidden" : "visible";
      // Returning because the scroll came to rest gets the softer, settling spring.
      animate(bottomNav, { y: hidden ? "110%" : "0%" }, transition(reason === "rest" ? "settle" : "bar"));
    },
    navUntilRest: () => shrinksNav(),
    onProgress(y) {
      screen.dataset.scrolled = String(y > 4);
      linkHero(y);
      linkTabs(y - (hasStrip() ? stripShown : 0)); // the tabs stay full size while the strip is leaving
    },
    onScroll(y) {
      scrollY = y;
      layoutChrome();
    },
  });

  // Keyboard users must never land on a control that is translated off screen.
  [header, bottomNav].forEach((bar) => bar.addEventListener("focusin", scrollMotion.reveal));

  requestAnimationFrame(measureChrome); // needs layout, so wait until mounted
  window.addEventListener("resize", measureChrome);

  // V2 changes how the category tabs look once scrolled (sections.css); V3 is V1 with
  // glass surfaces on the header, tabs and bottom nav (chrome.css); V4 is V1 with a
  // bottom nav that shrinks in place instead of hiding; V5 has the new top nav, whose
  // selected tab is a folder-tab shape, and on scroll keeps only the titles, as V2 does.
  // New inventories V1 (inventories.css) puts a strip for events above the whole app;
  // V2 runs a ticker tape under the header instead, which then sticks at the top.
  stage.append(VariantSwitch({ onChange: setVariant }));

  // Refresh replays the current version from its start: back at the top and, for the
  // Top Strip, waiting again before it comes down.
  const refresh = el(`
    <button class="refresh-button" type="button" aria-label="Refresh preview">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 2.5v2.75h-2.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>Refresh</span>
    </button>
  `);
  refresh.addEventListener("click", () => {
    page.scrollTop = 0;
    setVariant(screen.dataset.variant);
    animate(refresh.querySelector("svg"), { rotate: [0, 360] }, transition("refreshSpin"));
  });
  stage.append(refresh);

  revealOnScroll(page);
  enablePressFeedback(screen);
  enableDragScroll(page);
  return stage;
}

/** Sections below the fold ease up into place the first time they scroll into view. */
function revealOnScroll(page) {
  if (reducedMotion.matches) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animate(entry.target, { opacity: 1, y: 0 }, transition("reveal"));
      });
    },
    { root: page, rootMargin: "0px 0px -8% 0px" },
  );

  // Wait a frame so layout exists; anything already on screen is left alone.
  requestAnimationFrame(() => {
    const fold = page.getBoundingClientRect().bottom;
    page.querySelectorAll(":scope > section").forEach((section) => {
      if (section.getBoundingClientRect().top < fold) return;
      animate(section, { opacity: 0.35, y: 16 }, { duration: 0 });
      observer.observe(section);
    });
  });
}
