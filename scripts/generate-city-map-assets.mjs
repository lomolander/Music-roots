import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const cities = {
  chicago: { bbox: [41.84, -87.68, 41.92, -87.57] },
  detroit: { bbox: [42.30, -83.10, 42.38, -82.98] },
  "new-york": { bbox: [40.68, -74.03, 40.82, -73.90] },
  london: { bbox: [51.48, -0.20, 51.56, 0.02] },
  manchester: { bbox: [53.44, -2.30, 53.52, -2.17] },
  liverpool: { bbox: [53.36, -3.05, 53.44, -2.90] },
  bristol: { bbox: [51.42, -2.65, 51.50, -2.52] },
  berlin: { bbox: [52.48, 13.30, 52.56, 13.48] },
  paris: { bbox: [48.82, 2.27, 48.90, 2.43] },
  kingston: { bbox: [17.97, -76.84, 18.02, -76.75] },
  rio: { bbox: [-23.00, -43.28, -22.88, -43.14] },
  napoli: { bbox: [40.80, 14.18, 40.89, 14.34] },
  roma: { bbox: [41.84, 12.42, 41.94, 12.56] },
  milano: { bbox: [45.42, 9.10, 45.51, 9.25] },
  genova: { bbox: [44.38, 8.87, 44.45, 9.00] },
  venezia: { bbox: [45.41, 12.28, 45.47, 12.39] },
  bologna: { bbox: [44.46, 11.28, 44.54, 11.40] },
  torino: { bbox: [45.02, 7.60, 45.12, 7.75] },
  glasgow: { bbox: [55.82, -4.34, 55.90, -4.16] },
  "los-angeles": { bbox: [33.98, -118.34, 34.12, -118.16] },
  "san-francisco": { bbox: [37.75, -122.46, 37.81, -122.39] },
  birmingham: { bbox: [52.44, -1.98, 52.53, -1.82] },
  canterbury: { bbox: [51.26, 1.05, 51.30, 1.11] },
  newcastle: { bbox: [54.94, -1.70, 55.02, -1.52] },
  boston: { bbox: [42.31, -71.14, 42.40, -70.99] },
  seattle: { bbox: [47.56, -122.39, 47.66, -122.28] },
  jacksonville: { bbox: [30.27, -81.72, 30.38, -81.59] },
  austin: { bbox: [30.22, -97.82, 30.34, -97.67] },
  sydney: { bbox: [-33.92, 151.15, -33.82, 151.26] },
  melbourne: { bbox: [-37.86, 144.90, -37.77, 145.03] },
  toronto: { bbox: [43.62, -79.47, 43.72, -79.31] },
  hannover: { bbox: [52.33, 9.66, 52.42, 9.82] },
  belfast: { bbox: [54.56, -6.02, 54.64, -5.84] },
  topeka: { bbox: [39.00, -95.77, 39.10, -95.61] },
  tokyo: { bbox: [35.63, 139.68, 35.74, 139.82] },
  osaka: { bbox: [34.63, 135.43, 34.74, 135.58] },
  kyoto: { bbox: [34.96, 135.70, 35.08, 135.82] },
  yokohama: { bbox: [35.40, 139.57, 35.50, 139.70] },
  hiroshima: { bbox: [34.34, 132.40, 34.44, 132.53] },
  kanazawa: { bbox: [36.52, 136.59, 36.62, 136.72] },
  brescia: { bbox: [45.50, 10.16, 45.58, 10.27] },
  palermo: { bbox: [38.08, 13.29, 38.18, 13.42] },
  como: { bbox: [45.76, 9.03, 45.84, 9.14] },
  siracusa: { bbox: [37.03, 15.24, 37.12, 15.34] },
  geneva: { bbox: [46.17, 6.09, 46.24, 6.19] },
  oxford: { bbox: [51.72, -1.31, 51.80, -1.20] },
  "vega-baja": { bbox: [18.41, -66.44, 18.50, -66.32] },
  portland: { bbox: [45.47, -122.75, 45.58, -122.56] },
  veracruz: { bbox: [19.13, -96.20, 19.24, -96.08] },
  nashville: { bbox: [36.10, -86.86, 36.22, -86.70] },
  memphis: { bbox: [35.08, -90.10, 35.20, -89.90] },
  "las-vegas": { bbox: [36.10, -115.24, 36.22, -115.08] },
  clarksdale: { bbox: [34.18, -90.63, 34.23, -90.53] },
  bakersfield: { bbox: [35.32, -119.10, 35.42, -118.94] },
};

