export const options = {
  wall: [{ id: 'ivory', name: 'Soe valge', color: '#eee8dc' }, { id: 'sand', name: 'Liiv', color: '#d5c4ac' }, { id: 'grey', name: 'Helehall', color: '#c9ccc9' }, { id: 'sage', name: 'Salvei', color: '#a6b09a' }, { id: 'blue', name: 'Sinakashall', color: '#53636b' }],
  furniture: [{ id: 'cream', name: 'Kreem', color: '#e4dccb' }, { id: 'grey', name: 'Helehall', color: '#b9b8b3' }, { id: 'graphite', name: 'Grafiit', color: '#454744' }, { id: 'olive', name: 'Oliiv', color: '#7a8060' }, { id: 'terracotta', name: 'Terrakota', color: '#b16f53' }],
  floor: [{ id: 'natural', name: 'Naturaalne tamm', color: '#ba8a55' }, { id: 'light', name: 'Hele tamm', color: '#d3b88d' }, { id: 'smoked', name: 'Suitsutamm', color: '#7c6149' }, { id: 'walnut', name: 'Pähklitoon', color: '#68472f' }, { id: 'grey', name: 'Hallikas tamm', color: '#a49b8c' }],
  pattern: [{ id: 'straight', name: 'Sirge laud' }, { id: 'herringbone', name: 'Kalasaba' }, { id: 'chevron', name: 'Chevron' }],
  finish: [{ id: 'matte', name: 'Matt' }, { id: 'satin', name: 'Siidjas' }],
};
/** @typedef {{wall:string,furniture:string,floor:string,pattern:string,finish:string,width:number,length:number}} Design */
/** @type {Design} */
export const defaults = { wall: 'ivory', furniture: 'cream', floor: 'natural', pattern: 'herringbone', finish: 'matte', width: 5, length: 4 };
export const STORAGE_KEY = 'parketipaigaldaja.design.v1';
/** @param {unknown} raw @returns {Design} */
export function validateDesign(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const result = { ...defaults };
  for (const key of ['wall', 'furniture', 'floor', 'pattern', 'finish']) {
    if (options[key].some(o => o.id === source[key])) result[key] = source[key];
  }
  for (const key of ['width', 'length']) {
    const n = Number(source[key]);
    if (Number.isFinite(n) && n >= 2 && n <= 10) result[key] = Math.round(n * 10) / 10;
  }
  return result;
}
/** @param {string} search @param {unknown} saved */
export function restoreDesign(search, saved) {
  const query = new URLSearchParams(search);
  const hasDesign = Object.keys(defaults).some(key => query.has(key));
  return validateDesign(hasDesign ? Object.fromEntries(query) : saved);
}
/** @param {Design} design */
export function designQuery(design) {
  return new URLSearchParams(Object.entries(validateDesign(design)).map(([k, v]) => [k, String(v)])).toString();
}
/** @param {Design} design */
export function summary(design) {
  const d = validateDesign(design);
  return `${options.floor.find(o => o.id === d.floor)?.name} · ${options.pattern.find(o => o.id === d.pattern)?.name} · ${options.finish.find(o => o.id === d.finish)?.name} · ${(d.width * d.length).toFixed(1)} m²`;
}
