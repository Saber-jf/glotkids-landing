/**
 * Lili and Kuki on the web: the app's own Lottie files (public/lottie, copied
 * by `npm run assets`), driven the way the app drives them -- ONE clock, and a
 * walk's frame and its position read from the same moment, from the gait the
 * app's generator wrote (src/walk_gait.json). Two clocks slide feet.
 */
import lottie from "lottie-web/build/player/lottie_light";
import GAIT from "../walk_gait.json";

export type Who = "lili" | "kuki";
type Seg = [number, number];

const files = new Map<Who, Promise<any>>();
const load = (who: Who) => {
  if (!files.has(who)) files.set(who, fetch(`/lottie/${who}.json`).then((r) => r.json()));
  return files.get(who)!;
};
/** start fetching early (the hero) */
export const prefetch = (who: Who) => void load(who);

export interface Mascot {
  /** draw this frame of the file */
  frame(f: number): void;
  /** a named clip's frames */
  seg(name: string): Seg;
  fr: number;
  destroy(): void;
}

export async function mascot(el: HTMLElement, who: Who): Promise<Mascot> {
  const data = await load(who);
  const marks: Record<string, Seg> = {};
  for (const m of data.markers ?? []) marks[m.cm] = [m.tm, m.tm + m.dr];
  const anim = lottie.loadAnimation({
    container: el, renderer: "svg", loop: false, autoplay: false,
    /* lottie writes into the data it is given: each instance its own copy */
    animationData: structuredClone(data),
    rendererSettings: { preserveAspectRatio: "xMidYMax meet", progressiveLoad: false },
  });
  let last = -1;
  return {
    fr: data.fr ?? 30,
    frame(f: number) {
      const r = Math.round(f * 2) / 2;
      if (r === last) return;
      last = r;
      anim.goToAndStop(r, true);
    },
    seg(name: string) {
      const s = marks[name];
      if (!s) throw new Error(`${who}: "${name}" yok`);
      return s;
    },
    destroy() { anim.destroy(); },
  };
}

/* ── walking: frame and distance from one number ───────────────────────── */

export interface Gait {
  /** canvas px one loop carries the body, at canvas size 512 */
  stride: number;
  /** fraction of the stride reached at each frame of the loop (0..1) */
  advance: number[];
}
export const gaitOf = (who: Who, kind: "hop" | "stroll"): Gait => {
  const g = GAIT as unknown as Record<string, { stride: number; advance: number[] }>;
  return kind === "stroll" ? g.stroll! : who === "lili" ? g.bunny! : g.otter!;
};

/** how far into a loop the body is at loop phase u (0..1), by the gait's own profile */
export function advanceAt(g: Gait, u: number): number {
  const n = g.advance.length - 1;
  const x = Math.max(0, Math.min(1, u)) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const t = x - i;
  return g.advance[i]! * (1 - t) + g.advance[i + 1]! * t;
}

/** the loop count for a distance, and the stretch that makes it land exactly
 *  (never more than √2 either way: a half loop would cut from one foot to the other) */
export function planWalk(g: Gait, px: number, size: number) {
  const per = (g.stride * size) / 512;
  const loops = Math.max(1, Math.round(px / per));
  const k = Math.min(Math.SQRT2, Math.max(1 / Math.SQRT2, px / (loops * per)));
  return { loops, per: per * k };
}

export const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