const requested = process.argv.slice(2);
const selected = requested.length ? requested : Object.keys(cities);
const outputDirectory = path.resolve("src/assets/city-maps");
await mkdir(outputDirectory, { recursive: true });

const escapeNumber = (value) => Number(value.toFixed(1));
const pointDistance = (point, start, end) => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy));
};
const simplify = (points, tolerance = 0.7) => {
  if (points.length <= 2) return points;
  let maxDistance = 0;
  let splitIndex = 0;
  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = pointDistance(points[index], points[0], points.at(-1));
    if (distance > maxDistance) { maxDistance = distance; splitIndex = index; }
  }
  if (maxDistance <= tolerance) return [points[0], points.at(-1)];
  return [...simplify(points.slice(0, splitIndex + 1), tolerance).slice(0, -1), ...simplify(points.slice(splitIndex), tolerance)];
};

for (const cityId of selected) {
  const city = cities[cityId];
  if (!city) throw new Error(`Città non configurata: ${cityId}`);
  const outputPath = path.join(outputDirectory, `${cityId}.svg`);
  try {
    await access(outputPath);
    console.log(cityId, "già presente");
    continue;
  } catch {
    // L'asset deve ancora essere generato.
  }
  const [south, west, north, east] = city.bbox;
  const bbox = `${south},${west},${north},${east}`;
  const query = `[out:json][timeout:90];(way["highway"~"^(motorway|trunk|primary|secondary)$"](${bbox});way["waterway"~"^(river|canal)$"](${bbox});way["natural"="coastline"](${bbox});way["leisure"="park"](${bbox}););out tags geom;`;
  const endpoints = ["https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
  let response;
  for (const endpoint of endpoints) {
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "User-Agent": "MusicRoots-city-map-generator/1.0" },
        body: new URLSearchParams({ data: query }),
      });
    } catch (error) {
      console.warn(cityId, endpoint, error.cause?.code ?? error.message);
      continue;
    }
    if (response.ok) break;
    console.warn(cityId, endpoint, response.status);
  }
  if (!response?.ok) {
    console.error(cityId, `non generata: Overpass ${response?.status ?? "unavailable"}`);
    continue;
  }
  const data = await response.json();
  const width = 320;
  const height = 210;
  const project = ({ lat, lon }) => [((lon - west) / (east - west)) * width, height - ((lat - south) / (north - south)) * height];
  const groups = { major: [], secondary: [], water: [], coast: [], park: [] };
  for (const element of data.elements) {
    if (!element.geometry?.length) continue;
    const projected = simplify(element.geometry.map(project));
    if (projected.length < 2) continue;
    const pathData = projected.map(([x, y], index) => `${index ? "L" : "M"}${escapeNumber(x)} ${escapeNumber(y)}`).join("");
    const length = projected.slice(1).reduce((total, point, index) => total + Math.hypot(point[0] - projected[index][0], point[1] - projected[index][1]), 0);
    const item = { pathData, length };
    if (element.tags?.natural === "coastline") groups.coast.push(item);
    else if (element.tags?.waterway) groups.water.push(item);
    else if (element.tags?.leisure === "park") groups.park.push({ ...item, pathData: `${pathData}Z` });
    else if (/^(motorway|trunk|primary)$/.test(element.tags?.highway)) groups.major.push(item);
    else groups.secondary.push(item);
  }
  const limits = { major: 260, secondary: 180, water: 90, coast: 50, park: 35 };
  Object.entries(groups).forEach(([key, items]) => {
    groups[key] = items.filter((item) => item.length >= (key === "secondary" ? 8 : 4)).sort((a, b) => b.length - a.length).slice(0, limits[key]);
  });
  const render = (items, className) => items.length ? `<path class="${className}" d="${items.map((item) => item.pathData).join("")}"/>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice"><rect width="320" height="210" fill="#17181b"/>${render(groups.park, "park")}${render(groups.secondary, "secondary")}${render(groups.major, "major")}${render(groups.water, "water")}${render(groups.coast, "coast")}<style>.secondary,.major,.water,.coast{fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.secondary{stroke:#777a7f;stroke-width:.65;opacity:.38}.major{stroke:#a2a4a8;stroke-width:1.25;opacity:.58}.water{stroke:#bbbcc0;stroke-width:2.7;opacity:.5}.coast{stroke:#d0d1d3;stroke-width:2.1;opacity:.52}.park{fill:#393b3f;opacity:.5;stroke:none}</style></svg>`;
  await writeFile(outputPath, svg, "utf8");
  console.log(cityId, `${Math.round(Buffer.byteLength(svg) / 1024)} KB`, Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, value.length])));
}
