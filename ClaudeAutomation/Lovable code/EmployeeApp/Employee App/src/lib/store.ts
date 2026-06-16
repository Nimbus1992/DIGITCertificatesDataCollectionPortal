import type { Application, HistoryEntry, Notification, RoleId, Session, StageId } from "./types";

// Storage keys (bumped to v5 to include breached-stage seed rows)
const K_APPS = "employee:applications:v5";
const K_NOTIFS = "employee:notifications:v5";
const K_SESSION = "employee:session:v2"; // sessionStorage so each tab can be a different role


// ---------- Seed ----------
const NOW = Date.now();
const DAY = 86_400_000;

type SeedRow = {
  stage: StageId;
  applicant: string;
  phone: string; // last 9 digits
  idNumber: string;
  bizName: string;
  bizType: string;
  suburb: string;
  postcode: string;
  street: string;
  inspector?: string;
  ageDays: number;
};

const SEED_ROWS: SeedRow[] = [
  // submitted (4) — Doc Verifier queue (target 3d, breached >5d)
  { stage: "submitted", applicant: "Sipho Ndlovu", phone: "82 145 6701", idNumber: "8504125678083", bizName: "Sipho Traders", bizType: "Retail", suburb: "Khayelitsha", postcode: "7784", street: "12 Lansdowne Rd", ageDays: 1 },
  { stage: "submitted", applicant: "Naledi Sithole", phone: "73 220 8812", idNumber: "9011234567084", bizName: "Naledi Boutique", bizType: "Retail", suburb: "Claremont", postcode: "7708", street: "44 Main Rd", ageDays: 2 },
  { stage: "submitted", applicant: "Thandi Mokoena", phone: "61 884 2310", idNumber: "8806127654083", bizName: "Thandi Catering", bizType: "Food & Beverage", suburb: "Woodstock", postcode: "7925", street: "8 Albert Rd", ageDays: 4 },
  { stage: "submitted", applicant: "Jaco van der Merwe", phone: "84 332 9912", idNumber: "8201017812085", bizName: "JVM Logistics", bizType: "Transport & Logistics", suburb: "Bellville", postcode: "7530", street: "120 Voortrekker Rd", ageDays: 6 },
  // under_doc_verification (5) — Doc Verifier queue
  { stage: "under_doc_verification", applicant: "Fatima Adams", phone: "78 990 1124", idNumber: "9303194567084", bizName: "Adams Pharmacy", bizType: "Health & Wellness", suburb: "Sea Point", postcode: "8005", street: "67 Regent Rd", ageDays: 1 },
  { stage: "under_doc_verification", applicant: "Lerato Khumalo", phone: "82 102 5567", idNumber: "8709236543080", bizName: "Lerato Salon", bizType: "Health & Wellness", suburb: "Bellville", postcode: "7530", street: "33 Durban Rd", ageDays: 2 },
  { stage: "under_doc_verification", applicant: "Imran Khan", phone: "72 776 4421", idNumber: "8503089876083", bizName: "Imran Spice House", bizType: "Food & Beverage", suburb: "Bo-Kaap", postcode: "8001", street: "21 Chiappini St", ageDays: 4 },
  { stage: "under_doc_verification", applicant: "Khanyi Zulu", phone: "61 442 0091", idNumber: "9112255678082", bizName: "Khanyi Consulting", bizType: "Professional Services", suburb: "CBD", postcode: "8001", street: "15 Long St", ageDays: 5 },
  { stage: "under_doc_verification", applicant: "Marcus van Wyk", phone: "84 551 7720", idNumber: "8001017654084", bizName: "Van Wyk & Sons", bizType: "Construction", suburb: "Milnerton", postcode: "7441", street: "98 Koeberg Rd", ageDays: 7 },
  // inspection_pending (4) — Inspector queue (target 7d, breached >10d)
  { stage: "inspection_pending", applicant: "Riya Singh", phone: "73 887 6610", idNumber: "9404178765083", bizName: "Riya Tutoring Hub", bizType: "Education", suburb: "Rondebosch", postcode: "7700", street: "5 Belmont Rd", inspector: "Sipho Ndlovu", ageDays: 3 },
  { stage: "inspection_pending", applicant: "Bongani Cele", phone: "82 220 4477", idNumber: "8607094321085", bizName: "Bongani Builders", bizType: "Construction", suburb: "Mitchells Plain", postcode: "7785", street: "44 AZ Berman Dr", inspector: "Naledi Sithole", ageDays: 5 },
  { stage: "inspection_pending", applicant: "Yusuf Domingo", phone: "61 113 2278", idNumber: "8211038890082", bizName: "Domingo Bistro", bizType: "Hospitality", suburb: "Green Point", postcode: "8005", street: "27 Somerset Rd", inspector: "Sipho Ndlovu", ageDays: 8 },
  { stage: "inspection_pending", applicant: "Megan Brink", phone: "72 559 1188", idNumber: "9007145678083", bizName: "Brink Workshop", bizType: "Manufacturing", suburb: "Salt River", postcode: "7925", street: "112 Victoria Rd", inspector: "Naledi Sithole", ageDays: 12 },
  // inspection_scheduled (3) — Inspector queue
  { stage: "inspection_scheduled", applicant: "Sanele Maseko", phone: "84 660 9921", idNumber: "8909219876081", bizName: "Maseko Auto Spares", bizType: "Retail", suburb: "Athlone", postcode: "7764", street: "60 Klipfontein Rd", inspector: "Sipho Ndlovu", ageDays: 4 },
  { stage: "inspection_scheduled", applicant: "Ayesha Manuel", phone: "73 220 1145", idNumber: "9202036543084", bizName: "Manuel Bakery", bizType: "Food & Beverage", suburb: "Observatory", postcode: "7925", street: "88 Lower Main Rd", inspector: "Naledi Sithole", ageDays: 9 },
  { stage: "inspection_scheduled", applicant: "Pieter de Villiers", phone: "82 776 5530", idNumber: "7805124321085", bizName: "De Villiers Architects", bizType: "Professional Services", suburb: "Wynberg", postcode: "7800", street: "11 Wolfe St", inspector: "Sipho Ndlovu", ageDays: 13 },
  // payment_pending (4) — Approver queue (target 5d, breached >7d)
  { stage: "payment_pending", applicant: "Nokuthula Buthelezi", phone: "61 443 9981", idNumber: "8808238765082", bizName: "Nokuthula Logistics", bizType: "Transport & Logistics", suburb: "Bellville", postcode: "7530", street: "210 Voortrekker Rd", inspector: "Naledi Sithole", ageDays: 2 },
  { stage: "payment_pending", applicant: "Hassan Salie", phone: "72 998 1102", idNumber: "8104115432081", bizName: "Salie Tailors", bizType: "Retail", suburb: "Bo-Kaap", postcode: "8001", street: "9 Wale St", inspector: "Sipho Ndlovu", ageDays: 4 },
  { stage: "payment_pending", applicant: "Luca Moodley", phone: "84 110 7765", idNumber: "9306189876083", bizName: "Moodley Cafe", bizType: "Food & Beverage", suburb: "CBD", postcode: "8001", street: "78 Bree St", inspector: "Naledi Sithole", ageDays: 6 },
  { stage: "payment_pending", applicant: "Karabo Mahlatsi", phone: "73 220 6678", idNumber: "8702014567084", bizName: "Karabo Gym", bizType: "Health & Wellness", suburb: "Claremont", postcode: "7708", street: "22 Cavendish St", inspector: "Sipho Ndlovu", ageDays: 9 },
  // paid (2) — Approver queue (target 2d, breached >3d)
  { stage: "paid", applicant: "Tanya Roux", phone: "82 554 7711", idNumber: "8410065432087", bizName: "Roux Studio", bizType: "Professional Services", suburb: "Sea Point", postcode: "8005", street: "14 Beach Rd", inspector: "Sipho Ndlovu", ageDays: 1 },
  { stage: "paid", applicant: "Rashid Cassim", phone: "61 998 2200", idNumber: "8311224321085", bizName: "Cassim Hardware", bizType: "Retail", suburb: "Salt River", postcode: "7925", street: "55 Albert Rd", inspector: "Naledi Sithole", ageDays: 4 },
  // issued (4)
  { stage: "issued", applicant: "Joshua Hendricks", phone: "72 110 4456", idNumber: "8005128765084", bizName: "Hendricks Joinery", bizType: "Manufacturing", suburb: "Woodstock", postcode: "7925", street: "120 Sir Lowry Rd", inspector: "Sipho Ndlovu", ageDays: 22 },
  { stage: "issued", applicant: "Chloé Williams", phone: "84 220 9981", idNumber: "8809011234082", bizName: "Williams Yoga Studio", bizType: "Health & Wellness", suburb: "Claremont", postcode: "7708", street: "8 Dean St", inspector: "Naledi Sithole", ageDays: 24 },
  { stage: "issued", applicant: "Ethan Naidoo", phone: "73 998 5512", idNumber: "9105087654083", bizName: "Naidoo Tech Repairs", bizType: "Professional Services", suburb: "Mowbray", postcode: "7700", street: "32 Main Rd", inspector: "Sipho Ndlovu", ageDays: 26 },
  { stage: "issued", applicant: "Zinhle Khumalo", phone: "82 443 1187", idNumber: "8607125678081", bizName: "Zinhle Catering Co", bizType: "Hospitality", suburb: "Green Point", postcode: "8005", street: "44 Main Rd", inspector: "Naledi Sithole", ageDays: 28 },
  // rejected (2)
  { stage: "rejected", applicant: "Marius Botha", phone: "61 110 7720", idNumber: "7905114321084", bizName: "Botha Welding", bizType: "Manufacturing", suburb: "Bellville", postcode: "7530", street: "75 Carl Cronje Dr", inspector: "Sipho Ndlovu", ageDays: 20 },
  { stage: "rejected", applicant: "Aisha Patel", phone: "72 554 9920", idNumber: "8810136543082", bizName: "Patel Daycare", bizType: "Education", suburb: "Rondebosch", postcode: "7700", street: "19 Campground Rd", inspector: "Naledi Sithole", ageDays: 19 },
  // breached SLA rows (5) — ageDays exceeds stage atRisk threshold so SlaBadge renders "Breached"
  { stage: "submitted", applicant: "Andiswa Mbeki", phone: "84 220 5571", idNumber: "8902115678084", bizName: "Mbeki Stationers", bizType: "Retail", suburb: "Athlone", postcode: "7764", street: "30 Klipfontein Rd", ageDays: 8 },
  { stage: "under_doc_verification", applicant: "Tariq Williams", phone: "72 110 8843", idNumber: "8505149876082", bizName: "Williams Print House", bizType: "Manufacturing", suburb: "Woodstock", postcode: "7925", street: "210 Albert Rd", ageDays: 9 },
  { stage: "inspection_pending", applicant: "Refilwe Mokoena", phone: "61 330 9921", idNumber: "9008218765083", bizName: "Mokoena Couriers", bizType: "Transport & Logistics", suburb: "Mitchells Plain", postcode: "7785", street: "88 AZ Berman Dr", inspector: "Sipho Ndlovu", ageDays: 14 },
  { stage: "payment_pending", applicant: "Ebrahim Davids", phone: "82 998 4410", idNumber: "8407124321081", bizName: "Davids Cold Storage", bizType: "Food & Beverage", suburb: "Salt River", postcode: "7925", street: "44 Voortrekker Rd", inspector: "Naledi Sithole", ageDays: 12 },
  { stage: "paid", applicant: "Lindiwe Khoza", phone: "73 446 1102", idNumber: "9112076543084", bizName: "Khoza Day Spa", bizType: "Health & Wellness", suburb: "Sea Point", postcode: "8005", street: "100 Main Rd", inspector: "Sipho Ndlovu", ageDays: 6 },
];


