// node build.cjs  →  dist/ (the SDK) + preview.html
//
//   dist/index.js          toSvg(), injectCss(), css        (framework-agnostic runtime)
//   dist/icons/<name>.js   one precompiled icon per module  (tree-shakable)
//   dist/icons/index.js    named exports: bellIcon, arrowUpIcon, …
//   dist/all.js            { icons, names } for dynamic lookup (pulls in every icon)
//   dist/react/index.js    <Bell/>, <ArrowUp/> … (+ *Icon aliases), createIcon
//   dist/react/dynamic.js  <DynamicIcon name="bell"/>
//   dist/icons.css         animation stylesheet (also auto-injected at runtime)
//   dist/svg/{line,fill}/  standalone .svg files
//   dist/engine.js         the authoring engine + all icons as one <script> (global `Icons`)
//   dist/gallery.html      self-contained browser for the whole set
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const dist = path.join(root, "dist");
const iconDir = path.join(root, "src/icons");
const files = fs.readdirSync(iconDir).filter((f) => f.endsWith(".js") && !f.startsWith("_")).sort();

// each category file gets its own scope so helper consts can't collide
const engine = [fs.readFileSync(path.join(root, "src/core.js"), "utf8"),
  ...files.map((f) => `;(function () {\n${fs.readFileSync(path.join(iconDir, f), "utf8")}\n})();`)].join("\n");

fs.rmSync(dist, { recursive: true, force: true });
for (const d of ["icons", "react", "svg/line", "svg/fill"]) fs.mkdirSync(path.join(dist, d), { recursive: true });
const write = (p, s) => fs.writeFileSync(path.join(dist, p), s);

write("engine.js", engine);
vm.runInThisContext(engine, { filename: "engine.js" });
const Icons = globalThis.Icons;
const names = Icons.names;

const camel = (n) => n.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const local = (n) => `i_${camel(n)}`; // internal binding; icon names like "delete" are reserved words
const pascal = (n) => camel(n)[0].toUpperCase() + camel(n).slice(1);
const seen = new Set();
for (const n of names) {
  for (const id of [pascal(n), `${camel(n)}Icon`]) {
    if (seen.has(id)) throw new Error(`export name collision: ${id}`);
    seen.add(id);
  }
}

// --- precompiled icon modules --------------------------------------------------------------
const innerOf = (n, variant) => {
  const s = Icons.svg(n, { variant, id: "__ID__", css: false, trigger: "hover" });
  return s.slice(s.indexOf(">") + 1, s.lastIndexOf("</svg>"));
};
for (const n of names) {
  const data = { name: n, category: Icons.ICONS[n].category, line: innerOf(n, "line"), fill: innerOf(n, "fill") };
  write(`icons/${n}.js`, `export default ${JSON.stringify(data)};\n`);
}
write("icons/index.js", names.map((n) => `export { default as ${camel(n)}Icon } from "./${n}.js";`).join("\n") + "\n");
write("all.js", names.map((n) => `import ${local(n)} from "./icons/${n}.js";`).join("\n") +
  `\nexport const icons = {\n${names.map((n) => `  ${JSON.stringify(n)}: ${local(n)},`).join("\n")}\n};\nexport const names = Object.keys(icons);\n`);

// --- runtime + css ------------------------------------------------------------------------
const css = Icons.css();
write("icons.css", css + "\n");
write("css.js", `export const css = ${JSON.stringify(css)};\n`);
fs.copyFileSync(path.join(root, "src/runtime.js"), path.join(dist, "index.js"));

// --- react --------------------------------------------------------------------------------
fs.copyFileSync(path.join(root, "src/react.js"), path.join(dist, "react/create.js"));
write("react/index.js", `import { createIcon } from "./create.js";\n` +
  names.map((n) => `import ${local(n)} from "../icons/${n}.js";`).join("\n") + "\n" +
  names.map((n) => `export const ${pascal(n)} = /*#__PURE__*/ createIcon(${local(n)}, "${pascal(n)}");`).join("\n") + "\n" +
  `export {\n${names.map((n) => `  ${pascal(n)} as ${pascal(n)}Icon,`).join("\n")}\n};\nexport { createIcon };\n`);
