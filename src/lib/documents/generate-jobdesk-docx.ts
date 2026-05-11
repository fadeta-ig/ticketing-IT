import {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, HeadingLevel, AlignmentType, WidthType,
    ShadingType, PageBreak, Header, Footer,
} from "docx";
import { saveAs } from "file-saver";
import {
    COMPANY_NAME, DEPARTMENT, DOC_DATE,
    JOBDESK_IT_MANAGER, JOBDESK_IT_INFRA, JOBDESK_IT_DEV,
    DAILY_TASKS, WEEKLY_TASKS, MONTHLY_TASKS,
    SLA_REQUESTS,
} from "./sop-data";

const PRIMARY_HEX = "0F172A";
const ACCENT_HEX = "3B82F6";
const LIGHT_HEX = "F8FAFC";
const BODY_COLOR = "1E293B";
const MUTED = "64748B";

function heading(text: string): Paragraph {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 200 },
        children: [new TextRun({ text, bold: true, size: 28, font: "Times New Roman", color: PRIMARY_HEX })],
    });
}

function subheading(text: string): Paragraph {
    return new Paragraph({
        spacing: { before: 300, after: 100 },
        children: [new TextRun({ text, bold: true, size: 22, font: "Times New Roman", color: BODY_COLOR })],
    });
}

function bullet(text: string): Paragraph {
    return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 60 },
        children: [new TextRun({ text: `•  ${text}`, size: 24, font: "Times New Roman", color: BODY_COLOR })],
        indent: { left: 360 },
    });
}

function slaTable(): Table {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                tableHeader: true,
                children: ["No", "Kategori Permintaan", "Target Waktu", "Keterangan"].map((t) =>
                    new TableCell({
                        shading: { type: ShadingType.SOLID, color: ACCENT_HEX },
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 18, font: "Times New Roman" })] })],
                    })
                ),
            }),
            ...SLA_REQUESTS.map((s, i) =>
                new TableRow({
                    children: [
                        new TableCell({ shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (i + 1).toString(), bold: true, size: 18, font: "Times New Roman" })] })] }),
                        new TableCell({ shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined, children: [new Paragraph({ children: [new TextRun({ text: s.category, size: 18, font: "Times New Roman" })] })] }),
                        new TableCell({ shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.target, bold: true, size: 18, font: "Times New Roman", color: ACCENT_HEX })] })] }),
                        new TableCell({ shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined, children: [new Paragraph({ children: [new TextRun({ text: s.notes, size: 17, font: "Times New Roman", italics: true, color: MUTED })] })] }),
                    ],
                })
            ),
        ],
    });
}