const STAGE_ORDER: StageId[] = [
  "submitted", "under_doc_verification", "inspection_pending",
  "inspection_scheduled", "payment_pending", "paid", "issued",
];

function buildHistory(row: SeedRow, createdAt: number): HistoryEntry[] {
  const targetIdx = row.stage === "rejected"
    ? STAGE_ORDER.indexOf("inspection_scheduled")
    : STAGE_ORDER.indexOf(row.stage);
  const entries: HistoryEntry[] = [];
  const stages = row.stage === "rejected"
    ? [...STAGE_ORDER.slice(0, targetIdx + 1), "rejected" as StageId]
    : STAGE_ORDER.slice(0, targetIdx + 1);
  const step = (row.ageDays * DAY) / Math.max(stages.length, 1);
  stages.forEach((s, i) => {
    const at = createdAt + Math.round(step * i);
    const byRole: HistoryEntry["byRole"] =
      s === "submitted" ? "citizen"
      : s === "under_doc_verification" ? "document_verifier"
      : s === "inspection_pending" || s === "inspection_scheduled" ? "field_inspector"
      : s === "payment_pending" || s === "paid" ? "citizen"
      : "approver";
    const by =
      s === "submitted" || s === "payment_pending" || s === "paid" ? row.applicant
      : s === "under_doc_verification" ? "Priya Sharma"
      : s === "inspection_pending" || s === "inspection_scheduled" ? (row.inspector ?? "Sipho Ndlovu")
      : "Anita Reddy";
    const note =
      s === "submitted" ? "Application submitted by citizen."
      : s === "under_doc_verification" ? "Document verification started."
      : s === "inspection_pending" ? "Forwarded for field inspection."
      : s === "inspection_scheduled" ? `Inspection scheduled with ${row.inspector ?? "field officer"}.`
      : s === "payment_pending" ? "Issuance invoice raised."
      : s === "paid" ? "Citizen payment confirmed."
      : s === "issued" ? "Business license issued."
      : "Application rejected.";
    entries.push({ stageId: s, at, by, byRole, note });
  });
  return entries;
}

