import {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, HeadingLevel, AlignmentType, WidthType,
    BorderStyle, ShadingType, PageBreak, Header, Footer,
    TableOfContents,
} from "docx";
import { saveAs } from "file-saver";
import {
    COMPANY_NAME, DEPARTMENT, DOC_DATE,
    DAILY_TASKS, WEEKLY_TASKS, MONTHLY_TASKS,
    SLA_REQUESTS, type TaskSopItem,
} from "./sop-data";

const PRIMARY_HEX = "0F172A";
const ACCENT_HEX = "3B82F6";
const LIGHT_HEX = "F8FAFC";
const BODY_COLOR = "1E293B";

function headerRow(cells: string[]): TableRow {
    return new TableRow({
        tableHeader: true,
        children: cells.map((text) =>
            new TableCell({
                shading: { type: ShadingType.SOLID, color: PRIMARY_HEX },
                children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18, font: "Times New Roman" })], alignment: AlignmentType.CENTER })],
            })
        ),
    });
}

function taskRows(tasks: TaskSopItem[], alt: boolean = true): TableRow[] {
    return tasks.map((t, i) =>
        new TableRow({
            children: [
                new TableCell({
                    shading: i % 2 !== 0 && alt ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined,
                    width: { size: 6, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.no.toString(), bold: true, size: 18, font: "Times New Roman", color: BODY_COLOR })] })],
                }),
                new TableCell({
                    shading: i % 2 !== 0 && alt ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined,
                    width: { size: 28, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: t.title, bold: true, size: 20, font: "Times New Roman", color: BODY_COLOR })] })],
                }),
                new TableCell({
                    shading: i % 2 !== 0 && alt ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined,
                    width: { size: 66, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: t.sop, size: 20, font: "Times New Roman", color: BODY_COLOR })] })],
                }),
            ],
        })
    );
}

function slaTable(): Table {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            headerRow(["No", "Kategori Permintaan", "Target Waktu", "Keterangan"]),
            ...SLA_REQUESTS.map((s, i) =>
                new TableRow({
                    children: [
                        new TableCell({
                            shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined,
                            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (i + 1).toString(), bold: true, size: 18, font: "Times New Roman" })] })],
                        }),
                        new TableCell({
                            shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined,
                            children: [new Paragraph({ children: [new TextRun({ text: s.category, size: 18, font: "Times New Roman" })] })],
                        }),
                        new TableCell({
                            shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined,
                            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.target, bold: true, size: 18, font: "Times New Roman", color: ACCENT_HEX })] })],
                        }),
                        new TableCell({
                            shading: i % 2 !== 0 ? { type: ShadingType.SOLID, color: LIGHT_HEX } : undefined,
                            children: [new Paragraph({ children: [new TextRun({ text: s.notes, size: 17, font: "Times New Roman", italics: true, color: "64748B" })] })],
                        }),
                    ],
                })
            ),
        ],
    });
}

export async function generateSopDocx(): Promise<void> {
    const doc = new Document({
        creator: COMPANY_NAME,
        title: `SOP IT - ${COMPANY_NAME}`,
        description: "Standard Operating Procedure Departemen IT",
        sections: [
            {
                headers: {
                    default: new Header({
                        children: [new Paragraph({
                            children: [
                                new TextRun({ text: `${COMPANY_NAME}  |  ${DEPARTMENT}`, size: 14, font: "Times New Roman", color: "94A3B8", bold: true }),
                            ],
                        })],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: `CONFIDENTIAL  —  ${COMPANY_NAME}  —  ${DOC_DATE}`, size: 14, font: "Times New Roman", color: "94A3B8" })],
                        })],
                    }),
                },
                children: [
                    // ── Cover ────────────────────────────
                    new Paragraph({ spacing: { before: 4000 } }),
                    new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "STANDARD OPERATING PROCEDURE", size: 56, bold: true, font: "Times New Roman", color: PRIMARY_HEX })] }),
                    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "SOP", size: 96, bold: true, font: "Times New Roman", color: ACCENT_HEX })] }),
                    new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: DEPARTMENT, size: 24, font: "Times New Roman", color: "64748B" })] }),
                    new Paragraph({ children: [new TextRun({ text: COMPANY_NAME, size: 24, font: "Times New Roman", color: "64748B" })] }),
                    new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: `Tanggal: ${DOC_DATE}  |  Versi 1.0`, size: 20, font: "Times New Roman", color: "94A3B8" })] }),
                    new Paragraph({ children: [new PageBreak()] }),

                    // ── 1. Pendahuluan ──────────────────
                    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "1. PENDAHULUAN", bold: true, size: 28, font: "Times New Roman", color: PRIMARY_HEX })] }),
                    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, children: [new TextRun({ text: `Dokumen ini berisi Standard Operating Procedure (SOP) untuk seluruh kegiatan operasional Departemen IT di ${COMPANY_NAME}. SOP ini menjadi acuan bagi seluruh personel IT dalam menjalankan tugas harian, mingguan, dan bulanan guna menjaga ketersediaan, keamanan, dan performa seluruh infrastruktur serta layanan teknologi informasi perusahaan.`, size: 24, font: "Times New Roman", color: BODY_COLOR })] }),

                    // ── 2. Tugas Harian ─────────────────
                    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 600, after: 200 }, children: [new TextRun({ text: "2. TUGAS HARIAN (DAILY)", bold: true, size: 28, font: "Times New Roman", color: PRIMARY_HEX })] }),
                    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow(["No", "Tugas", "Standard Operating Procedure"]), ...taskRows(DAILY_TASKS)] }),

                    // ── 3. Tugas Mingguan ────────────────
                    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 600, after: 200 }, children: [new TextRun({ text: "3. TUGAS MINGGUAN (WEEKLY)", bold: true, size: 28, font: "Times New Roman", color: PRIMARY_HEX })] }),
                    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow(["No", "Tugas", "Standard Operating Procedure"]), ...taskRows(WEEKLY_TASKS)] }),

                    // ── 4. Tugas Bulanan ─────────────────
                    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 600, after: 200 }, children: [new TextRun({ text: "4. TUGAS BULANAN (MONTHLY)", bold: true, size: 28, font: "Times New Roman", color: PRIMARY_HEX })] }),
                    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow(["No", "Tugas", "Standard Operating Procedure"]), ...taskRows(MONTHLY_TASKS)] }),

                    // ── 5. SLA Request ──────────────────
                    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 600, after: 200 }, children: [new TextRun({ text: "5. SLA REQUEST — TARGET WAKTU PENYELESAIAN", bold: true, size: 28, font: "Times New Roman", color: PRIMARY_HEX })] }),
                    slaTable(),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "SOP_IT_PT_Wijaya_Inovasi_Gemilang.docx");
}
