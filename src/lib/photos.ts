import type { ImageMetadata } from 'astro';
import { story, type Chapter, type CommentStyle } from '../data/story';
import meta from '../photos/meta.json';

export interface Photo {
  src: ImageMetadata;
  /** "<chapter id>/<file>" */
  key: string;
  /** file name without extension and without the "01-" order prefix, used for captions */
  name: string;
  /** position from the "01-" prefix (set by npm run photos) */
  order: number;
  /** capture date YYYY-MM-DD, if known */
  date?: string;
  /** capture time HH:MM, if known */
  time?: string;
  caption?: string;
  /** comment shown on the polaroid (story.ts → comments) */
  comment?: { text: string; style: CommentStyle; fixed: boolean };
  /** easter egg message on the back of the polaroid (story.ts → secrets) */
  secret?: string;
}

const files = import.meta.glob<{ default: ImageMetadata }>(
  '../photos/*/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);
const dates = meta as Record<string, string>;

const all: Photo[] = Object.entries(files).map(([path, mod]) => {
  const [folder, file] = path.split('/').slice(-2);
  return {
    src: mod.default,
    key: `${folder}/${file}`,
    name: file.replace(/\.\w+$/, '').replace(/^\d{1,3}-/, ''),
    order: Number(/^(\d{1,3})-/.exec(file)?.[1] ?? Infinity),
    // meta values are "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM"
    date: dates[`${folder}/${file}`]?.slice(0, 10),
    time: dates[`${folder}/${file}`]?.slice(11, 16) || undefined,
  };
});

// the "01-" prefix decides; photos without one (placeholders) go by date
const byOrder = (a: Photo, b: Photo) =>
  a.order - b.order ||
  (a.date ?? '').localeCompare(b.date ?? '') ||
  a.name.localeCompare(b.name, undefined, { numeric: true });

export function photosFor(chapter: Chapter): Photo[] {
  return all
    .filter((p) => p.key.startsWith(`${chapter.id}/`))
    .sort(byOrder)
    // captions/comments by position in the chapter ("1", "2"… as shown on the site) or by caption key
    .map((p, i) => {
      const pick = <T,>(map?: Record<string, T>) => map?.[String(i + 1)] ?? map?.[p.name];
      const c = pick(chapter.comments);
      const comment = c === undefined ? undefined
        : typeof c === 'string' ? { text: c, style: story.commentStyle, fixed: false }
        : { text: c.text, style: c.style ?? story.commentStyle, fixed: !!c.style };
      return { ...p, caption: pick(chapter.captions), comment, secret: pick(chapter.secrets) };
    });
}

/** "<chapter id>/<caption key>", e.g. "2027-04/img-1234" (the order prefix is optional) */
export function photoByRef(ref: string): Photo | undefined {
  const [folder, name] = [ref.slice(0, ref.lastIndexOf('/')), ref.slice(ref.lastIndexOf('/') + 1)];
  return all.find((p) => p.key.startsWith(`${folder}/`) && (p.name === name || p.key.replace(/\.\w+$/, '') === ref));
}

/** Orange camera date stamp, European order: 04 04 '26 (just 04 '26 if the day is unknown) */
export function stampFor(photo: Photo, chapter: Chapter): string {
  const [y, m, d] = (photo.date ?? chapter.id).split('-');
  const dd = Number(d) ? `${d.padStart(2, '0')} ` : '';
  return `${dd}${m.padStart(2, '0')} '${y.slice(2)}`;
}
