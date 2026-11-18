// Shared Spotify iFrame API helper for the cassette and the vinyl.
// The player is prepared in the background when its block gets close to the screen, so a tap
// starts the music almost instantly. Only one player sounds at a time.
type SpotifyController = {
  togglePlay(): void;
  play(): void;
  pause(): void;
  addListener(event: 'ready' | 'playback_update', cb: (e: { data: { isPaused: boolean } }) => void): void;
};
type IFrameAPI = {
  createController(
    el: HTMLElement,
    opts: { uri: string; width: string; height: number },
    cb: (c: SpotifyController) => void,
  ): void;
};

let api: Promise<IFrameAPI> | undefined;
const loadApi = () =>
  (api ??= new Promise<IFrameAPI>((resolve) => {
    (window as unknown as { onSpotifyIframeApiReady: (a: IFrameAPI) => void }).onSpotifyIframeApiReady = resolve;
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    document.head.append(script);
  }));

const players = new Set<SpotifyController>();

/**
 * @param box   element that gets data-state="loading|ready|playing|paused"
 * @param mount empty element the Spotify iframe replaces (must stay in the DOM)
 */
export function spotifyPlayer(box: HTMLElement, mount: HTMLElement, uri: string, height: number) {
  let controller: SpotifyController | undefined;
  let ready = false;
  let started = false;
  let wantPlay = false;
  let preparing: Promise<void> | undefined;

  const start = () => {
    if (!controller) return;
    started ? controller.togglePlay() : controller.play();
    started = true;
  };

  const prepare = () =>
    (preparing ??= loadApi().then(
      (IFrameAPI) =>
        new Promise<void>((resolve) => {
          box.dataset.state = 'loading';
          IFrameAPI.createController(mount, { uri, width: '100%', height }, (c) => {
            controller = c;
            players.add(c);
            c.addListener('ready', () => {
              ready = true;
              if (box.dataset.state === 'loading') box.dataset.state = 'ready';
              if (wantPlay) start();
              resolve();
            });
            c.addListener('playback_update', (e) => {
              const playing = !e.data.isPaused;
              box.dataset.state = playing ? 'playing' : 'paused';
              if (playing) {
                players.forEach((other) => other !== c && other.pause());
                dispatchEvent(new CustomEvent('muchachitos:music'));
              }
            });
          });
        }),
    ));

  // warm up when the block is within ~1.5 screens
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
      idle(() => prepare());
    },
    { rootMargin: '150% 0px' },
  );
  io.observe(box);

  return {
    /** call from the tap handler */
    toggle() {
      if (!ready) {
        wantPlay = true;
        prepare();
        return;
      }
      if (!started) box.dataset.state = 'loading';
      start();
    },
  };
}

/** pause every Spotify player (e.g. when a video's sound is turned on) */
export function pauseAllMusic() {
  players.forEach((p) => p.pause());
}
