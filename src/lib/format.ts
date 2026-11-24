const year = (ym: string) => ym.slice(0, 4);

/** "2022–2026", or a single year when a role starts and ends in the same year. */
export function yearRange(start: string, end: string): string {
  return year(start) === year(end) ? year(start) : `${year(start)}–${year(end)}`;
}

/** "11/2022 – 10/2026" from "2022-11" and "2026-10". */
export function monthRange(start: string, end: string): string {
  const fmt = (ym: string) => `${ym.slice(5, 7)}/${ym.slice(0, 4)}`;
  return `${fmt(start)} – ${fmt(end)}`;
}