const SUB_CATEGORY: Record<string, string[]> = {
  Retail: ["General Store", "Boutique", "Auto Spares", "Hardware"],
  "Food & Beverage": ["Bakery", "Bistro", "Café", "Catering"],
  "Health & Wellness": ["Pharmacy", "Salon", "Yoga Studio", "Gym"],
  "Professional Services": ["Consulting", "Architects", "Studio", "Tech Repairs"],
  Construction: ["Contractor", "Joinery", "Welding", "Builders"],
  Manufacturing: ["Workshop", "Joinery", "Welding", "Fabrication"],
  Hospitality: ["Bistro", "Catering", "Guesthouse", "Bar"],
  Education: ["Tutoring", "Daycare", "Training", "Academy"],
  "Transport & Logistics": ["Logistics", "Couriers", "Fleet", "Warehousing"],
};

const SUBURB_ZONE: Record<string, string> = {
  CBD: "Subcouncil 16 — CBD / Atlantic Seaboard",
  "Bo-Kaap": "Subcouncil 16 — CBD / Atlantic Seaboard",
  "Sea Point": "Subcouncil 16 — CBD / Atlantic Seaboard",
  "Green Point": "Subcouncil 16 — CBD / Atlantic Seaboard",
  Woodstock: "Subcouncil 15 — Table Bay",
  "Salt River": "Subcouncil 15 — Table Bay",
  Observatory: "Subcouncil 20 — Southern Suburbs",
  Mowbray: "Subcouncil 20 — Southern Suburbs",
  Rondebosch: "Subcouncil 20 — Southern Suburbs",
  Claremont: "Subcouncil 20 — Southern Suburbs",
  Wynberg: "Subcouncil 20 — Southern Suburbs",
  Athlone: "Subcouncil 17 — Athlone / Cape Flats",
  "Mitchells Plain": "Subcouncil 24 — Mitchells Plain",
  Khayelitsha: "Subcouncil 9 — Khayelitsha",
  Bellville: "Subcouncil 5 — Northern Suburbs",
  Milnerton: "Subcouncil 4 — Blaauwberg",
};

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
}

