// Hand-authored simplified Cape Town geography for the reports dashboard.
// All coordinates are in the SVG viewBox space (1000 x 700), NOT real lng/lat.
// Shapes are stylised to feel municipal but stay offline-friendly.

export type ZoneId =
  | "atlantic_seaboard"
  | "city_bowl"
  | "northern_suburbs"
  | "southern_suburbs"
  | "cape_flats";

export type Zone = {
  id: ZoneId;
  name: string;
  polygon: [number, number][];
  labelAt: [number, number];
  bbox: [number, number, number, number]; // x, y, w, h
};

export type Ward = {
  id: string;
  name: string;
  zoneId: ZoneId;
  polygon: [number, number][];
  centroid: [number, number];
  postcode: string;
};

// Coastline path (Atlantic + False Bay) — purely decorative.
export const COASTLINE_PATH =
  "M 0 0 L 60 0 L 70 80 L 80 160 L 95 230 L 115 300 L 140 360 L 175 410 L 220 450 L 270 480 L 330 520 L 410 555 L 500 580 L 590 595 L 680 600 L 760 595 L 830 580 L 900 555 L 960 520 L 1000 480 L 1000 0 Z";

// Land mask path (everything that is land).
export const LAND_PATH =
  "M 60 0 L 1000 0 L 1000 480 L 960 520 L 900 555 L 830 580 L 760 595 L 680 600 L 590 595 L 500 580 L 410 555 L 330 520 L 270 480 L 220 450 L 175 410 L 140 360 L 115 300 L 95 230 L 80 160 L 70 80 Z";

// Table Mountain footprint (decorative).
export const TABLE_MOUNTAIN_PATH =
  "M 215 305 L 240 290 L 290 295 L 340 305 L 370 320 L 365 360 L 350 395 L 320 415 L 280 415 L 245 400 L 220 370 Z";

export const ZONES: Zone[] = [
  {
    id: "atlantic_seaboard",
    name: "Atlantic Seaboard",
    polygon: [
      [60, 0], [200, 0], [205, 90], [195, 180], [180, 260],
      [165, 320], [150, 360], [140, 360], [115, 300],
      [95, 230], [80, 160], [70, 80],
    ],
    labelAt: [130, 160],
    bbox: [60, 0, 145, 360],
  },
  {
    id: "city_bowl",
    name: "City Bowl",
    polygon: [
      [200, 0], [430, 0], [430, 200], [420, 270], [380, 290],
      [320, 285], [260, 280], [210, 270], [205, 90],
    ],
    labelAt: [320, 130],
    bbox: [200, 0, 230, 290],
  },
  {
    id: "northern_suburbs",
    name: "Northern Suburbs",
    polygon: [
      [430, 0], [1000, 0], [1000, 250], [980, 290], [900, 310],
      [780, 305], [660, 300], [540, 295], [460, 285], [430, 270],
    ],
    labelAt: [720, 130],
    bbox: [430, 0, 570, 310],
  },
  {
    id: "southern_suburbs",
    name: "Southern Suburbs",
    polygon: [
      [165, 320], [180, 260], [195, 180], [210, 270], [260, 280],
      [320, 285], [380, 290], [420, 270], [460, 285], [475, 340],
      [470, 420], [445, 490], [400, 530], [330, 520], [270, 480],
      [220, 450], [175, 410],
    ],
    labelAt: [330, 410],
    bbox: [165, 180, 310, 350],
  },
  {
    id: "cape_flats",
    name: "Cape Flats",
    polygon: [
      [460, 285], [540, 295], [660, 300], [780, 305], [900, 310],
      [980, 290], [1000, 250], [1000, 480], [960, 520], [900, 555],
      [830, 580], [760, 595], [680, 600], [590, 595], [500, 580],
      [410, 555], [400, 530], [445, 490], [470, 420], [475, 340],
    ],
    labelAt: [720, 440],
    bbox: [400, 250, 600, 350],
  },
];

