// Everything you'd want to edit lives here: dates, titles, notes, captions, Czech touches.
// Photos are picked up automatically from src/photos/<chapter id>/ (see README).

export type Layout =
  | "prologue"
  | "collage"
  | "night"
  | "film"
  | "festival"
  | "trip"
  | "finale";

export interface TripStop {
  name: string;
  region?: string;
  /** YYYY-MM-DD. Photos taken from this day until the next stop's `from` belong to this stop */
  from: string;
  to: string;
  note?: string;
  /** stamp ink colour */
  ink: string;
  /** how you got there, shown on the dotted route before the stamp */
  arrive: { mode: "plane" | "car"; label: string };
}

export type CommentStyle = "arrow" | "postit" | "bubble";

export interface Chapter {
  /** Folder name in src/photos, e.g. '2027-02' */
  id: string;
  month: string;
  year: number;
  /** replaces the year under the month name (used by trips) */
  subtitle?: string;
  /** big outlined number behind the heading; defaults to the month number, '' hides it */
  num?: string;
  title: string;
  layout: Layout;
  note?: string;
  /** Little sticker next to the month name */
  badge?: { kind: "postage" | "rubber"; text: string; label?: string };
  czech?: { text: string; translation?: string };
  /** Optional captions, by photo number in this chapter (1 = first) or by caption key: { 2: "first swim" } */
  captions?: Record<string, string>;
  /** Optional comments on a few photos, same keys as captions. Either just the text (uses
      story.commentStyle) or { text, style } to pick "arrow", "postit" or "bubble" for that photo */
  comments?: Record<string, string | { text: string; style?: CommentStyle }>;
  /** Easter egg: a tiny pen heart on that polaroid; tapping it flips the photo over to show this
      message written on the back. Same keys as captions: { 2: "…" } */
  secrets?: Record<string, string>;
  /** prologue only */
  messages?: { from: "her" | "me"; text: string }[];
  /** festival only: the fabric wristband */
  festival?: { name: string; dates: string };
  /** the big video of the chapter (first video in its folder), shown in a camcorder viewfinder.
      stamp: date in the corner; sound: show the "tap for sound" button */
  video?: { stamp?: string; caption?: string; sound?: boolean };
  /** trip only */
  trip?: {
    pass: {
      from: string;
      fromCity: string;
      to: string;
      toCity: string;
      date: string;
    };
    stops: TripStop[];
    home: { mode: "plane" | "car"; label: string };
  };
  /** big "6 months · 183 days" line under the heading, counted from `story.official` */
  milestone?: { date: string; label: string };
  /** a key ring with a paper tag at the end of the chapter (moving in together) */
  keys?: { text: string; czech?: string; date?: string };
  /** finale only: the letter inside the envelope */
  letter?: {
    opening?: string;
    body: string[];
    closing: string;
    signature: string;
  };
}