function seedApplications(): Application[] {
  return SEED_ROWS.map((row, i) => {
    const createdAt = NOW - row.ageDays * DAY;
    const updatedAt = NOW - Math.floor(row.ageDays * DAY * 0.15);
    const issuance = 280 + ((i * 47) % 1120);
    const verification = 35 + ((i * 11) % 55);
    const docStatus =
      row.stage === "submitted" ? "Pending"
      : row.stage === "rejected" ? "Rejected"
      : "Verified";
    const issuancePaid = row.stage === "paid" || row.stage === "issued";
    const arn = `TL-${createdAt.toString().slice(-9)}-${String(100 + i)}`;
    const subs = SUB_CATEGORY[row.bizType] ?? ["General"];
    const subCategory = subs[i % subs.length];
    const ownerships = ["Proprietorship", "Partnership", "Pty Ltd", "Close Corporation"];
    const ownership = ownerships[i % ownerships.length];
    const employees = 2 + ((i * 3) % 18);
    const annualTurnover = 250_000 + ((i * 137_500) % 4_750_000);
    const shopArea = 80 + ((i * 37) % 520);
    const hazardous = row.bizType === "Manufacturing" || row.bizType === "Construction";
    const startDate = new Date(createdAt - (180 + (i % 600)) * DAY).toISOString().slice(0, 10);
    const email = `${slug(row.applicant)}@capetown.demo`;
    const app: Application = {
      id: arn,
      serviceId: "business_license",
      serviceLabel: "Business License",
      applicantName: row.applicant,
      phone: `+27 ${row.phone}`,
      email,
      idType: "South African ID",
      idNumber: row.idNumber,
      business: {
        name: row.bizName,
        type: row.bizType,
        address: `${row.street}, ${row.suburb}, Cape Town ${row.postcode}`,
        category: row.bizType,
        subCategory,
        ownership,
        employees,
        annualTurnover,
      },
      location: {
        line1: row.street,
        line2: row.suburb,
        city: "Cape Town",
        zone: SUBURB_ZONE[row.suburb] ?? "Subcouncil 16 — CBD / Atlantic Seaboard",
        postalCode: row.postcode,
      },
      operations: {
        startDate,
        shopAreaSqft: shopArea,
        hazardous,
      },
      documents: [
        { fieldId: "id_proof", name: "ID Proof", fileName: "south-african-id.pdf", status: docStatus, rejectionReason: docStatus === "Rejected" ? "Document illegible — please re-upload." : undefined },
        { fieldId: "address_proof", name: "Address Proof", fileName: "proof-of-address.pdf", status: docStatus },
        { fieldId: "business_proof", name: "Business Proof", fileName: "business-registration.pdf", status: docStatus },
      ],
      currentStageId: row.stage,
      fees: {
        verification: {
          label: "Verification Fee",
          fee: verification, tax: Math.round(verification * 0.1),
          status: "Paid",
          txnId: `TXN${10_000_000 + i * 137}`,
          paidAt: createdAt + 3600_000,
        },
        issuance: {
          label: "Issuance Fee",
          fee: issuance, tax: Math.round(issuance * 0.1),
          status: issuancePaid ? "Paid" : "Awaiting",
          txnId: issuancePaid ? `TXN${20_000_000 + i * 211}` : undefined,
          paidAt: issuancePaid ? updatedAt - 3600_000 : undefined,
          dueLabel: issuancePaid ? undefined : "Pay by due date",
        },
      },
      inspection: row.inspector ? {
        inspectorName: row.inspector,
        slot: ["09:00–11:00", "11:00–13:00", "14:00–16:00"][i % 3],
        scheduledAt: createdAt + 5 * DAY,
        report: ["issued", "paid", "payment_pending"].includes(row.stage)
          ? { findings: "Premises compliant. Signage and safety norms verified.", recommendation: "pass", signedAt: createdAt + 6 * DAY }
          : row.stage === "rejected"
            ? { findings: "Non-compliant signage and missing fire safety certificate.", recommendation: "fail", signedAt: createdAt + 6 * DAY }
            : undefined,
      } : undefined,
      licenseNumber: row.stage === "issued" ? `TL/${new Date(updatedAt).getFullYear()}/${10_000 + i * 73}` : undefined,
      licenseIssuedAt: row.stage === "issued" ? updatedAt : undefined,
      history: buildHistory(row, createdAt),
      createdAt, updatedAt,
    };
    return app;
  });
}


