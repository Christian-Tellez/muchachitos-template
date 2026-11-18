import type { APIRoute } from 'astro';
import { story } from '../data/story';

// A private album asks every crawler to stay out; the public demo lets them in.
export const GET: APIRoute = () =>
  new Response(story.private ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n', {
    headers: { 'Content-Type': 'text/plain' },
  });