export const story = {
  title: "Muchachitos",
  subtitle: "our album, month by month",
  /** her name, on the envelope and the birthday card */
  her: "Anastasia",
  birthday: { month: 11, day: 8 },
  /** his birthday: the same confetti card, with his own words */
  me: {
    title: "¡Feliz cumple!",
    text: "happy birthday, Kristián 🐇",
    birthday: { month: 3, day: 23 },
  },
  /** the two of you, in emoji: on the birthday card and the monthly "happy N months" note */
  emoji: "🪿🐇",
  /** the city on the envelope's postmark */
  postmark: "PRAHA",
  /** true: search engines are asked not to index the album (keep it true for a real, private album) */
  private: false,
  /** the small "made with Muchachitos" line at the very end */
  credit: true,
  firstMessage: "2027-01-22",
  /** first-date photobooth look: 'film' (warm analog), 'flash' (photobooth flash) or 'natural' */
  firstDateTone: "film" as "film" | "flash" | "natural",
  /** default look of photo comments: "arrow", "postit" or "bubble". Each comment can override it
      with { text, style }. In npm run dev a switch at the bottom left previews all of them in one style */
  commentStyle: "arrow" as CommentStyle,
  firstDate: "2027-01-31",
  official: "2027-04-04",
  /** Hero polaroids. Empty = 3 random photos on every visit (each from a different chapter).
      To fix them: ["2027-04/img-1234", …] using the caption keys from npm run photos. */
  hero: [] as string[],
  next: { date: "04 · 04 · 2028", text: "one year together…" },
  playlist: {
    name: "Muchachitos Mix",
    /** public playlist, played inside the page */
    spotify: "2mSvJqb5WqsVAyeuBAagfQ",
    /** optional: a YouTube Music playlist, shown as a link */
    youtubeMusic: undefined as string | undefined,
  },
  /** our song: the vinyl right before the birthday letter */
  song: {
    title: "Just The Way You Are",
    artist: "Milky",
    spotify: "7K3Lc3TfSR14aTOjIH7TUj",
    hint: "press play, then open the letter",
    link: "listen to OUR song in Spotify :)",
  },

  chapters: [
    {
      id: "2027-01",
      month: "January",
      year: 2027,
      title: "where it all started",
      layout: "prologue",
      messages: [
        { from: "her", text: "Important question before we go any further: pineapple on pizza?" },
        { from: "me", text: "Only if you're there to judge me 🍍" },
        { from: "her", text: "Red flag. Noted. 🚩 So… when are we getting pizza?" },
      ],
    },
    {
      id: "2027-02",
      month: "February",
      year: 2027,
      title: "our first Valentine's",
      layout: "collage",
      badge: { kind: "postage", text: "14.2.2027" },
      note: "Heart-shaped everything. We pretended it was too cheesy. It wasn't.",
      czech: { text: "Moje lásko", translation: "my love" },
      comments: { 3: { text: "you, pretending not to smile 🥺", style: "arrow" } },
    },
    {
      id: "2027-03",
      month: "March",
      year: 2027,
      title: "my birthday",
      layout: "collage",
      badge: { kind: "rubber", text: "23·III", label: "birthday" },
      note: "One year older, and the best gift was you :)",
      comments: { 2: { text: "make a wish! (it came true)", style: "postit" } },
    },
    {
      id: "2027-04",
      month: "April",
      year: 2027,
      title: "our day",
      layout: "night",
      czech: { text: "Jsi moje všechno", translation: "you are my everything" },
    },
    {
      id: "2027-05",
      month: "May",
      year: 2027,
      title: "spring days",
      layout: "collage",
      note: "Long walks, sunsets and way too much ice cream.",
      comments: { 3: { text: "Mmmm so tasty!", style: "bubble" } },
    },
    {
      id: "2027-06",
      month: "June",
      year: 2027,
      title: "summer starts",
      layout: "collage",
      note: "Swimming pools, concerts and good vibes!",
    },
    {
      id: "2027-07",
      month: "July",
      year: 2027,
      title: "football before Ostrava",
      layout: "collage",
      note: "FOOTBALL, basically. I loved July!",
    },
    {
      id: "2027-07-colours",
      month: "Ostrava",
      year: 2027,
      subtitle: "15–18 July 2027",
      num: "",
      title: "Colours of Ostrava",
      layout: "festival",
      festival: { name: "Colours of Ostrava", dates: "15–18.7.2027" },
      video: { stamp: "17 JUL 2027", sound: true },
    },
    {
      id: "2027-08-spain",
      month: "Spain",
      year: 2027,
      subtitle: "21 August – 5 September",
      num: "",
      title: "family, islands & the ocean",
      layout: "trip",
      czech: { text: "Navždy", translation: "forever" },
      trip: {
        pass: {
          from: "PRG",
          fromCity: "Prague",
          to: "BIO",
          toCity: "Bilbao",
          date: "21 AUG 2027",
        },
        stops: [
          {
            name: "Logroño",
            region: "La Rioja",
            from: "2027-08-21",
            to: "2027-08-27",
            note: "meeting the family",
            ink: "#8e2340",
            arrive: { mode: "car", label: "Bilbao → Logroño" },
          },
          {
            name: "Lanzarote",
            region: "Islas Canarias",
            from: "2027-08-27",
            to: "2027-09-01",
            ink: "#2d4f7c",
            arrive: { mode: "plane", label: "Bilbao → Lanzarote · 27 Aug" },
          },
          {
            name: "Gran Canaria",
            region: "Islas Canarias",
            from: "2027-09-01",
            to: "2027-09-05",
            ink: "#2f6b4f",
            arrive: { mode: "plane", label: "Lanzarote → Gran Canaria · 1 Sep" },
          },
        ],
        home: { mode: "plane", label: "Gran Canaria → Prague · 5 Sep · home" },
      },
    },
    {
      id: "2027-09",
      month: "September",
      year: 2027,
      title: "back home, together",
      layout: "collage",
      note: "Back to routine, but a better one.",
    },
    {
      id: "2027-10",
      month: "October",
      year: 2027,
      title: "six months",
      layout: "collage",
      badge: { kind: "rubber", text: "4·X", label: "six months" },
      milestone: { date: "2027-10-04", label: "months" },
      note: "We finally moved in together, wooo!",
      keys: { text: "our first home", czech: "domov", date: "27 OCT 2027" },
    },
    {
      id: "2027-11",
      month: "November",
      year: 2027,
      title: "your birthday",
      layout: "finale",
      badge: { kind: "postage", text: "8.11.2027" },
      letter: {
        opening: "Dear Anastasia,",
        body: [
          "A year ago I didn't know you existed. Now I can't remember what my days looked like before that first message about pizza.",
          "This year we met, we laughed a lot, we argued a little, we travelled, and we built a home. Every page of this album is one of those moments, and I wanted to keep them all in one place.",
          "Today is your first birthday with me. I hope it's the first of many, many more, and that we keep filling pages for a very long time.",
          "Happy birthday, my love.",
        ],
        closing: "Miluju tě",
        signature: "Kristián",
      },
    },
  ] satisfies Chapter[] as Chapter[],
};
