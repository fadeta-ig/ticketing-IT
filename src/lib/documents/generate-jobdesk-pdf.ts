import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    COMPANY_NAME, DEPARTMENT, DOC_DATE,
    JOBDESK_IT_MANAGER, JOBDESK_IT_INFRA, JOBDESK_IT_DEV,
    DAILY_TASKS, WEEKLY_TASKS, MONTHLY_TASKS,
    SLA_REQUESTS,
} from "./sop-data";

const PRIMARY = [15, 23, 42] as const;
const ACCENT = [59, 130, 246] as const;
const WHITE = [255, 255, 255] as const;
const LIGHT_BG = [248, 250, 252] as const;

function addHeader(doc: jsPDF) {
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageW, 42, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(COMPANY_NAME.toUpperCase(), 20, 18);
    doc.setFontSize(9);
    doc.setFont("times", "normal");
    doc.text(DEPARTMENT, 20, 26);
    doc.text(`Tanggal: ${DOC_DATE}`, pageW - 20, 18, { align: "right" });
    doc.text("Dokumen: Job Description IT", pageW - 20, 26, { align: "right" });
}

function addFooter(doc: jsPDF) {
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text("CONFIDENTIAL - " + COMPANY_NAME, 20, pageH - 10);
        doc.text(`Halaman ${i} / ${total}`, pageW - 20, pageH - 10, { align: "right" });
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

function bulletList(doc: jsPDF, items: string[], startY: number): number {
    let y = startY;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(50);
    const pageW = doc.internal.pageSize.getWidth();
    items.forEach((item) => {
        if (y > 265) { doc.addPage(); addHeader(doc); y = 55; }
        const lines = doc.splitTextToSize(`•  ${item}`, pageW - 48);
        doc.text(lines, 24, y, { align: "justify" });
        y += lines.length * 6 + 2;
    });
    return y + 4;
}

export function generateJobdeskPdf(): void {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Cover ────────────────────────────────────────────
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageW, 297, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(36);
    doc.setTextColor(...WHITE);
    doc.text("JOB", 20, 90);
    doc.text("DESCRIPTION", 20, 108);
    doc.setFontSize(14);
    doc.text("Deskripsi Jabatan & KPI", 20, 125);
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(1.5);
    doc.line(20, 130, 130, 130);
    doc.setFontSize(14);
    doc.setFont("times", "normal");
    doc.text(DEPARTMENT, 20, 145);
    doc.text(COMPANY_NAME, 20, 155);
    doc.setFontSize(9);
    doc.text(DOC_DATE, 20, 175);

    // ── Page 2: Tentang Departemen ────────────────────────
    doc.addPage();
    addHeader(doc);
    let y = 55;
    y = addSectionTitle(doc, "1. TENTANG DEPARTEMEN", y);
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(30);
    const intro = `Departemen Information Technology (IT) bertanggung jawab untuk memastikan keandalan, keamanan, dan ketersediaan seluruh infrastruktur teknologi di ${COMPANY_NAME}. Tim IT memainkan peran krusial dalam mendukung kelancaran bisnis, mengoptimalkan proses operasional melalui sistem internal, dan memberikan inovasi digital yang berkesinambungan.`;
    doc.text(intro, 20, y, { maxWidth: pageW - 40, align: "justify" });
    y += 35;

    // ── IT Manager ──────────────────────────────────────
    y = addSectionTitle(doc, `2. ${JOBDESK_IT_MANAGER.title.toUpperCase()}`, y);
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text("Tanggung Jawab Utama:", 20, y);
    y += 8;
    y = bulletList(doc, JOBDESK_IT_MANAGER.responsibilities, y);

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text("Key Performance Indicators (KPI):", 20, y);
    y += 8;
    y = bulletList(doc, JOBDESK_IT_MANAGER.kpis, y);

    // ── IT Infra & Helpdesk ─────────────────────────────
    if (y > 220) { doc.addPage(); addHeader(doc); y = 55; }
    y = addSectionTitle(doc, `3. ${JOBDESK_IT_INFRA.title.toUpperCase()}`, y);
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text("Tanggung Jawab Utama:", 20, y);
    y += 8;
    y = bulletList(doc, JOBDESK_IT_INFRA.responsibilities, y);

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text("Key Performance Indicators (KPI):", 20, y);
    y += 8;
    y = bulletList(doc, JOBDESK_IT_INFRA.kpis, y);

    // ── IT Software Dev ──────────────────────────────────
    if (y > 220) { doc.addPage(); addHeader(doc); y = 55; }
    y += 5; // spacing
    y = addSectionTitle(doc, `4. ${JOBDESK_IT_DEV.title.toUpperCase()}`, y);
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text("Tanggung Jawab Utama:", 20, y);
    y += 8;
    y = bulletList(doc, JOBDESK_IT_DEV.responsibilities, y);

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text("Key Performance Indicators (KPI):", 20, y);
    y += 8;
    y = bulletList(doc, JOBDESK_IT_DEV.kpis, y);

    // ── Ringkasan Tugas ─────────────────────────────────
    if (y > 200) { doc.addPage(); addHeader(doc); y = 55; }
    y = addSectionTitle(doc, "5. RINGKASAN TUGAS RUTIN", y);
    autoTable(doc, {
        startY: y,
        head: [["Frekuensi", "Jumlah Tugas", "Contoh Tugas"]],
        body: [
            ["Harian", `${DAILY_TASKS.length} tugas`, DAILY_TASKS.slice(0, 3).map((t) => t.title).join(", ")],
            ["Mingguan", `${WEEKLY_TASKS.length} tugas`, WEEKLY_TASKS.slice(0, 3).map((t) => t.title).join(", ")],
            ["Bulanan", `${MONTHLY_TASKS.length} tugas`, MONTHLY_TASKS.slice(0, 3).map((t) => t.title).join(", ")],
        ],
        theme: "grid",
        headStyles: { fillColor: [...PRIMARY], fontSize: 8, fontStyle: "bold", cellPadding: 4, textColor: [...WHITE] },
        bodyStyles: { fontSize: 8, cellPadding: 3.5 },
        alternateRowStyles: { fillColor: [...LIGHT_BG] },
        columnStyles: { 0: { cellWidth: 30, fontStyle: "bold" }, 1: { cellWidth: 30, halign: "center" } },
        margin: { left: 20, right: 20 },
        didDrawPage: () => addHeader(doc),
    });
    y = (doc as any).lastAutoTable.finalY + 12;

    // ── SLA Request ─────────────────────────────────────
    y = addSectionTitle(doc, "6. SLA REQUEST — TARGET WAKTU LAYANAN IT", y);
    autoTable(doc, {
        startY: y,
        head: [["No", "Kategori Permintaan", "Target Waktu", "Keterangan"]],
        body: SLA_REQUESTS.map((s, i) => [(i + 1).toString(), s.category, s.target, s.notes]),
        theme: "grid",
        headStyles: { fillColor: [...ACCENT], fontSize: 8, fontStyle: "bold", cellPadding: 4, textColor: [...WHITE] },
        bodyStyles: { fontSize: 7.5, cellPadding: 3.5, lineColor: [230, 230, 230] },
        alternateRowStyles: { fillColor: [...LIGHT_BG] },
        columnStyles: {
            0: { cellWidth: 10, halign: "center", fontStyle: "bold" },
            1: { cellWidth: 60 },
            2: { cellWidth: 35, halign: "center", fontStyle: "bold" },
        },
        margin: { left: 20, right: 20 },
        didDrawPage: () => addHeader(doc),
    });

    addFooter(doc);
    doc.save("Jobdesk_IT_PT_Wijaya_Inovasi_Gemilang.pdf");
}
