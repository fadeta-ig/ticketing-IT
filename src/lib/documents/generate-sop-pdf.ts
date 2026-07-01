import {
    COMPANY_NAME, DEPARTMENT, DOC_DATE,
    DAILY_TASKS, WEEKLY_TASKS, MONTHLY_TASKS,
    SLA_REQUESTS,
} from "./sop-data";
import { downloadPdf, SimplePdf } from "./simple-pdf";

function addTaskSection(pdf: SimplePdf, title: string, tasks: typeof DAILY_TASKS) {
    pdf.addSection(title);
    tasks.forEach((task) => {
        pdf.addText(`${task.no}. ${task.title}`, { bold: true });
        pdf.addText(task.sop, { indent: 12, size: 9 });
        pdf.addBlank(0.5);
    });
}

export function generateSopPdf(): void {
    const pdf = new SimplePdf();

    pdf.addText("STANDARD OPERATING PROCEDURE", { size: 20, bold: true, color: [15, 23, 42] });
    pdf.addText(DEPARTMENT, { size: 12, bold: true });
    pdf.addText(COMPANY_NAME, { size: 11 });
    pdf.addText(`Tanggal: ${DOC_DATE}`, { size: 10 });
    pdf.addBlank(2);

    pdf.addSection("1. Pendahuluan");
    pdf.addText(`Dokumen ini berisi Standard Operating Procedure (SOP) untuk kegiatan operasional Departemen IT di ${COMPANY_NAME}. SOP ini menjadi acuan dalam menjalankan tugas harian, mingguan, dan bulanan untuk menjaga ketersediaan, keamanan, dan performa layanan teknologi informasi.`);

    pdf.addSection("1.1 Tujuan");
    [
        "Menjamin kontinuitas operasional sistem IT perusahaan.",
        "Menetapkan standar prosedur yang konsisten dan terukur.",
        "Meminimalkan risiko downtime dan insiden keamanan.",
        "Mendukung pencapaian target SLA.",
    ].forEach((item) => pdf.addText(`- ${item}`, { indent: 12 }));

    addTaskSection(pdf, "2. Tugas Harian", DAILY_TASKS);
    addTaskSection(pdf, "3. Tugas Mingguan", WEEKLY_TASKS);
    addTaskSection(pdf, "4. Tugas Bulanan", MONTHLY_TASKS);

    pdf.addSection("5. SLA Request");
    pdf.addRows(
        ["No", "Kategori", "Target", "Keterangan"],
        SLA_REQUESTS.map((request, index) => [
            index + 1,
            request.category,
            request.target,
            request.notes,
        ])
    );

    downloadPdf("SOP_IT_PT_Wijaya_Inovasi_Gemilang.pdf", pdf);
}