function seedNotifications(apps: Application[]): Notification[] {
  const out: Notification[] = [];
  const mk = (appId: string, audience: Notification["audience"], title: string, body: string, channel: Notification["channel"], minsAgo: number) => {
    out.push({ id: `n-${appId}-${audience}-${minsAgo}`, appId, audience, channel, title, body, at: NOW - minsAgo * 60_000, read: false });
  };
  apps.forEach((a, i) => {
    if (a.currentStageId === "submitted") mk(a.id, "document_verifier", "New application", `${a.applicantName} submitted a Business License application.`, "in_app", 10 + i * 7);
    if (a.currentStageId === "under_doc_verification") mk(a.id, "document_verifier", "Awaiting verification", `${a.id} pending document review.`, "in_app", 20 + i * 9);
    if (a.currentStageId === "inspection_pending" || a.currentStageId === "inspection_scheduled")
      mk(a.id, "field_inspector", "Inspection assigned", `${a.id} (${a.business?.name}) awaiting inspection.`, "in_app", 15 + i * 11);
    if (a.currentStageId === "payment_pending" || a.currentStageId === "paid")
      mk(a.id, "approver", "Approval pending", `${a.id} ready for review.`, "in_app", 25 + i * 13);
    if (a.currentStageId === "issued")
      mk(a.id, "citizen", "License issued", `Business License ${a.licenseNumber} issued.`, "sms", 60 + i * 5);
  });
  return out.slice(0, 40);
}

