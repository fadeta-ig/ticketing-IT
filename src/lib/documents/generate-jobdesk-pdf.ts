import {
    COMPANY_NAME, DEPARTMENT, DOC_DATE,
    JOBDESK_IT_MANAGER, JOBDESK_IT_INFRA, JOBDESK_IT_DEV,
    DAILY_TASKS, WEEKLY_TASKS, MONTHLY_TASKS,
    SLA_REQUESTS,
} from "./sop-data";
import { downloadPdf, SimplePdf } from "./simple-pdf";

function addRoleSection(pdf: SimplePdf, section: string, role: typeof JOBDESK_IT_MANAGER) {
    pdf.addSection(section);
    pdf.addText(role.title, { bold: true, size: 12 });
    pdf.addText("Tanggung jawab utama:", { bold: true });
    role.responsibilities.forEach((item) => pdf.addText(`- ${item}`, { indent: 12, size: 9 }));
    pdf.addBlank(0.5);
    pdf.addText("Key Performance Indicators:", { bold: true });
    role.kpis.forEach((item) => pdf.addText(`- ${item}`, { indent: 12, size: 9 }));
}

export function generateJobdeskPdf(): void {
    const pdf = new SimplePdf();

    pdf.addText("JOB DESCRIPTION IT", { size: 20, bold: true, color: [15, 23, 42] });
    pdf.addText(DEPARTMENT, { size: 12, bold: true });
    pdf.addText(COMPANY_NAME, { size: 11 });
    pdf.addText(`Tanggal: ${DOC_DATE}`, { size: 10 });
    pdf.addBlank(2);

    pdf.addSection("1. Tentang Departemen");
    pdf.addText(`Departemen Information Technology (IT) bertanggung jawab memastikan keandalan, keamanan, dan ketersediaan infrastruktur teknologi di ${COMPANY_NAME}. Tim IT mendukung kelancaran bisnis, optimalisasi proses operasional, dan inovasi digital berkelanjutan.`);

    addRoleSection(pdf, "2. IT Manager", JOBDESK_IT_MANAGER);
    addRoleSection(pdf, "3. IT Infrastructure & Helpdesk", JOBDESK_IT_INFRA);
    addRoleSection(pdf, "4. IT Software Development", JOBDESK_IT_DEV);

    pdf.addSection("5. Ringkasan Tugas Rutin");
    pdf.addRows(
        ["Frekuensi", "Jumlah", "Contoh"],
        [
            ["Harian", DAILY_TASKS.length, DAILY_TASKS.slice(0, 3).map((task) => task.title).join(", ")],
            ["Mingguan", WEEKLY_TASKS.length, WEEKLY_TASKS.slice(0, 3).map((task) => task.title).join(", ")],
            ["Bulanan", MONTHLY_TASKS.length, MONTHLY_TASKS.slice(0, 3).map((task) => task.title).join(", ")],
        ]
    );

    pdf.addSection("6. SLA Request");
    pdf.addRows(
        ["No", "Kategori", "Target", "Keterangan"],
        SLA_REQUESTS.map((request, index) => [
            index + 1,
            request.category,
            request.target,
            request.notes,
        ])
    );

    downloadPdf("Jobdesk_IT_PT_Wijaya_Inovasi_Gemilang.pdf", pdf);
}
