import { performance } from "node:perf_hooks";

type Mark = { name: string; dur: number; desc?: string };

function sanitize(s: string): string {
  // Server-Timing token must be token chars; keep it simple
  return s.replace(/[^a-zA-Z0-9_\-\.]/g, "_").slice(0, 64);
}

function escDesc(s: string): string {
  return s.replace(/"/g, '\\"').slice(0, 128);
}

export class ServerTimer {
  private marks: Mark[] = [];

  start(name: string) {
    const t0 = performance.now();
    const n = sanitize(name);
    return (desc?: string) => {
      const dur = performance.now() - t0;
      this.marks.push({ name: n, dur, desc });
      return dur;
    };
  }

  add(name: string, durMs: number, desc?: string) {
    this.marks.push({ name: sanitize(name), dur: Math.max(0, durMs), desc });
  }

  toHeader(): string | undefined {
    if (this.marks.length === 0) return undefined;
    return this.marks
      .map((m) => {
        const base = `${m.name};dur=${m.dur.toFixed(1)}`;
        return m.desc ? `${base};desc="${escDesc(m.desc)}"` : base;
      })
      .join(", ");
  }
}
