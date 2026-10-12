// lottie-web is vendored as a classic script that exposes `window.lottie`. It is only
// needed by the Smart Icon, so it is added the first time something asks for it rather
// than with the page, which also keeps it independent of the copy of index.html in use.
let player = null;

/** Resolves with the Lottie player, loading it on first use. */
export function loadLottie() {
  player ??= new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement("script"), { src: "src/vendor/lottie.js" });
    script.onload = () => resolve(window.lottie);
    script.onerror = reject;
    document.body.append(script);
  });
  return player;
}
