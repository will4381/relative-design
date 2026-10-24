// React bindings: createIcon(data) → a memoized, ref-forwarding <svg> component.
import { createElement, forwardRef, memo, useId, useInsertionEffect } from "react";
import { className, injectCss, inner } from "../index.js";

export function createIcon(icon, displayName) {
  const Icon = forwardRef(function RelativeIcon(
    { variant = "line", size = 24, stroke, trigger = "hover", title, color, className: extra, style, ...rest },
    ref,
  ) {
    const id = "ri" + useId().replace(/[^\w-]/g, "");
    useInsertionEffect(injectCss, []);
    return createElement("svg", {
      ref,
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      overflow: "visible",
      className: className(trigger, extra),
      style: stroke != null || color ? { ...(stroke != null && { "--ic-stroke": `${stroke}px` }), ...(color && { color }), ...style } : style,
      ...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true }),
      ...rest,
      dangerouslySetInnerHTML: { __html: inner(icon, variant, id, title) },
    });
  });
  Icon.displayName = displayName || icon.name;
  return memo(Icon);
}
