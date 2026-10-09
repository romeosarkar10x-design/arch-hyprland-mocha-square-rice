// pnpm test — invariants the wallpaper themes must hold whatever the image.
import assert from "node:assert/strict";
import { test } from "node:test";
import { contrast, deltaE, hexToRgb, rgbToLab } from "./color.ts";
import { ACCENTS, MOCHA, NEUTRALS, paletteFromPixels } from "./palette.ts";

/** Synthetic image: [r, g, b, pixel count] blocks with a little noise. */
function image(blocks: [number, number, number, number][]): number[] {
  const px: number[] = [];
  for (const [r, g, b, n] of blocks) for (let i = 0; i < n; i++) px.push(r + ((i * 7) % 9) - 4, g + ((i * 3) % 7) - 3, b + ((i * 5) % 9) - 4, 255);
  return px;
}

const IMAGES = {
  synthwave: image([[26, 11, 46, 5000], [255, 79, 139, 1500], [255, 209, 102, 800], [45, 226, 230, 600], [91, 26, 94, 2000]]),
  forest: image([[20, 40, 22, 6000], [60, 110, 50, 2500], [200, 160, 60, 500], [140, 180, 200, 1000]]),
  desert: image([[242, 166, 90, 5000], [217, 119, 59, 3000], [140, 59, 43, 2000], [246, 214, 168, 3000]]),
  neonRed: image([[10, 5, 5, 6000], [240, 30, 40, 4000]]),
  greyscale: image([[30, 30, 30, 5000], [200, 200, 200, 3000]]),
  white: image([[250, 250, 250, 9000]]),
};
const lab = (hex: string) => rgbToLab(hexToRgb(hex));

for (const [name, px] of Object.entries(IMAGES)) {
  for (const vibrancy of ["muted", "balanced", "vivid"] as const) {
    test(`${name} / ${vibrancy}`, () => {
      const { palette: p } = paletteFromPixels(px, { vibrancy });
      for (const slot of ACCENTS) assert.ok(contrast(p[slot], p.base) >= 4.5, `${slot} ${p[slot]} on base ${p.base}`);
      assert.ok(contrast(p.text, p.base) >= 10, `text ${p.text} on base ${p.base}`);
      assert.ok(contrast(p.subtext0, p.base) >= 6, `subtext0 ${p.subtext0}`);
      // Neutrals keep Mocha's ladder: each step lighter than the last.
      const l = NEUTRALS.map((s) => lab(p[s])[0]);
      l.slice(1).forEach((v, i) => assert.ok(v > l[i]!, `${NEUTRALS[i + 1]} not lighter than ${NEUTRALS[i]}`));
      // Errors, warnings and ok states stay distinguishable from the primary accent.
      for (const slot of ["red", "yellow", "green"] as const) {
        assert.ok(deltaE(lab(p[slot]), lab(p.mauve)) >= 0.05, `${slot} ${p[slot]} vs mauve ${p.mauve}`);
      }
    });
  }
}

test("same image, same theme", () => {
  assert.deepEqual(paletteFromPixels(IMAGES.synthwave).palette, paletteFromPixels(IMAGES.synthwave).palette);
});

test("an image without colour falls back to a muted theme", () => {
  const t = paletteFromPixels(IMAGES.greyscale);
  assert.equal(t.monochrome, true);
  assert.notDeepEqual(t.palette, MOCHA);
});
