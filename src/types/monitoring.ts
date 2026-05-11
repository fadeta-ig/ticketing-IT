export interface MonitoringTarget {
    id: string;
    name: string;
    address: string;
    type: "IP" | "WEBSITE";
}

export interface MonitoringStatus {
    id: string;
    status: "UP" | "DOWN";
    latency: number | null; // in ms
    lastChecked: Date;
}

export const MONITORING_TARGETS: MonitoringTarget[] = [
    { id: "local-int", name: "Local Internet", address: "192.168.20.1", type: "IP" },
    { id: "uplink", name: "Uplink Server (IP Public)", address: "202.152.141.27", type: "IP" },
    { id: "google", name: "Google DNS", address: "8.8.8.8", type: "IP" },
    { id: "wijaya-web", name: "wijayainovasi.co.id", address: "https://wijayainovasi.co.id", type: "WEBSITE" },
    { id: "mahakarya-web", name: "mahakaryakosmetika.co.id", address: "https://mahakaryakosmetika.co.id", type: "WEBSITE" },
    { id: "shinyoung-web", name: "shinyoungbeauty.com", address: "https://shinyoungbeauty.com", type: "WEBSITE" },
];
