# Relative Design

The Relative design system: **550+ animated, rounded icons** (line + fill, adjustable stroke) and the
**Relative typefaces** (Relative Grotesque, Relative Serif). Zero runtime dependencies.

```bash
npm install github:will4381/relative-design      # or pnpm / bun / yarn add github:will4381/relative-design
```

Browse everything (and copy SVG/JSX) in `dist/gallery.html`.

## Icons in React

```tsx
import { Bell, ArrowRight, Send } from "@relative/design/react";

<Bell />
<Bell variant="fill" size={20} stroke={1.5} />
<Send trigger="loop" color="#3451d1" title="Send message" />
<button className="ic-trigger"><ArrowRight /> Next</button>   {/* animates when the button is hovered */}
```

Every icon is also exported with an `Icon` suffix (`BellIcon`), handy where a name would shadow a global
(`Map`, `Function`, `Image`).

| Prop | Default | |
|---|---|---|
| `variant` | `"line"` | `"line"` or `"fill"` |
| `size` | `24` | px or any CSS length |
| `stroke` | `2` | stroke width on the 24 grid (1–3 looks good) |
| `trigger` | `"hover"` | `"hover"`, `"loop"`, `"play"` (once on mount), `"none"` |
| `title` | none | accessible label; without it the icon is `aria-hidden` |
| `color` | `currentColor` | any CSS color |

All other SVG props (`className`, `style`, `onClick`, `ref`…) pass through.

Name only known at runtime? `import { DynamicIcon } from "@relative/design/react/dynamic"` then
`<DynamicIcon name={iconName} />`. This pulls in every icon, so prefer named imports.

## Icons anywhere else

```js
import { toSvg } from "@relative/design";
import { bellIcon } from "@relative/design/icons";        // or: import bell from "@relative/design/icons/bell"

el.innerHTML = toSvg(bellIcon, { variant: "fill", size: 20, trigger: "loop" });
```

Plain files: `@relative/design/svg/line/bell.svg`, `@relative/design/svg/fill/bell.svg`.

## Performance

- **Precompiled.** Each icon ships as a tiny module holding its finished line and fill markup. Rendering is
  string insertion, with no path math or parsing at runtime.
- **Tree-shakable.** One module per icon, `sideEffects: false`, `/*#__PURE__*/` components. You ship only
  what you import.
- **CSS-only motion.** Animations are pure CSS keyframes (GPU transforms and opacity), played on hover by
  default and disabled under `prefers-reduced-motion`. The stylesheet (~5 KB) is injected once in the
  browser. For SSR without a flash, import it yourself: `import "@relative/design/icons.css"`.

## Theming with CSS

```css
.toolbar { --ic-stroke: 1.5px; }          /* stroke width for every icon inside */
.ic { --ic-dur: .6s; --ic-ease: ease-out; } /* animation speed and easing */
.ic-loop { --ic-iter: 3; }                  /* repeat count */
```

## Fonts

From CSS (Vite, Next, Tailwind, PostCSS, esbuild all resolve it):
```css
@import "@relative/design/fonts.css";            /* both families */
@import "@relative/design/fonts/grotesque.css";  /* or just one */
@import "@relative/design/fonts/serif.css";

body { font-family: var(--font-relative-grotesque); }   /* variable, 100–900, + italic */
h1   { font-family: var(--font-relative-serif); }       /* 300, 400, 500, 600, 700 */
```
From JS: `import "@relative/design/fonts.css";`

Tailwind v4:
```css
@import "tailwindcss";
@import "@relative/design/fonts.css";
@theme {
  --font-sans: var(--font-relative-grotesque);
  --font-serif: var(--font-relative-serif);
}
```

Next.js with `next/font/local`: point `src` at
`node_modules/@relative/design/fonts/relative-grotesque/RelativeGrotesque-Variable.woff2`.
Desktop `.ttf` files sit next to the `.woff2`s. Both families are derived from SIL OFL 1.1 fonts
(Inter Tight and Sorts Mill Goudy). Their licenses and build scripts are in `fonts/*/`.

## Working on the icons

Icons are authored in `src/icons/<category>.js` with the engine in `src/core.js`. Read `STYLE.md` first.

```bash
npm run build                                  # → dist/
npm test                                       # build + render every icon through the public API
npm run sheet -- out.png src/icons/fun.js      # contact sheet: line + fill at 3 stroke widths
npm run film -- out.png src/icons/fun.js       # animation filmstrips, frame by frame
```

`dist/` is committed so git installs work without a build step. Rebuild and commit it with your changes.