// ---------- Internal state ----------
type State = {
  applications: Application[];
  notifications: Notification[];
};

const isBrowser = typeof window !== "undefined";

function readJSON<T>(key: string, fallback: T, storage: Storage): T {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown, storage: Storage) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function loadState(): State {
  if (!isBrowser) {
    const apps = seedApplications();
    return { applications: apps, notifications: seedNotifications(apps) };
  }
  let apps = readJSON<Application[] | null>(K_APPS, null, localStorage);
  if (!apps || apps.length === 0) {
    apps = seedApplications();
    writeJSON(K_APPS, apps, localStorage);
  }
  let notifs = readJSON<Notification[] | null>(K_NOTIFS, null, localStorage);
  if (!notifs) {
    notifs = seedNotifications(apps);
    writeJSON(K_NOTIFS, notifs, localStorage);
  }
  return { applications: apps, notifications: notifs };
}

let state: State = loadState();
const serverState: State = { applications: seedApplications(), notifications: [] };
const listeners = new Set<() => void>();

let channel: BroadcastChannel | null = null;
if (isBrowser && typeof BroadcastChannel !== "undefined") {
  try {
    channel = new BroadcastChannel("employee-sync-v2");
    channel.onmessage = () => {
      state = loadState();
      listeners.forEach((l) => l());
    };
  } catch {
    /* ignore */
  }
}

if (isBrowser) {
  window.addEventListener("storage", (e) => {
    if (e.key === K_APPS || e.key === K_NOTIFS) {
      state = loadState();
      listeners.forEach((l) => l());
    }
  });
}

function commit() {
  if (isBrowser) {
    writeJSON(K_APPS, state.applications, localStorage);
    writeJSON(K_NOTIFS, state.notifications, localStorage);
    channel?.postMessage({ t: Date.now() });
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot(): State {
  return state;
}

function getServerSnapshot(): State {
  return serverState;
}

// ---------- Public store ----------
import { useSyncExternalStore } from "react";

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(getSnapshot()), () => selector(getServerSnapshot()));
}

export function getApplications() {
  return state.applications;
}

export function getApplication(id: string) {
  return state.applications.find((a) => a.id === id);
}

// ---------- Session (per-tab, sessionStorage) ----------
let sessionState: Session | null = isBrowser
  ? readJSON<Session | null>(K_SESSION, null, sessionStorage)
  : null;
const sessionListeners = new Set<() => void>();

export function getSession(): Session | null {
  return sessionState;
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    (l) => {
      sessionListeners.add(l);
      return () => sessionListeners.delete(l);
    },
    () => sessionState,
    () => null,
  );
}

