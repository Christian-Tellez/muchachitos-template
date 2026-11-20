// Prepares your real photos for the site.
//
//   1. Put the originals in photos-raw/<chapter id>/  (e.g. photos-raw/2027-02/IMG_1234.HEIC,
//      photos-raw/2027-08-spain/…). The folder name is the chapter id in src/data/story.ts.
//   2. npm run photos
//      (npm run photos -- --shift-years=1 moves every date, and the years in file names, one year
//      later: handy for a public demo made with real photos)
//
// For every month folder in photos-raw it:
//   - numbers the photos: files without a number get one ("01-IMG_1234.HEIC"), in the order they
//     were taken, after the ones already numbered. To change the order, change those numbers in
//     Finder and run it again. The site shows the photos in this order.
//   - converts HEIC to JPEG (macOS `sips`), fixes rotation, resizes to max 2400px
//   - strips ALL metadata, GPS location included
//   - writes src/photos/<YYYY-MM>/<NN>-<name>.jpg, replacing whatever was there (placeholders included)
//   - stores the capture date and time ("2027-01-31T19:42") in src/photos/meta.json for the orange
//     date stamp and the handwritten times of the first date
//   - removes the remaining placeholder photos everywhere: once real photos arrive, a chapter
//     without photos is hidden instead of showing placeholders
// Videos (.mp4/.mov/.m4v) in a chapter folder go to src/videos/<chapter>/ (the first one by name is
// shown big, e.g. the camcorder in Colours of Ostrava): H.264 MP4s are copied as they are, anything
// else (iPhone HEVC .mov) is converted with macOS `avconvert`; metadata boxes are blanked and a
// poster frame is saved next to it as <name>.jpg.
// photos-raw/ is git-ignored: originals never leave your Mac.
import sharp from 'sharp';
import exifr from 'exifr';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RAW = join(ROOT, 'photos-raw');
const OUT = join(ROOT, 'src', 'photos');
const META = join(OUT, 'meta.json');
const IMAGE = /\.(jpe?g|png|webp|heic|heif)$/i;
const VIDEO = /\.(mp4|mov|m4v)$/i;
const VIDEOS = join(ROOT, 'src', 'videos');

const meta = existsSync(META) ? JSON.parse(await readFile(META, 'utf8')) : {};
const months = (existsSync(RAW) ? await readdir(RAW, { withFileTypes: true }) : [])
  .filter((d) => d.isDirectory() && /^\d{4}-\d{2}(-[a-z0-9-]+)?$/.test(d.name))
  .map((d) => d.name)
  .sort();

if (months.length === 0) {
  console.log('No chapter folders in photos-raw/. Create e.g. photos-raw/2027-02/ and drop photos in it.');
  process.exit(0);
}

