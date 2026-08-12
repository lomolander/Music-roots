import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

const MAP_WIDTH = 3200;
const MAP_HEIGHT = 1040;
const TAP_DISTANCE = 9;

const stations = {
  seattle: [150, 150, "above"], "san-francisco": [310, 310, "above"], "los-angeles": [470, 470, "below"], austin: [720, 470, "above"], topeka: [920, 270, "above"], chicago: [1120, 270, "below"], detroit: [1300, 150, "above"], toronto: [1470, 150, "above"], boston: [1650, 70, "above"], "new-york": [1650, 270, "below"], jacksonville: [1850, 470, "below"],
  belfast: [330, 720, "above"], glasgow: [510, 540, "below"], liverpool: [720, 540, "below"], manchester: [880, 700, "below"], newcastle: [1060, 520, "above"], birmingham: [1220, 680, "below"], london: [1400, 680, "below"], bristol: [1240, 840, "below"], canterbury: [1580, 840, "below"],
  paris: [1580, 500, "above"], hannover: [1900, 620, "below"], berlin: [2100, 420, "above"],
  torino: [1700, 780, "above"], milano: [1870, 780, "above"], genova: [2000, 910, "below"], bologna: [2160, 750, "above"], venezia: [2340, 750, "above"], roma: [2510, 920, "below"], napoli: [2700, 920, "below"],
  hiroshima: [2110, 160, "above"], osaka: [2280, 330, "below"], kyoto: [2450, 330, "above"], kanazawa: [2600, 180, "above"], tokyo: [2820, 180, "above"], yokohama: [3000, 360, "below"],
  melbourne: [2760, 650, "below"], sydney: [2980, 520, "above"],
  kingston: [760, 930, "below"], rio: [1120, 930, "below"],
};

const routes = [
  { id: "north-america", label: "Nord America", color: "#d6ad59", cities: ["seattle", "san-francisco", "los-angeles", "austin", "topeka", "chicago", "detroit", "new-york", "jacksonville"], points: [[150,150],[310,310],[470,470],[720,470],[920,270],[1120,270],[1300,150],[1450,150],[1650,270],[1650,470],[1850,470]] },
  { id: "great-lakes", label: "Grandi Laghi", color: "#7ba7a2", cities: ["chicago", "detroit", "toronto", "boston", "new-york"], points: [[1120,270],[1300,150],[1470,150],[1650,70],[1650,270]] },
  { id: "britain", label: "Isole britanniche", color: "#c87570", cities: ["belfast", "glasgow", "liverpool", "manchester", "newcastle", "birmingham", "london", "bristol", "canterbury"], points: [[330,720],[510,540],[720,540],[880,700],[1060,520],[1220,680],[1400,680],[1240,840],[1580,840]] },
  { id: "europe", label: "Europa", color: "#6b91bf", cities: ["london", "paris", "hannover", "berlin"], points: [[1400,680],[1400,660],[1580,500],[1780,500],[1900,620],[2100,420]] },
  { id: "italy", label: "Italia", color: "#987cc2", cities: ["torino", "milano", "genova", "bologna", "venezia", "roma", "napoli"], points: [[1700,780],[1870,780],[2000,910],[2160,750],[2340,750],[2510,920],[2700,920]] },
  { id: "japan", label: "Giappone", color: "#668fbd", cities: ["hiroshima", "osaka", "kyoto", "kanazawa", "tokyo", "yokohama"], points: [[2110,160],[2280,330],[2450,330],[2600,180],[2820,180],[3000,360]] },
  { id: "australia", label: "Australia", color: "#b77999", cities: ["melbourne", "sydney"], points: [[2760,650],[2860,650],[2980,520]] },
];

const positionMap = new Map(Object.entries(stations).map(([id, [x, y, label]]) => [id, { id, x, y, label }]));
const routeCount = routes.reduce((counts, route) => {
  route.cities.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  return counts;
}, new Map());

const roundedPath = (points, radius = 22) => {
  if (points.length < 2) return "";
  const command = [`M ${points[0][0]} ${points[0][1]}`];
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const beforeDistance = Math.hypot(current[0] - previous[0], current[1] - previous[1]);
    const afterDistance = Math.hypot(next[0] - current[0], next[1] - current[1]);
    const corner = Math.min(radius, beforeDistance / 3, afterDistance / 3);
    const before = [current[0] + (previous[0] - current[0]) * corner / beforeDistance, current[1] + (previous[1] - current[1]) * corner / beforeDistance];
    const after = [current[0] + (next[0] - current[0]) * corner / afterDistance, current[1] + (next[1] - current[1]) * corner / afterDistance];
    command.push(`L ${before[0]} ${before[1]} Q ${current[0]} ${current[1]} ${after[0]} ${after[1]}`);
  }
  command.push(`L ${points.at(-1)[0]} ${points.at(-1)[1]}`);
  return command.join(" ");
};