write("react/dynamic.js", `import { createElement } from "react";
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
`);

// --- types --------------------------------------------------------------------------------
const nameUnion = names.map((n) => `  | ${JSON.stringify(n)}`).join("\n");
write("index.d.ts", `export type IconName =\n${nameUnion};
export type IconVariant = "line" | "fill";
/** "hover": play on hover · "loop": play forever · "play": play once on mount · "none": still */
export type IconTrigger = "hover" | "loop" | "play" | "none";
export interface IconData {
  readonly name: IconName;
  readonly category: string;
  readonly line: string;
  readonly fill: string;
}
export interface SvgOptions {
  variant?: IconVariant;
  /** px or any CSS length. Default 24 */
  size?: number | string;
  /** Stroke width on the 24 grid. Default 2 */
  stroke?: number;
  trigger?: IconTrigger;
  /** Accessible label. Without it the icon is aria-hidden */
  title?: string;
  color?: string;
  className?: string;
}
export declare function toSvg(icon: IconData, options?: SvgOptions): string;
/** The animation stylesheet. Injected automatically in the browser; import "@relative/design/icons.css" for SSR. */
export declare const css: string;
export declare function injectCss(): void;
export declare function className(trigger?: IconTrigger, extra?: string): string;
export declare function inner(icon: IconData, variant: IconVariant, id: string, title?: string): string;
`);
write("icons/icon.d.ts", `import type { IconData } from "../index.js";\ndeclare const icon: IconData;\nexport default icon;\n`);
write("icons/index.d.ts", `import type { IconData } from "../index.js";\n` + names.map((n) => `export declare const ${camel(n)}Icon: IconData;`).join("\n") + "\n");
write("all.d.ts", `import type { IconData, IconName } from "./index.js";\nexport declare const icons: Record<IconName, IconData>;\nexport declare const names: IconName[];\n`);
write("react/index.d.ts", `import type { ForwardRefExoticComponent, RefAttributes, SVGProps, MemoExoticComponent } from "react";
import type { IconData, IconTrigger, IconVariant } from "../index.js";
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "stroke" | "ref" | "color"> {
  variant?: IconVariant;
  /** px or any CSS length. Default 24 */
  size?: number | string;
  /** Stroke width on the 24 grid. Default 2 */
  stroke?: number;
  trigger?: IconTrigger;
  /** Accessible label. Without it the icon is aria-hidden */
  title?: string;
  color?: string;
}
export type IconComponent = MemoExoticComponent<ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>>;
export declare function createIcon(icon: IconData, displayName?: string): IconComponent;
${names.map((n) => `export declare const ${pascal(n)}: IconComponent;\nexport declare const ${pascal(n)}Icon: IconComponent;`).join("\n")}
`);
write("react/dynamic.d.ts", `import type { IconName } from "../index.js";\nimport type { IconProps } from "./index.js";\nexport declare function DynamicIcon(props: IconProps & { name: IconName }): JSX.Element | null;\n`);

// --- static svgs --------------------------------------------------------------------------
for (const variant of ["line", "fill"])
  for (const n of names) write(`svg/${variant}/${n}.svg`, Icons.svg(n, { variant, id: `ic-${n}-${variant}` }) + "\n");

// --- gallery ------------------------------------------------------------------------------
const gallery = fs.readFileSync(path.join(root, "src/gallery.html"), "utf8")
  .replace("<!-- ICONS -->", () => `<script>\n${engine.replace(/<\/script/g, "<\\/script")}\n</script>`);
write("gallery.html", gallery);
fs.writeFileSync(path.join(root, "preview.html"),
  `<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${gallery}`);

console.log(`${names.length} icons from ${files.length} categories → dist/`);
