import type { Chapter } from '../data/story';

// Videos prepared by npm run photos: src/videos/<chapter id>/<name>.mp4 + <name>.jpg poster
const mp4s = import.meta.glob<string>('../videos/*/*.mp4', { query: '?url', import: 'default', eager: true });
const posters = import.meta.glob<string>('../videos/*/*.jpg', { query: '?url', import: 'default', eager: true });

export interface Video { src: string; poster?: string; name: string; /** YYYY-MM-DD, from names like vid-20270904-204452 */ date?: string }

export function videosFor(chapter: Chapter): Video[] {
  return Object.entries(mp4s)
    .filter(([path]) => path.split('/').at(-2) === chapter.id)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src]) => ({
      src,
      poster: posters[path.replace(/\.mp4$/, '.jpg')],
      name: path.split('/').at(-1)!.replace(/\.mp4$/, ''),
    }))
    .map((v) => {
      const m = /(20\d{2})(\d{2})(\d{2})/.exec(v.name);
      return m ? { ...v, date: `${m[1]}-${m[2]}-${m[3]}` } : v;
    });
}
