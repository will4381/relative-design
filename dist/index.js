// Runtime for precompiled icons: no geometry at runtime, just string assembly.
// Each icon module is { name, category, line, fill } where line/fill are the SVG's inner markup
// with "__ID__" standing in for the per-instance mask id.
import { css } from "./css.js";

export { css };

const STYLE_ID = "relative-icons-css";
let injected = false;

// Adds the animation stylesheet to the page once (no-op on the server or if already present).
export function injectCss() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = css;
  document.head.appendChild(el);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function className(trigger = "hover", extra) {
  return `ic${trigger !== "none" ? ` ic-${trigger}` : ""}${extra ? ` ${extra}` : ""}`;
}

export function inner(icon, variant = "line", id, title) {
  return (title ? `<title>${esc(title)}</title>` : "") + icon[variant].replaceAll("__ID__", id);
}

let n = 0;
export function toSvg(icon, { variant = "line", size = 24, stroke, trigger = "hover", title, color, className: extra } = {}) {
  injectCss();
  const id = `ri${(++n).toString(36)}`;
  const style = [stroke != null && `--ic-stroke:${stroke}px`, color && `color:${esc(color)}`].filter(Boolean).join(";");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="${className(trigger, extra && esc(extra))}" width="${size}" height="${size}" ` +
    `viewBox="0 0 24 24" fill="none" overflow="visible"${style ? ` style="${style}"` : ""}` +
    `${title ? ` role="img" aria-label="${esc(title)}"` : ` aria-hidden="true"`}>${inner(icon, variant, id, title)}</svg>`
  );
}
