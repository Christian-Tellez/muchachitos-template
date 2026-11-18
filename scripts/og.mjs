// Generates public/og.jpg (link preview in WhatsApp & co.) and public/apple-touch-icon.png.
// No real photos on purpose: the preview is visible to anyone the link is sent to.
import sharp from 'sharp';

const heart = 'M50 86 C 20 64, 4 44, 14 26 C 22 12, 42 12, 50 30 C 58 12, 78 12, 86 26 C 96 44, 80 64, 50 86Z';
const pol = (x, y, rot, a, b) => `
  <g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="-4" y="10" width="208" height="250" fill="#3a2228" opacity=".12" filter="url(#s)"/>
    <rect width="200" height="244" fill="#fbfaf6"/>
    <rect x="10" y="10" width="180" height="190" fill="url(#${a})"/>
    <rect x="62" y="-12" width="76" height="24" fill="${b}" opacity=".75" transform="rotate(-4 100 0)"/>
  </g>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#3b2c5e"/><stop offset=".55" stop-color="#c4577a"/><stop offset="1" stop-color="#f39a6b"/></linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#a9d8ee"/><stop offset=".55" stop-color="#e6f3f7"/><stop offset="1" stop-color="#2f8fa6"/></linearGradient>
    <linearGradient id="g3" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#2b2d5c"/><stop offset=".55" stop-color="#8b5a8c"/><stop offset="1" stop-color="#f3c38f"/></linearGradient>
    <filter id="s"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="1200" height="630" fill="#ecd6cf"/>
  ${pol(700, 150, -8, 'g1', '#f4a5b9')}
  ${pol(930, 110, 7, 'g2', '#96d4be')}
  ${pol(810, 250, -2, 'g3', '#f4a5b9')}
  <text x="90" y="300" font-family="Georgia, serif" font-size="104" fill="#3a2228">Muchachitos</text>
  <text x="94" y="368" font-family="Georgia, serif" font-style="italic" font-size="38" fill="#7a2e45">our album, month by month</text>
  <path d="${heart}" transform="translate(94 410) scale(.6)" fill="#b02a3c"/>
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#ecd6cf"/>
  <path d="M50 80 C 24 62, 10 46, 18 30 C 25 17, 42 17, 50 33 C 58 17, 75 17, 82 30 C 90 46, 76 62, 50 80Z" fill="#b02a3c"/>
</svg>`;

await sharp(Buffer.from(og)).jpeg({ quality: 88 }).toFile('public/og.jpg');
await sharp(Buffer.from(icon)).png().toFile('public/apple-touch-icon.png');
console.log('public/og.jpg + public/apple-touch-icon.png');
