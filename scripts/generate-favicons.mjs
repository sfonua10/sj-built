import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");

const ink = "#0a0a0a";
const amber = "#f59e0b";
const fontStack = "Impact, 'Arial Black', 'Helvetica Neue', sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="8" ry="8" fill="${amber}"/>
  <text x="32" y="32" text-anchor="middle" dominant-baseline="central" font-family="${fontStack}" font-size="34" fill="${ink}" letter-spacing="0.5">S&amp;J</text>
</svg>`;

function renderPng(size) {
	const resvg = new Resvg(svg, {
		fitTo: { mode: "width", value: size },
		font: {
			loadSystemFonts: true,
			defaultFontFamily: "Impact",
		},
	});
	return resvg.render().asPng();
}

function buildIco(entries) {
	const count = entries.length;
	const headerSize = 6 + 16 * count;
	const totalSize =
		headerSize + entries.reduce((sum, e) => sum + e.buffer.length, 0);
	const buf = Buffer.alloc(totalSize);

	buf.writeUInt16LE(0, 0);
	buf.writeUInt16LE(1, 2);
	buf.writeUInt16LE(count, 4);

	let offset = headerSize;
	for (let i = 0; i < count; i++) {
		const { size, buffer } = entries[i];
		const entryOffset = 6 + 16 * i;
		buf.writeUInt8(size >= 256 ? 0 : size, entryOffset);
		buf.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);
		buf.writeUInt8(0, entryOffset + 2);
		buf.writeUInt8(0, entryOffset + 3);
		buf.writeUInt16LE(1, entryOffset + 4);
		buf.writeUInt16LE(32, entryOffset + 6);
		buf.writeUInt32LE(buffer.length, entryOffset + 8);
		buf.writeUInt32LE(offset, entryOffset + 12);
		buffer.copy(buf, offset);
		offset += buffer.length;
	}

	return buf;
}

const pngTargets = [
	{ size: 16, name: "favicon-16.png" },
	{ size: 32, name: "favicon-32.png" },
	{ size: 48, name: "favicon-48.png" },
	{ size: 180, name: "apple-touch-icon.png" },
	{ size: 192, name: "logo192.png" },
	{ size: 512, name: "logo512.png" },
];

const rendered = new Map();
for (const { size, name } of pngTargets) {
	const buffer = renderPng(size);
	await writeFile(resolve(publicDir, name), buffer);
	rendered.set(size, buffer);
	console.log(`wrote public/${name} (${size}x${size}, ${buffer.length} bytes)`);
}

await writeFile(resolve(publicDir, "favicon.svg"), svg);
console.log(`wrote public/favicon.svg (${svg.length} bytes)`);

const icoBuffer = buildIco([
	{ size: 16, buffer: rendered.get(16) },
	{ size: 32, buffer: rendered.get(32) },
	{ size: 48, buffer: rendered.get(48) },
]);
await writeFile(resolve(publicDir, "favicon.ico"), icoBuffer);
console.log(`wrote public/favicon.ico (16+32+48, ${icoBuffer.length} bytes)`);
