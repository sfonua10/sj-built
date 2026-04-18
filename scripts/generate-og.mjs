import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "..", "public", "og.png");

const ink = "#0a0a0a";
const amber = "#f59e0b";
const paper = "#f5f1e8";
const fontStack = "Impact, 'Arial Black', 'Helvetica Neue', sans-serif";

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${ink}"/>
  <rect x="0" y="612" width="1200" height="18" fill="${amber}"/>
  <g transform="translate(90 170)">
    <rect x="11.25" y="11.25" width="277.5" height="202.5" fill="none" stroke="${amber}" stroke-width="18.75"/>
    <text x="150" y="112.5" text-anchor="middle" dominant-baseline="central" font-family="${fontStack}" font-size="120" fill="${amber}" letter-spacing="1.875">S&amp;J</text>
  </g>
  <text x="460" y="345" font-family="${fontStack}" font-size="150" fill="${paper}" letter-spacing="6">S&amp;J BUILT</text>
  <text x="460" y="410" font-family="${fontStack}" font-size="44" fill="${paper}" fill-opacity="0.78" letter-spacing="1">Ops for pickup outfitting</text>
  <text x="1110" y="585" text-anchor="end" font-family="${fontStack}" font-size="22" fill="${amber}" letter-spacing="5">ADMIN  ·  CUSTOMER  ·  CONTRACTOR</text>
</svg>`;

const resvg = new Resvg(svg, {
	background: ink,
	font: {
		loadSystemFonts: true,
		defaultFontFamily: "Impact",
	},
});

const pngData = resvg.render();
const pngBuffer = pngData.asPng();

await writeFile(outputPath, pngBuffer);
console.log(
	`wrote ${outputPath} (${pngData.width}x${pngData.height}, ${pngBuffer.length} bytes)`,
);
