// node tools/sheet.cjs <out.png> <src/icons/file.js ...>
// Renders a contact sheet: each cell = line + fill at stroke 2 (large), plus a 24px row at strokes 1.5/2/2.5.
// macOS only (qlmanage + python3 Pillow).
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const [out, ...files] = process.argv.slice(2);
// run the engine and category files as plain scripts (same scoping as the build)
const vm = require("vm");
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../src/core.js"), "utf8"));
for (const f of files) vm.runInThisContext(`;(function () {\n${fs.readFileSync(path.resolve(f), "utf8")}\n})();`, { filename: f });
const Icons = globalThis.Icons;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "icsheet-"));
const names = Icons.names;
const jobs = [];
names.forEach((n, i) => {
  for (const [tag, variant, stroke] of [["L", "line", 2], ["F", "fill", 2], ["l15", "line", 1.5], ["f25", "fill", 2.5]]) {
    const file = path.join(tmp, `${String(i).padStart(4, "0")}-${tag}.svg`);
    fs.writeFileSync(file, Icons.svg(n, { variant, stroke, size: 240, trigger: "none" }).replace("currentColor", "#1c1917"));
    jobs.push(file);
  }
});
for (let i = 0; i < jobs.length; i += 200) execFileSync("qlmanage", ["-t", "-s", "256", "-o", tmp, ...jobs.slice(i, i + 200)], { stdio: "ignore" });

const py = `
import sys, json, os
from PIL import Image, ImageDraw
tmp, out, names = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
C, W, H, cols = 112, 112*2+16, 112+64, 6
rows = (len(names)+cols-1)//cols
sheet = Image.new('RGB', (cols*W, rows*H), 'white'); d = ImageDraw.Draw(sheet)
def load(i, tag, s):
    im = Image.open(os.path.join(tmp, f'{i:04d}-{tag}.svg.png')).convert('RGBA').resize((s, s), Image.LANCZOS)
    bg = Image.new('RGBA', im.size, 'white'); bg.alpha_composite(im); return bg.convert('RGB')
for i, n in enumerate(names):
    x, y = (i % cols)*W, (i//cols)*H
    sheet.paste(load(i, 'L', C), (x+4, y+4)); sheet.paste(load(i, 'F', C), (x+C+12, y+4))
    for j, tag in enumerate(['l15', 'L', 'F', 'f25']):
        sheet.paste(load(i, tag, 24), (x+8+j*32, y+C+8))
    d.text((x+8, y+C+38), n, fill='#666')
    d.rectangle([x, y, x+W-1, y+H-1], outline='#eee')
sheet.save(out)
`;
execFileSync("python3", ["-I", "-c", py, tmp, path.resolve(out), JSON.stringify(names)], { stdio: "inherit" });
fs.rmSync(tmp, { recursive: true });
console.log(`${names.length} icons → ${out}`);
