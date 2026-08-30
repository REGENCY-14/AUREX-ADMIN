/**
 * The Application Review Queue's own data — investor and business owner
 * applications, at whatever stage of review Admin has left them in. No
 * backend exists yet; mock data is shaped like what a real application
 * table would hold, including the approved/rejected historical rows so
 * the queue isn't only ever "pending".
 *
 * Nickname is collected up front (same site-wide rule as everywhere else
 * — see the main site's apply/ Nickname steps); `realName` only ever
 * shows up here, in this internal review queue, never on anything public.
 */

export type ApplicationTrack = "investor" | "business";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export type DocumentRef = { fileName: string; uploadedAt: string };

export type Application = {
  id: string;
  nickname: string;
  realName: string;
  email: string;
  phone: string;
  country: string;
  track: ApplicationTrack;
  submittedAt: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  idDocument: DocumentRef;
  // Business Owner track only:
  businessName?: string;
  businessDescription?: string;
  fundingGoalGhs?: number;
  businessRegDocument?: DocumentRef;
};

export const APPLICATIONS: Application[] = [
  {
    id: "app-01",
    nickname: "CrestlineJ",
    realName: "Efua Mensah",
    email: "efua.m@example.com",
    phone: "+233 24 101 1010",
    country: "Ghana",
    track: "investor",
    submittedAt: "2026-08-20",
    status: "pending",
    idDocument: { fileName: "crestlinej-id.jpg", uploadedAt: "2026-08-20" },
  },
  {
    id: "app-02",
    nickname: "BrewCollectiveHQ",
    realName: "Kojo Antwi",
    email: "kojo.antwi@example.com",
    phone: "+233 24 202 2020",
    country: "Ghana",
    track: "business",
    submittedAt: "2026-08-22",
    status: "pending",
    idDocument: { fileName: "brewcollectivehq-id.jpg", uploadedAt: "2026-08-22" },
    businessName: "Accra Brew Collective",
    businessDescription: "A small-batch craft brewery supplying bars and restaurants across Accra.",
    fundingGoalGhs: 25_000,
    businessRegDocument: { fileName: "accra-brew-new-certificate.pdf", uploadedAt: "2026-08-22" },
  },
  {
    id: "app-03",
    nickname: "MidasTouch",
    realName: "Yaw Darko",
    email: "yaw.darko@example.com",
    phone: "+233 24 303 3030",
    country: "Ghana",
    track: "investor",
    submittedAt: "2026-08-24",
    status: "pending",
    idDocument: { fileName: "midastouch-id.jpg", uploadedAt: "2026-08-24" },
  },
  {
    id: "app-04",
    nickname: "EmberYield",
    realName: "Adwoa Nyarko",
    email: "adwoa.nyarko@example.com",
    phone: "+233 24 404 4040",
    country: "Ghana",
    track: "investor",
    submittedAt: "2026-08-25",
    status: "pending",
    idDocument: { fileName: "emberyield-id.jpg", uploadedAt: "2026-08-25" },
  },
  {
    id: "app-05",
    nickname: "IronVault",
    realName: "Kwame Mensah",
    email: "kwame.mensah@example.com",
    phone: "+233 24 111 2222",
    country: "Ghana",
    track: "investor",
    submittedAt: "2025-10-28",
    status: "approved",
    idDocument: { fileName: "ironvault-id.jpg", uploadedAt: "2025-10-28" },
  },
  {
    id: "app-06",
    nickname: "NorthStarX",
    realName: "Ama Boateng",
    email: "ama.boateng@example.com",
    phone: "+233 24 222 3333",
    country: "Ghana",
    track: "investor",
    submittedAt: "2025-11-05",
    status: "approved",
    idDocument: { fileName: "northstarx-id.jpg", uploadedAt: "2025-11-05" },
  },
  {
    id: "app-07",
    nickname: "HarvestHQ",
    realName: "Abena Sarpong",
    email: "abena@greenharvestfoods.example.com",
    phone: "+233 24 666 7777",
    country: "Ghana",
    track: "business",
    submittedAt: "2025-10-12",
    status: "approved",
    idDocument: { fileName: "harvesthq-id.jpg", uploadedAt: "2025-10-12" },
    businessName: "GreenHarvest Foods",
    businessDescription:
      "GreenHarvest Foods packages and distributes locally-grown produce across Accra, working directly with smallholder farmers.",
    fundingGoalGhs: 50_000,
    businessRegDocument: { fileName: "greenharvest-certificate.pdf", uploadedAt: "2025-10-10" },
  },
  {
    id: "app-08",
    nickname: "FreightAtlas",
    realName: "Kwabena Osei",
    email: "kwabena@atlasfreight.example.com",
    phone: "+233 24 777 8888",
    country: "Ghana",
    track: "business",
    submittedAt: "2025-09-10",
    status: "approved",
    idDocument: { fileName: "freightatlas-id.jpg", uploadedAt: "2025-09-10" },
    businessName: "Atlas Freight Logistics",
    businessDescription: "Atlas Freight Logistics runs a fleet of trucks moving goods between Accra, Kumasi, and Takoradi.",
    fundingGoalGhs: 40_000,
    businessRegDocument: { fileName: "atlas-freight-certificate.pdf", uploadedAt: "2025-09-08" },
  },
  {
    id: "app-09",
    nickname: "GoldFalcon",
    realName: "Efua Asante",
    email: "efua.asante@example.com",
    phone: "+233 24 444 5555",
    country: "Ghana",
    track: "investor",
    submittedAt: "2026-01-10",
    status: "approved",
    idDocument: { fileName: "goldfalcon-id.jpg", uploadedAt: "2026-01-10" },
  },
  {
    id: "app-10",
    nickname: "NightOwlCap",
    realName: "Priscilla Owusu",
    email: "priscilla.owusu@example.com",
    phone: "+233 24 505 5050",
    country: "Ghana",
    track: "investor",
    submittedAt: "2026-08-15",
    status: "rejected",
    rejectionReason: "ID document image unreadable. Asked applicant to resubmit a clearer scan.",
    idDocument: { fileName: "nightowlcap-id.jpg", uploadedAt: "2026-08-15" },
  },
  {
    id: "app-11",
    nickname: "QuickServeHQ",
    realName: "Michael Boakye",
    email: "michael.boakye@example.com",
    phone: "+233 24 606 6060",
    country: "Ghana",
    track: "business",
    submittedAt: "2026-08-10",
    status: "rejected",
    rejectionReason: "Funding goal exceeds the platform maximum for a first-time listing.",
    idDocument: { fileName: "quickservehq-id.jpg", uploadedAt: "2026-08-10" },
    businessName: "QuickServe Logistics",
    businessDescription: "A same-day courier service for small businesses in Accra.",
    fundingGoalGhs: 120_000,
    businessRegDocument: { fileName: "quickserve-certificate.pdf", uploadedAt: "2026-08-10" },
  },
];

export function getApplications(): Application[] {
  return APPLICATIONS;
}

export function getApplicationById(id: string): Application | undefined {
  return APPLICATIONS.find((a) => a.id === id);
}

export function getPendingApplicationCount(): number {
  return APPLICATIONS.filter((a) => a.status === "pending").length;
}