const tmp = await mkdtemp(join(tmpdir(), 'muchachitos-'));
const SHIFT = Number(process.argv.find((a) => a.startsWith('--shift-years='))?.split('=')[1] ?? 0);
// moves the year (2026 → 2027 with --shift-years=1) in a date or a file name: only the first one,
// so the digits of the time in names like img20260207212921 stay as they are
const shiftYears = (text) => (SHIFT ? text.replace(/20\d{2}/, (y) => String(Number(y) + SHIFT)) : text);
const slug = (name) => shiftYears(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
const pad = (n) => String(n).padStart(2, '0');
// local date, not UTC: a photo taken at 00:30 should keep its own day
const iso = (d) => (d instanceof Date && !isNaN(d) ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : undefined);

// our own order prefix: "01-", "02-"… (1–3 digits + hyphen, so camera names like 20260214_… don't count)
const ORDER = /^(\d{1,3})-/;
const orderOf = (file) => Number(ORDER.exec(file)?.[1] ?? Infinity);
const byDateThenName = (a, b) =>
  (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.file.localeCompare(b.file, undefined, { numeric: true });

// photos sent through WhatsApp or edited lose their EXIF, but names like IMG-20260228-215650 keep it
const FROM_NAME = /(20\d{2})(\d{2})(\d{2})[-_ ]?(\d{2})(\d{2})/;

async function captureDate(path) {
  try {
    // read the file ourselves: exifr's own file reader leaves handles open, which Node 26 rejects
    const exif = await exifr.parse(await readFile(path), ['DateTimeOriginal', 'CreateDate']);
    const d = exif?.DateTimeOriginal ?? exif?.CreateDate;
    const day = iso(d);
    if (day) return `${day}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { /* no EXIF */ }
  const m = FROM_NAME.exec(parse(path).name);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}` : undefined;
}

for (const month of months) {
  const dir = join(RAW, month);
  const files = (await readdir(dir)).filter((f) => IMAGE.test(f));
  if (files.length === 0) { console.log(`${month}: no photos`); continue; }
  const items = await Promise.all(
    files.map(async (file) => {
      const date = await captureDate(join(dir, file));
      return { file, date: date && shiftYears(date) };
    }),
  );

  // number the new photos (no prefix yet) by date, after the highest number already used
  const fresh = items.filter((i) => !ORDER.test(i.file)).sort(byDateThenName);
  let next = Math.max(0, ...items.filter((i) => ORDER.test(i.file)).map((i) => orderOf(i.file))) + 1;
  for (const item of fresh) {
    const renamed = `${pad(next++)}-${item.file}`;
    await rename(join(dir, item.file), join(dir, renamed));
    item.file = renamed;
  }
  if (fresh.length) console.log(`${month}: numbered ${fresh.length} new photo(s) in photos-raw`);
  items.sort((a, b) => orderOf(a.file) - orderOf(b.file) || a.file.localeCompare(b.file, undefined, { numeric: true }));

  const outDir = join(OUT, month);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const key of Object.keys(meta)) if (key.startsWith(`${month}/`)) delete meta[key];

  // output numbers are positions (01, 02…), so gaps or repeated numbers in photos-raw don't matter
  for (const [i, { file, date }] of items.entries()) {
    let src = join(dir, file);
    if (/\.hei[cf]$/i.test(file)) {
      const jpg = join(tmp, `${parse(file).name}.jpg`);
      execFileSync('sips', ['-s', 'format', 'jpeg', src, '--out', jpg], { stdio: 'ignore' });
      src = jpg;
    }

    const key = slug(parse(file).name.replace(ORDER, ''));
    const name = `${pad(i + 1)}-${key}.jpg`;
    await sharp(src)
      .rotate()
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(join(outDir, name));
    if (date) meta[`${month}/${name}`] = date;
    console.log(`  ${name.padEnd(28)} ${date?.replace('T', ' ') ?? 'no date'}   caption key: ${key}`);
  }
}

// ---------- videos ----------
// Blank every metadata box (udta / meta: encoder tags, location, device) by renaming it to "free"
// and zeroing it. Sizes don't change, so the media offsets stay valid without re-encoding.
function blankMetadata(buf) {
  const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'dinf']);
  let blanked = 0;
  const walk = (start, end) => {
    let o = start;
    while (o + 8 <= end) {
      let size = buf.readUInt32BE(o);
      const type = buf.toString('latin1', o + 4, o + 8);
      if (size === 1) size = Number(buf.readBigUInt64BE(o + 8));
      if (size === 0) size = end - o;
      if (size < 8) break;
      if (type === 'udta' || type === 'meta') {
        buf.write('free', o + 4, 'latin1');
        buf.fill(0, o + 8, o + size);
        blanked++;
      } else if (CONTAINERS.has(type)) {
        walk(o + 8, o + size);
      }
      o += size;
    }
  };
  walk(0, buf.length);
  return blanked;
}

for (const month of months) {
  const dir = join(RAW, month);
  const videos = (await readdir(dir)).filter((f) => VIDEO.test(f)).sort();
  if (videos.length === 0) continue;
  const outDir = join(VIDEOS, month);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const file of videos) {
    const src = join(dir, file);
    const name = slug(parse(file).name);
    const out = join(outDir, `${name}.mp4`);
    let codecs = '';
    try { codecs = execFileSync('mdls', ['-raw', '-name', 'kMDItemCodecs', src], { encoding: 'utf8' }); } catch {}
    // small H.264 MP4s (WhatsApp) are copied as they are; camera originals are too heavy for a phone
    // (and Cloudflare Pages refuses files over 25 MB), so they're re-encoded to 540×960, plenty for the viewfinder
    const raw = await readFile(src);
    if (/\.mp4$/i.test(file) && /H\.264/.test(codecs) && raw.length <= 8 * 1024 * 1024) {
      await writeFile(out, raw);
    } else {
      execFileSync('avconvert', ['--source', src, '--preset', 'Preset960x540', '--output', out, '--replace'], { stdio: 'ignore' });
    }
    const buf = await readFile(out);
    const blanked = blankMetadata(buf);
    await writeFile(out, buf);

    // poster: a frame from macOS Quick Look, as a small JPEG
    execFileSync('qlmanage', ['-t', '-s', '1000', '-o', tmp, out], { stdio: 'ignore' });
    await sharp(join(tmp, `${name}.mp4.png`)).jpeg({ quality: 82, mozjpeg: true }).toFile(join(outDir, `${name}.jpg`));
    const kb = Math.round(buf.length / 1024);
    console.log(`${month}: video ${name}.mp4 (${kb} KB, ${blanked} metadata box(es) blanked) + poster`);
  }
}

// drop leftover placeholders
for (const dir of await readdir(OUT, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const file of await readdir(join(OUT, dir.name))) {
    if (!file.startsWith('placeholder-')) continue;
    await rm(join(OUT, dir.name, file));
    delete meta[`${dir.name}/${file}`];
  }
}

await rm(tmp, { recursive: true, force: true });
await writeFile(META, JSON.stringify(Object.fromEntries(Object.entries(meta).sort()), null, 2) + '\n');
console.log('\nDone. Captions go in src/data/story.ts under captions, using the "caption key" above.');
