// Generates soft-colour placeholder photos for every chapter so the site can be built
// before the real photos exist. Real photos (npm run photos) replace them month by month.
import sharp from 'sharp';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const OUT = new URL('../src/photos/', import.meta.url);
const plan = {
  '2027-02': [14, 14, 15, 21],
  '2027-03': [23, 23, 29],
  '2027-04': [4, 12, 25],
  '2027-05': [2, 9, 17, 30],
  '2027-06': [6, 14, 21, 28],
  '2027-07': [3, 11, 26],
  '2027-07-colours': [15, 16, 16, 17, 18],
  '2027-08-spain': [21, 22, 23, 25, 26, 27, 28, 29, 31, '09-01', '09-02', '09-03', '09-04', '09-05'],
  '2027-09': [5, 13, 27],
  '2027-10': [1, 4, 4, 18],
};
const palettes = [
  ['#3b2c5e', '#c4577a', '#f39a6b'],
  ['#a9d8ee', '#e6f3f7', '#2f8fa6'],
  ['#0e1630', '#2a2148', '#ffb871'],
  ['#dde8cf', '#a9c79f', '#2b4532'],
  ['#9a6a46', '#e3d3bf', '#5e3a26'],
  ['#f6d9d4', '#d9a7a7', '#b4223b'],
  ['#2b2d5c', '#8b5a8c', '#f3c38f'],
];
const MONTHS = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const svg = (seed, label) => {
  const [a, b, c] = palettes[seed % palettes.length];
  const rnd = (n) => ((Math.sin(seed * 999 + n * 77) + 1) / 2);
  const blobs = Array.from({ length: 5 }, (_, i) =>
    `<circle cx="${(rnd(i) * 1200).toFixed(0)}" cy="${(rnd(i + 9) * 1500).toFixed(0)}" r="${(120 + rnd(i + 3) * 260).toFixed(0)}" fill="${[a, b, c][i % 3]}" opacity=".55"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="60"/></filter></defs>
    <rect width="1200" height="1500" fill="url(#g)"/><g filter="url(#blur)">${blobs}</g>
    <text x="600" y="790" text-anchor="middle" font-family="Georgia, serif" font-size="150" fill="#fff" opacity=".55">${label}</text>
  </svg>`;
};

const metaPath = new URL('meta.json', OUT);
const meta = existsSync(metaPath) ? JSON.parse(await readFile(metaPath, 'utf8')) : {};
let seed = 0;
for (const [month, days] of Object.entries(plan)) {
  const dir = new URL(`${month}/`, OUT);
  await mkdir(dir, { recursive: true });
  const existing = (await readdir(dir)).filter((f) => !f.startsWith('.'));
  if (existing.some((f) => !f.startsWith('placeholder-'))) { console.log(`skip ${month} (has real photos)`); continue; }
  for (const [i, day] of days.entries()) {
    const file = `placeholder-${String(i + 1).padStart(2, '0')}.jpg`;
    const tag = { '2027-07-colours': 'OSTRAVA', '2027-08-spain': 'SPAIN' }[month] ?? MONTHS[Number(month.slice(5, 7))];
    const label = `${tag} · ${i + 1}`;
    await sharp(Buffer.from(svg(seed++, label))).jpeg({ quality: 80 }).toFile(new URL(file, dir).pathname);
    const md = typeof day === 'string' ? day : `${month.slice(5, 7)}-${String(day).padStart(2, '0')}`;
    meta[`${month}/${file}`] = `${month.slice(0, 4)}-${md}`;
  }
  console.log(`${month}: ${days.length} placeholders`);
}
await writeFile(metaPath, JSON.stringify(Object.fromEntries(Object.entries(meta).sort()), null, 2) + '\n');
