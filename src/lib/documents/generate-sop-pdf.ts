import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    COMPANY_NAME, DEPARTMENT, DOC_DATE,
    DAILY_TASKS, WEEKLY_TASKS, MONTHLY_TASKS,
    SLA_REQUESTS, type TaskSopItem,
} from "./sop-data";

const PRIMARY = [15, 23, 42] as const;      // Deep navy
const ACCENT = [59, 130, 246] as const;      // Blue-500
const LIGHT_BG = [248, 250, 252] as const;   // Slate-50
const WHITE = [255, 255, 255] as const;

function addHeader(doc: jsPDF, title: string) {
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageW, 42, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...WHITE);
    doc.text(COMPANY_NAME.toUpperCase(), 20, 18);
    doc.setFontSize(9);
    doc.setFont("times", "normal");
    doc.text(DEPARTMENT, 20, 26);
    doc.setFontSize(9);
    doc.text(`Tanggal: ${DOC_DATE}`, pageW - 20, 18, { align: "right" });
    doc.text(`Dokumen: ${title}`, pageW - 20, 26, { align: "right" });
}

function addFooter(doc: jsPDF) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text("CONFIDENTIAL - " + COMPANY_NAME, 20, pageH - 10);
        doc.text(`Halaman ${i} / ${totalPages}`, pageW - 20, pageH - 10, { align: "right" });
        doc.setDrawColor(220);
        doc.line(20, pageH - 15, pageW - 20, pageH - 15);
    }
}

function addSectionTitle(doc: jsPDF, text: string, y: number): number {
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...PRIMARY);
    doc.text(text, 20, y);
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.8);
    doc.line(20, y + 2, 80, y + 2);
    return y + 10;
}

function addTaskTable(doc: jsPDF, tasks: TaskSopItem[], startY: number): number {
    autoTable(doc, {
        startY,
        head: [["No", "Tugas", "Standard Operating Procedure (SOP)"]],
        body: tasks.map((t) => [t.no.toString(), t.title, t.sop]),
        theme: "grid",
        headStyles: { fillColor: [...PRIMARY], fontSize: 11, fontStyle: "bold", cellPadding: 5, textColor: [...WHITE], halign: "center" },
        bodyStyles: { fontSize: 11, cellPadding: 5, textColor: [30, 30, 30], lineColor: [230, 230, 230], halign: "justify" },
        alternateRowStyles: { fillColor: [...LIGHT_BG] },
        columnStyles: {
            0: { cellWidth: 12, halign: "center", fontStyle: "bold" },
            1: { cellWidth: 55, fontStyle: "bold", halign: "left" },
            2: { cellWidth: "auto" },
        },
        margin: { left: 20, right: 20 },
        didDrawPage: () => addHeader(doc, "SOP IT"),
    });
    return (doc as any).lastAutoTable.finalY + 12;
}

export function generateSopPdf(): void {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Cover Page ───────────────────────────────────────
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageW, 297, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(36);
    doc.setTextColor(...WHITE);
    doc.text("SOP", 20, 100);
    doc.setFontSize(14);
    doc.text("Standard Operating Procedure", 20, 115);
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(1.5);
    doc.line(20, 122, 120, 122);
    doc.setFontSize(14);
    doc.setFont("times", "normal");
    doc.text(DEPARTMENT, 20, 135);
    doc.text(COMPANY_NAME, 20, 145);
    doc.setFontSize(9);
    doc.text(DOC_DATE, 20, 165);
    doc.text("Versi 1.0 — Berlaku sejak diterbitkan", 20, 175);

    // ── Page 2: Pendahuluan ──────────────────────────────
    doc.addPage();
    addHeader(doc, "SOP IT");
    let y = 55;
    y = addSectionTitle(doc, "1. PENDAHULUAN", y);
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(30);
    const intro = `Dokumen ini berisi Standard Operating Procedure (SOP) untuk seluruh kegiatan operasional Departemen IT di ${COMPANY_NAME}. SOP ini menjadi acuan bagi seluruh personel IT dalam menjalankan tugas harian, mingguan, dan bulanan guna menjaga ketersediaan, keamanan, dan performa seluruh infrastruktur serta layanan teknologi informasi perusahaan.`;
    doc.text(intro, 20, y, { maxWidth: pageW - 40, align: "justify" });
    y += 35;
    y = addSectionTitle(doc, "1.1 Tujuan", y);
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const purposes = [
        "Menjamin kontinuitas operasional sistem IT perusahaan.",
        "Menetapkan standar prosedur yang konsisten dan terukur.",
        "Meminimalkan risiko downtime dan insiden keamanan.",
        "Mendukung pencapaian target SLA (Service Level Agreement).",
    ];
    purposes.forEach((p) => { doc.text(`•  ${p}`, 24, y); y += 7; });

    // ── Tugas Harian ─────────────────────────────────────
    y += 5;
    y = addSectionTitle(doc, "2. TUGAS HARIAN (DAILY)", y);
    y = addTaskTable(doc, DAILY_TASKS, y);

    // ── Tugas Mingguan ───────────────────────────────────
    y = addSectionTitle(doc, "3. TUGAS MINGGUAN (WEEKLY)", y);
    y = addTaskTable(doc, WEEKLY_TASKS, y);

    // ── Tugas Bulanan ────────────────────────────────────
    y = addSectionTitle(doc, "4. TUGAS BULANAN (MONTHLY)", y);
    y = addTaskTable(doc, MONTHLY_TASKS, y);

    // ── SLA Request ──────────────────────────────────────
    y = addSectionTitle(doc, "5. SLA REQUEST — TARGET WAKTU PENYELESAIAN", y);
    autoTable(doc, {
        startY: y,
        head: [["No", "Kategori Permintaan", "Target Waktu", "Keterangan"]],
        body: SLA_REQUESTS.map((s, i) => [(i + 1).toString(), s.category, s.target, s.notes]),
        theme: "grid",
        headStyles: { fillColor: [...ACCENT], fontSize: 11, fontStyle: "bold", cellPadding: 5, textColor: [...WHITE], halign: "center" },
        bodyStyles: { fontSize: 11, cellPadding: 5, textColor: [30, 30, 30], lineColor: [230, 230, 230] },
        alternateRowStyles: { fillColor: [...LIGHT_BG] },
        columnStyles: {
            0: { cellWidth: 12, halign: "center", fontStyle: "bold" },
            1: { cellWidth: 60, halign: "left" },
            2: { cellWidth: 40, halign: "center", fontStyle: "bold" },
            3: { cellWidth: "auto", halign: "justify" },
        },
        margin: { left: 20, right: 20 },
        didDrawPage: () => addHeader(doc, "SOP IT"),
    });

    addFooter(doc);
    doc.save("SOP_IT_PT_Wijaya_Inovasi_Gemilang.pdf");
}