export function login(session: Session) {
  sessionState = session;
  if (isBrowser) writeJSON(K_SESSION, session, sessionStorage);
  sessionListeners.forEach((l) => l());
}

export function logout() {
  sessionState = null;
  if (isBrowser) sessionStorage.removeItem(K_SESSION);
  sessionListeners.forEach((l) => l());
}

// ---------- Workflow ----------
function nextStageLabel(s: StageId): string {
  return STAGE_LABELS[s];
}

export const STAGE_LABELS: Record<StageId, string> = {
  submitted: "Submitted",
  under_doc_verification: "Under Document Verification",
  inspection_pending: "Inspection Pending",
  inspection_scheduled: "Inspection Scheduled",
  payment_pending: "Payment Pending",
  paid: "Paid",
  issued: "License Issued",
  rejected: "Rejected",
};

export const STAGE_TONE: Record<
  StageId,
  "info" | "warning" | "success" | "danger" | "primary"
> = {
  submitted: "info",
  under_doc_verification: "warning",
  inspection_pending: "info",
  inspection_scheduled: "info",
  payment_pending: "warning",
  paid: "success",
  issued: "success",
  rejected: "danger",
};

function patchApp(id: string, patch: Partial<Application>, entry?: Omit<HistoryEntry, "at">) {
  state = {
    ...state,
    applications: state.applications.map((a) => {
      if (a.id !== id) return a;
      const updated: Application = { ...a, ...patch, updatedAt: Date.now() };
      if (entry) updated.history = [...a.history, { ...entry, at: Date.now() }];
      return updated;
    }),
  };
}

function pushNotif(n: Omit<Notification, "id" | "at" | "read">) {
  state = {
    ...state,
    notifications: [
      { ...n, id: crypto.randomUUID(), at: Date.now(), read: false },
      ...state.notifications,
    ].slice(0, 200),
  };
}



// ---------- Actions ----------
export function startDocVerification(appId: string, by: string) {
  const app = getApplication(appId);
  if (!app || app.currentStageId !== "submitted") return;
  patchApp(
    appId,
    { currentStageId: "under_doc_verification" },
    { stageId: "under_doc_verification", by, byRole: "document_verifier", note: "Document verification started." },
  );
  pushNotif({
    appId,
    audience: "citizen",
    channel: "sms",
    title: `Application ${appId}`,
    body: `Your application is now under document verification.`,
  });
  commit();
}

export function setDocumentStatus(
  appId: string,
  fieldId: string,
  status: "Verified" | "Rejected",
  reason: string | undefined,
  by: string,
) {
  const app = getApplication(appId);
  if (!app) return;
  patchApp(appId, {
    documents: app.documents.map((d) =>
      d.fieldId === fieldId ? { ...d, status, rejectionReason: reason } : d,
    ),
  });
  commit();
}

export function verifyApplication(appId: string, by: string) {
  const app = getApplication(appId);
  if (!app || app.currentStageId !== "under_doc_verification") return;
  const allVerified = app.documents.every((d) => d.status === "Verified");
  if (!allVerified) return;
  patchApp(
    appId,
    { currentStageId: "inspection_pending" },
    { stageId: "inspection_pending", by, byRole: "document_verifier", note: "All documents verified. Forwarded to Field Inspector." },
  );
  pushNotif({
    appId,
    audience: "field_inspector",
    channel: "in_app",
    title: `New inspection assigned`,
    body: `${appId} forwarded for field inspection.`,
  });
  pushNotif({
    appId,
    audience: "citizen",
    channel: "sms",
    title: `Application ${appId}`,
    body: `Documents verified. Inspection scheduled shortly.`,
  });
  commit();
}

export function scheduleInspection(
  appId: string,
  data: { scheduledAt: number; inspectorName: string; slot: string },
  by: string,
) {
  const app = getApplication(appId);
  if (!app) return;
  patchApp(
    appId,
    {
      currentStageId: "inspection_scheduled",
      inspection: { ...app.inspection, ...data },
    },
    {
      stageId: "inspection_scheduled",
      by,
      byRole: "field_inspector",
      note: `Inspection scheduled for ${new Date(data.scheduledAt).toLocaleDateString()} (${data.slot}) with ${data.inspectorName}.`,
    },
  );
  pushNotif({
    appId,
    audience: "citizen",
    channel: "sms",
    title: `Inspection Scheduled`,
    body: `Inspection on ${new Date(data.scheduledAt).toLocaleDateString()} (${data.slot}).`,
  });
  commit();
}