export async function generateJobdeskDocx(): Promise<void> {
    const doc = new Document({
        creator: COMPANY_NAME,
        title: `Job Description IT - ${COMPANY_NAME}`,
        sections: [{
            headers: {
                default: new Header({ children: [new Paragraph({ children: [new TextRun({ text: `${COMPANY_NAME}  |  ${DEPARTMENT}`, size: 14, font: "Times New Roman", color: "94A3B8", bold: true })] })] }),
            },
            footers: {
                default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `CONFIDENTIAL  —  ${COMPANY_NAME}  —  ${DOC_DATE}`, size: 14, font: "Times New Roman", color: "94A3B8" })] })] }),
            },
            children: [
                // ── Cover ────────────────────────────
                new Paragraph({ spacing: { before: 4000 } }),
                new Paragraph({ children: [new TextRun({ text: "JOB DESCRIPTION", size: 56, bold: true, font: "Times New Roman", color: PRIMARY_HEX })] }),
                new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "& KPI", size: 56, bold: true, font: "Times New Roman", color: ACCENT_HEX })] }),
                new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "Deskripsi Jabatan, Tugas, dan Indikator Kinerja", size: 24, font: "Times New Roman", color: MUTED })] }),
                new Paragraph({ children: [new TextRun({ text: DEPARTMENT, size: 24, font: "Times New Roman", color: MUTED })] }),
                new Paragraph({ children: [new TextRun({ text: COMPANY_NAME, size: 24, font: "Times New Roman", color: MUTED })] }),
                new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: `Tanggal: ${DOC_DATE}`, size: 20, font: "Times New Roman", color: "94A3B8" })] }),
                new Paragraph({ children: [new PageBreak()] }),

                // ── 1. Tentang ────────────────────────
                heading("1. TENTANG DEPARTEMEN IT"),
                new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, children: [new TextRun({ text: `Departemen IT di ${COMPANY_NAME} bertanggung jawab atas seluruh aspek teknologi informasi yang mendukung operasional bisnis. Ruang lingkup meliputi: pengelolaan infrastruktur jaringan & server (Proxmox, Ubuntu Server), helpdesk & technical support, pengembangan website perusahaan (wijayainovasi.co.id, mahakaryakosmetika.co.id, shinyoungbeauty.com), serta pengelolaan sistem digital internal.`, size: 24, font: "Times New Roman", color: BODY_COLOR })] }),

                // ── 2. IT Manager ────────────────────
                heading(`2. ${JOBDESK_IT_MANAGER.title.toUpperCase()}`),
                subheading("Tanggung Jawab Utama:"),
                ...JOBDESK_IT_MANAGER.responsibilities.map(bullet),
                subheading("Key Performance Indicators (KPI):"),
                ...JOBDESK_IT_MANAGER.kpis.map(bullet),

                // ── 3. IT Infra & Helpdesk ───────────
                heading(`3. ${JOBDESK_IT_INFRA.title.toUpperCase()}`),
                subheading("Tanggung Jawab Utama:"),
                ...JOBDESK_IT_INFRA.responsibilities.map(bullet),
                subheading("Key Performance Indicators (KPI):"),
                ...JOBDESK_IT_INFRA.kpis.map(bullet),

                // ── 4. IT Software Dev ───────────────
                heading(`4. ${JOBDESK_IT_DEV.title.toUpperCase()}`),
                subheading("Tanggung Jawab Utama:"),
                ...JOBDESK_IT_DEV.responsibilities.map(bullet),
                subheading("Key Performance Indicators (KPI):"),
                ...JOBDESK_IT_DEV.kpis.map(bullet),

                // ── 5. Ringkasan Tugas ────────────────
                heading("5. RINGKASAN TUGAS RUTIN"),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({ tableHeader: true, children: ["Frekuensi", "Jumlah", "Contoh Tugas"].map((t) => new TableCell({ shading: { type: ShadingType.SOLID, color: PRIMARY_HEX }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, color: "FFFFFF", size: 18, font: "Times New Roman" })] })] })) }),
                        ...([
                            ["Harian", DAILY_TASKS],
                            ["Mingguan", WEEKLY_TASKS],
                            ["Bulanan", MONTHLY_TASKS],
                        ] as [string, typeof DAILY_TASKS][]).map(([freq, tasks], i) =>
                            new TableRow({ children: [
                                new TableCell({ shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined, children: [new Paragraph({ children: [new TextRun({ text: freq, bold: true, size: 18, font: "Times New Roman" })] })] }),
                                new TableCell({ shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${tasks.length} tugas`, size: 18, font: "Times New Roman" })] })] }),
                                new TableCell({ shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined, children: [new Paragraph({ children: [new TextRun({ text: tasks.slice(0, 3).map((t) => t.title).join(", "), size: 17, font: "Times New Roman", color: MUTED })] })] }),
                            ] })
                        ),
                    ],
                }),

                // ── 5. SLA Request ────────────────────
                heading("6. SLA REQUEST — TARGET WAKTU LAYANAN IT"),
                slaTable(),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Jobdesk_IT_PT_Wijaya_Inovasi_Gemilang.docx");
}
