import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { icons } from "lucide";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "assets", "vendor", "lucide-0.468.0.min.js");
const names = [
  "badge-check", "badge-dollar-sign", "banknote", "bath", "briefcase-business",
  "building-2", "calendar-clock", "calendar-days", "check", "chevron-left",
  "chevron-right", "circle", "circle-dollar-sign", "hammer", "hard-hat", "home",
  "house", "image", "layers-3", "leaf", "map-pin", "panels-top-left", "refresh-cw",
  "scan-line", "search", "shield-check", "sparkles", "square-plus", "store", "wallet",
  "wrench", "zap",
];

function exportName(name) {
  return name.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
}

const selected = Object.fromEntries(names.map((name) => {
  const icon = icons[exportName(name)];
  if (!icon) throw new Error(`Lucide icon is unavailable: ${name}`);
  return [name, icon];
}));

const runtime = `(()=>{const I=${JSON.stringify(selected)},N="http://www.w3.org/2000/svg";function a(e,t){for(const[n,o]of Object.entries(t))e.setAttribute(n,o)}function c({root:e=document}={}){const t=[];e.matches?.("[data-lucide]")&&t.push(e),t.push(...e.querySelectorAll("[data-lucide]"));for(const e of t){const t=e.getAttribute("data-lucide"),n=I[t];if(!n)continue;const[,o,r]=n,i=document.createElementNS(N,"svg");a(i,o);for(const{name:s,value:l}of[...e.attributes])"data-lucide"!==s&&i.setAttribute(s,l);i.setAttribute("data-lucide",t),i.classList.add("lucide","lucide-"+t);for(const[e,t]of r){const n=document.createElementNS(N,e);a(n,t),i.appendChild(n)}e.replaceWith(i)}}window.lucide={createIcons:c}})();`;

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, runtime);
console.log(`Generated ${names.length}-icon Lucide subset at ${path.relative(root, output)}.`);