const AtlasMetroMap = forwardRef(function AtlasMetroMap({ cities, onCity }, forwardedRef) {
  const scrollerRef = useRef(null);
  const gestureRef = useRef(null);
  const activationTimerRef = useRef(null);
  const [activeCityId, setActiveCityId] = useState(null);
  const cityById = useMemo(() => new Map(cities.map((city) => [city.id, city])), [cities]);

  useEffect(() => () => window.clearTimeout(activationTimerRef.current), []);

  const centerCity = (cityId, behavior = "smooth") => {
    const scroller = scrollerRef.current;
    const position = positionMap.get(cityId);
    if (!scroller || !position) return;
    const scale = scroller.scrollWidth / MAP_WIDTH;
    scroller.scrollTo({ left: Math.max(0, position.x * scale - scroller.clientWidth / 2), behavior });
  };

  useImperativeHandle(forwardedRef, () => ({
    centerCity,
    centerDefault: (behavior = "smooth") => centerCity("london", behavior),
    getScrollLeft: () => scrollerRef.current?.scrollLeft ?? 0,
    restoreScrollLeft: (left) => scrollerRef.current?.scrollTo({ left, behavior: "auto" }),
  }), []);

  const activateCity = (cityId) => {
    const city = cityById.get(cityId);
    if (!city) return;
    window.clearTimeout(activationTimerRef.current);
    setActiveCityId(cityId);
    activationTimerRef.current = window.setTimeout(() => onCity(city), 170);
  };
  const pointerDown = (event) => {
    gestureRef.current = { x: event.clientX, y: event.clientY, left: scrollerRef.current?.scrollLeft ?? 0, moved: false, type: event.pointerType };
    if (event.pointerType === "mouse") event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.hypot(dx, dy) > TAP_DISTANCE) gesture.moved = true;
    if (gesture.type === "mouse" && scrollerRef.current) scrollerRef.current.scrollLeft = gesture.left - dx;
  };
  const stationPointerUp = (event, cityId) => {
    event.stopPropagation();
    if (gestureRef.current && !gestureRef.current.moved) activateCity(cityId);
    gestureRef.current = null;
  };

  return (
    <div className="atlas-v2-map-scroll" ref={scrollerRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={() => { gestureRef.current = null; }} onPointerCancel={() => { gestureRef.current = null; }}>
      <svg className="atlas-v2-map" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Mappa musicale delle città">
        {routes.map((route) => <g key={route.id}><path className="atlas-v2-route-shadow" d={roundedPath(route.points)} /><path className="atlas-v2-route" style={{ "--route-color": route.color }} d={roundedPath(route.points)} /><text className="atlas-v2-route-name" x={route.points[0][0]} y={route.points[0][1] - 45}>{route.label}</text></g>)}
        {["kingston", "rio"].map((id) => { const item = positionMap.get(id); return <circle className="atlas-v2-standalone-ring" key={`ring-${id}`} cx={item.x} cy={item.y} r="35" />; })}
        {[...positionMap.entries()].map(([cityId, position]) => {
          const city = cityById.get(cityId);
          if (!city) return null;
          const interchange = (routeCount.get(cityId) ?? 0) > 1;
          const labelY = position.label === "above" ? -28 : 34;
          return (
  <g
    key={cityId}
    className={`atlas-v2-station${interchange ? " is-interchange" : ""}${activeCityId === cityId ? " is-selected" : ""}`}
    role="button"
    tabIndex={0}
    aria-label={`Apri ${city.name}`}
    transform={`translate(${position.x} ${position.y})`}
    onPointerUp={(event) => stationPointerUp(event, cityId)}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateCity(cityId);
      }
    }}
  >
            <rect className="atlas-v2-station-hit" x="-70" y={position.label === "above" ? -55 : -20} width="140" height="70" rx="18" />
            {activeCityId === cityId && <circle className="atlas-v2-selection-ring" r="27" />}
            <circle className="atlas-v2-station-node" r={interchange ? 16 : 11} />
            {interchange && <circle className="atlas-v2-interchange-inner" r="9" />}
            <circle className="atlas-v2-station-core" r="4" />
            <text className="atlas-v2-station-label" x="0" y={labelY} textAnchor="middle">{city.name}</text>
          </g>
          );
        })}
      </svg>
    </div>
  );
});

export default AtlasMetroMap;