export const WARDS: Ward[] = [
  // Atlantic Seaboard (4)
  { id: "green_point", name: "Green Point", zoneId: "atlantic_seaboard",
    polygon: [[80,0],[200,0],[205,90],[195,90],[160,60],[100,40]],
    centroid: [150, 50], postcode: "8005" },
  { id: "sea_point", name: "Sea Point", zoneId: "atlantic_seaboard",
    polygon: [[100,40],[160,60],[195,90],[195,180],[170,170],[125,140]],
    centroid: [160, 120], postcode: "8060" },
  { id: "camps_bay", name: "Camps Bay", zoneId: "atlantic_seaboard",
    polygon: [[125,140],[170,170],[195,180],[180,260],[150,250],[115,220]],
    centroid: [160, 210], postcode: "8040" },
  { id: "hout_bay", name: "Hout Bay", zoneId: "atlantic_seaboard",
    polygon: [[115,220],[150,250],[180,260],[165,320],[150,360],[140,360],[115,300],[95,260]],
    centroid: [140, 290], postcode: "7806" },

  // City Bowl (4)
  { id: "cbd", name: "Cape Town CBD", zoneId: "city_bowl",
    polygon: [[270,0],[430,0],[430,120],[380,130],[320,120],[270,100]],
    centroid: [350, 70], postcode: "8001" },
  { id: "bo_kaap", name: "Bo-Kaap", zoneId: "city_bowl",
    polygon: [[200,0],[270,0],[270,100],[235,110],[210,90],[205,40]],
    centroid: [240, 55], postcode: "8000" },
  { id: "woodstock", name: "Woodstock", zoneId: "city_bowl",
    polygon: [[270,100],[320,120],[380,130],[430,120],[430,200],[380,210],[310,205],[260,190]],
    centroid: [350, 165], postcode: "7925" },
  { id: "salt_river", name: "Salt River", zoneId: "city_bowl",
    polygon: [[260,190],[310,205],[380,210],[430,200],[420,270],[380,290],[320,285],[260,280],[210,270],[235,230]],
    centroid: [340, 245], postcode: "7925" },

  // Northern Suburbs (5)
  { id: "milnerton", name: "Milnerton", zoneId: "northern_suburbs",
    polygon: [[430,0],[600,0],[610,110],[540,120],[470,110],[430,90]],
    centroid: [520, 55], postcode: "7441" },
  { id: "goodwood", name: "Goodwood", zoneId: "northern_suburbs",
    polygon: [[430,90],[470,110],[540,120],[540,200],[470,210],[430,200]],
    centroid: [490, 155], postcode: "7460" },
  { id: "parow", name: "Parow", zoneId: "northern_suburbs",
    polygon: [[540,120],[610,110],[680,130],[670,210],[600,220],[540,200]],
    centroid: [605, 165], postcode: "7500" },
  { id: "bellville", name: "Bellville", zoneId: "northern_suburbs",
    polygon: [[610,0],[820,0],[830,110],[760,130],[680,130],[610,110]],
    centroid: [725, 60], postcode: "7530" },
  { id: "brackenfell", name: "Brackenfell", zoneId: "northern_suburbs",
    polygon: [[820,0],[1000,0],[1000,250],[980,290],[900,295],[830,290],[760,280],[670,275],[670,210],[760,200],[830,180],[890,150],[930,100],[860,60]],
    centroid: [880, 150], postcode: "7560" },

  // Southern Suburbs (5)
  { id: "observatory", name: "Observatory", zoneId: "southern_suburbs",
    polygon: [[195,180],[260,190],[235,230],[210,270],[200,260],[185,220]],
    centroid: [220, 220], postcode: "7925" },
  { id: "mowbray", name: "Mowbray", zoneId: "southern_suburbs",
    polygon: [[210,270],[260,280],[320,285],[330,335],[260,340],[200,320]],
    centroid: [270, 305], postcode: "7700" },
  { id: "rondebosch", name: "Rondebosch", zoneId: "southern_suburbs",
    polygon: [[320,285],[380,290],[420,270],[460,285],[460,340],[400,355],[330,335]],
    centroid: [395, 315], postcode: "7700" },
  { id: "claremont", name: "Claremont", zoneId: "southern_suburbs",
    polygon: [[330,335],[400,355],[460,340],[470,420],[400,430],[340,415]],
    centroid: [400, 385], postcode: "7708" },
  { id: "wynberg", name: "Wynberg", zoneId: "southern_suburbs",
    polygon: [[340,415],[400,430],[470,420],[445,490],[400,530],[330,520],[290,480],[280,440]],
    centroid: [375, 470], postcode: "7800" },

  // Cape Flats (4)
  { id: "athlone", name: "Athlone", zoneId: "cape_flats",
    polygon: [[460,285],[540,295],[600,300],[610,360],[540,370],[475,340]],
    centroid: [535, 330], postcode: "7764" },
  { id: "gugulethu", name: "Gugulethu", zoneId: "cape_flats",
    polygon: [[475,340],[540,370],[610,360],[620,430],[540,450],[470,420]],
    centroid: [545, 400], postcode: "7750" },
  { id: "mitchells_plain", name: "Mitchells Plain", zoneId: "cape_flats",
    polygon: [[470,420],[540,450],[620,430],[660,490],[620,550],[540,560],[470,540],[445,490]],
    centroid: [555, 495], postcode: "7785" },
  { id: "khayelitsha", name: "Khayelitsha", zoneId: "cape_flats",
    polygon: [[600,300],[780,305],[900,310],[980,290],[1000,300],[1000,480],[960,520],[880,540],[780,540],[680,535],[660,490],[620,430],[610,360]],
    centroid: [820, 410], postcode: "7784" },
];

export const ZONE_BY_ID: Record<ZoneId, Zone> = Object.fromEntries(
  ZONES.map((z) => [z.id, z]),
) as Record<ZoneId, Zone>;

export const WARDS_BY_ZONE: Record<ZoneId, Ward[]> = ZONES.reduce((acc, z) => {
  acc[z.id] = WARDS.filter((w) => w.zoneId === z.id);
  return acc;
}, {} as Record<ZoneId, Ward[]>);

export const polygonPoints = (poly: [number, number][]) =>
  poly.map(([x, y]) => `${x},${y}`).join(" ");
