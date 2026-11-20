# Muchachitos

**A scroll-driven photo album for couples, month by month.** Polaroids, film strips, a festival camcorder, a boarding pass with passport stamps, and a birthday letter that slides out of an envelope while you scroll.

It started as a birthday gift for my girlfriend. This is the template version: same code, a fictional couple and a demo album.

**Live demo → [muchachitos-demo.pages.dev](https://muchachitos-demo.pages.dev)** (best on a phone)

- Static site: no backend and no database. Free hosting on Cloudflare Pages.
- Mobile-first. Desktop works too.
- Everything you'd want to change (names, dates, texts, chapters) lives in one file: [`src/data/story.ts`](src/data/story.ts).
- Photos are optimised at build time, and a script strips GPS and all other metadata before anything reaches git.

## What's inside

Each chapter of the album has a **layout**:

| Layout | What it looks like |
|---|---|
| `prologue` | The first chat messages, a "first date" ticket and photobooth strips that develop as you scroll, with handwritten times |
| `collage` | Taped polaroids with parallax, an optional handwritten note, comments (arrow, post-it or speech bubble) and a hidden message on the back of one photo |
| `night` | A night sky with stars and a moon; the first photo develops slowly and a clock shows how long you've been together |
| `film` | A pinned film strip that scrolls sideways |
| `festival` | A fabric wristband, a video in a camcorder viewfinder (REC, timecode, date stamp) and a swipeable photo strip |
| `trip` | A boarding pass, a dotted route with plane and car legs, a passport stamp per stop and the photos of each stop, split by the date they were taken |
| `finale` | A vinyl with "your song" and an envelope; the letter slides out line by line as you scroll |

Extras:
- A cassette with your Spotify playlist on the cover.
- A "6 months" milestone.
- Keys for the day you moved in together.
- Date surprises: confetti on both birthdays and a "happy N months" note every month.
- A fullscreen photo viewer.

All motion respects *reduce motion*.

## Quick start

You need Node 22.23+ (there's an `.nvmrc`) and macOS for the photo script, which uses `sips`, `avconvert` and Quick Look.

```bash
npm install
npm run dev            # http://localhost:4321, with placeholder photos
```

### Your photos

1. Create a folder per chapter in `photos-raw/` named like its `id` in `story.ts`, for example `photos-raw/2027-02/`. Drop the originals in it: HEIC, JPG, PNG or WebP, plus MP4/MOV videos. **`photos-raw/` is git-ignored.**
2. Run `npm run photos`. The script:
   - numbers the photos by capture date (rename `05-` to `00-` in Finder to reorder)
   - converts HEIC, fixes rotation and resizes to at most 2400 px
   - **strips all metadata, GPS included**
   - saves each photo's date and time for the orange date stamp
   - copies videos, blanks their metadata boxes, re-encodes large ones to 540×960 and makes a poster frame
3. Captions, comments and the secret message go in `story.ts`, keyed by photo number (`1` is the first photo):

   ```ts
   captions: { 2: "first swim" },
   comments: { 1: { text: "look at your face 😂", style: "postit" } },
   secrets:  { 3: "a message on the back of this polaroid" },
   ```

Chapters without photos are hidden automatically.

### Your story

Open [`src/data/story.ts`](src/data/story.ts) and change:
- names and both birthdays
- the important dates: first message, first date, official
- the playlist and your song
- the chapters with their layouts, notes and the letter

The touches in another language (`czech: { text, translation }`) can be in any language, or removed.

Set `private: true` for a real album. Search engines are then asked to stay out, through `robots.txt` and a `noindex` tag.

### Deploy

1. Push the repo to GitHub. Keep it **private** if it contains your real photos.
2. In Cloudflare Pages, create a project from the repo with the Astro preset: build command `npm run build`, output folder `dist`.
3. Set `site` in `astro.config.mjs` to your `*.pages.dev` URL, so link previews work.

Every push to `main` publishes the site again.

## How it's built

- **[Astro](https://astro.build)**, fully static. Images go through `astro:assets` (responsive WebP, lazy-loaded).
- **A small scroll engine with no animation library** ([`ScrollFx.astro`](src/components/ScrollFx.astro)). Elements declare what they react to (`data-speed`, `data-p`, `data-pin`, `data-pull`…) and get CSS custom properties updated in a single `requestAnimationFrame` loop. All the motion itself is CSS.
- **Spotify iFrame API** with prewarming: the player loads about a screen and a half before you reach it, and only one player plays at a time.
- **Video:** muted autoplay only while on screen, with a "tap for sound" button that pauses the music.
- **[PhotoSwipe](https://photoswipe.com)** for the fullscreen viewer.
- **Privacy:** originals never leave your machine. Only resized, metadata-free copies are committed.

## License

[PolyForm Noncommercial 1.0.0](LICENSE.md) © Christian Téllez Giraldo.

You're welcome to use it for your own album, as a gift, or to learn from it. You may not sell it, or sell albums made with it. Please keep the license and the copyright notice. If you'd like to use it commercially, get in touch.
