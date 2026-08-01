import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "public/favicon.svg");
const targets = [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/apple-touch-icon.png", 180],
  ["public/favicon-32x32.png", 32],
  ["public/favicon-16x16.png", 16]
];

for (const [relativePath, size] of targets) {
  await sharp(source).resize(size, size).png({ compressionLevel: 9 }).toFile(resolve(root, relativePath));
}

const png = await readFile(resolve(root, "public/favicon-32x32.png"));
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(resolve(root, "app/favicon.ico"), Buffer.concat([header, png]));

console.log("Generated BD2US favicon and install icons from public/favicon.svg.");