export function completeInspection(
  appId: string,
  report: { findings: string; recommendation: "pass" | "fail" | "conditional" },
  by: string,
) {
  const app = getApplication(appId);
  if (!app) return;
  if (report.recommendation === "fail") {
    patchApp(
      appId,
      {
        currentStageId: "rejected",
        inspection: { ...app.inspection, report: { ...report, signedAt: Date.now() } },
      },
      { stageId: "rejected", by, byRole: "field_inspector", note: `Inspection failed: ${report.findings}` },
    );
    pushNotif({
      appId,
      audience: "citizen",
      channel: "sms",
      title: `Application Rejected`,
      body: `Your application was rejected after inspection.`,
    });
  } else {
    patchApp(
      appId,
      {
        currentStageId: "payment_pending",
        inspection: { ...app.inspection, report: { ...report, signedAt: Date.now() } },
      },
      {
        stageId: "payment_pending",
        by,
        byRole: "field_inspector",
        note: `Inspection ${report.recommendation === "pass" ? "passed" : "conditional"}. Citizen invoice raised.`,
      },
    );
    pushNotif({
      appId,
      audience: "citizen",
      channel: "sms",
      title: `Pay Issuance Fee`,
      body: `Inspection complete. Pay R ${(app.fees.issuance.fee + app.fees.issuance.tax).toLocaleString("en-ZA")} to issue license.`,
    });
    pushNotif({
      appId,
      audience: "approver",
      channel: "in_app",
      title: `Approval pending`,
      body: `${appId} awaiting citizen payment.`,
    });
  }
  commit();
}

export function markCitizenPaid(appId: string) {
  const app = getApplication(appId);
  if (!app || app.currentStageId !== "payment_pending") return;
  const txn = "TXN" + Math.floor(10000000 + Math.random() * 89999999).toString();
  patchApp(
    appId,
    {
      currentStageId: "paid",
      fees: {
        ...app.fees,
        issuance: {
          ...app.fees.issuance,
          status: "Paid",
          txnId: txn,
          paidAt: Date.now(),
          dueLabel: undefined,
        },
      },
    },
    {
      stageId: "paid",
      by: "Payment Gateway",
      byRole: "citizen",
      note: `Citizen paid R ${(app.fees.issuance.fee + app.fees.issuance.tax).toLocaleString("en-ZA")} (${txn}).`,
    },
  );
  pushNotif({
    appId,
    audience: "approver",
    channel: "in_app",
    title: `Ready for issuance`,
    body: `${appId} payment received. License can be issued.`,
  });
  commit();
}

export function issueLicense(appId: string, by: string) {
  const app = getApplication(appId);
  if (!app || app.currentStageId !== "paid") return;
  const yr = new Date().getFullYear();
  const num = "TL/" + yr + "/" + Math.floor(10000 + Math.random() * 89999).toString();
  patchApp(
    appId,
    { currentStageId: "issued", licenseNumber: num, licenseIssuedAt: Date.now() },
    { stageId: "issued", by, byRole: "approver", note: `License ${num} issued.` },
  );
  pushNotif({
    appId,
    audience: "citizen",
    channel: "sms",
    title: `License Issued`,
    body: `Your Business License ${num} has been issued.`,
  });
  commit();
}

// ---------- Citizen payment simulator (background) ----------
// Runs in every tab but is idempotent (markCitizenPaid is no-op outside payment_pending).
let simulatorStarted = false;
export function startCitizenSimulator() {
  if (!isBrowser || simulatorStarted) return;
  simulatorStarted = true;
  setInterval(() => {
    const due = state.applications.filter((a) => a.currentStageId === "payment_pending");
    for (const a of due) {
      const since = Date.now() - a.updatedAt;
      if (since > 8000) markCitizenPaid(a.id);
    }
  }, 1500);
}
