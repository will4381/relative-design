import { createElement } from "react";
import { createIcon } from "./create.js";
import { icons } from "../all.js";

const cache = new Map();
// Renders an icon by name. Imports every icon: prefer the named components when the name is static.
export function DynamicIcon({ name, ...props }) {
  let C = cache.get(name);
  if (!C) {
    if (!icons[name]) return null;
    cache.set(name, (C = createIcon(icons[name])));
  }
  return createElement(C, props);
}
