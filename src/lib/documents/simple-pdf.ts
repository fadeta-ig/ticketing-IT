type TextStyle = {
    size?: number;
    bold?: boolean;
    indent?: number;
    color?: [number, number, number];
};

type PdfLine = Required<TextStyle> & {
    text: string;
    y: number;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const BOTTOM_MARGIN = 48;

function normalizeText(value: string) {
    return value
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/\u2022/g, "-")
        .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function escapePdfText(value: string) {
    return normalizeText(value)
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
}

function wrapText(value: string, maxChars: number) {
    const words = normalizeText(value).split(" ").filter(Boolean);
    const lines: string[] = [];
    let line = "";

    for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (next.length > maxChars && line) {
            lines.push(line);
            line = word;
        } else {
            line = next;
        }
    }

    if (line) lines.push(line);
    return lines.length ? lines : [""];
}

export class SimplePdf {
    private pages: PdfLine[][] = [[]];
    private y = PAGE_HEIGHT - MARGIN;

    addText(text: string, style: TextStyle = {}) {
        const size = style.size ?? 10;
        const lineHeight = size * 1.35;
        const indent = style.indent ?? 0;
        const maxChars = Math.max(28, Math.floor((PAGE_WIDTH - MARGIN * 2 - indent) / (size * 0.52)));

        for (const line of wrapText(text, maxChars)) {
            if (this.y < BOTTOM_MARGIN) this.addPage();
            this.currentPage().push({
                text: line,
                y: this.y,
                size,
                bold: style.bold ?? false,
                indent,
                color: style.color ?? [0, 0, 0],
            });
            this.y -= lineHeight;
        }
    }

    addBlank(lines = 1) {
        this.y -= lines * 10;
        if (this.y < BOTTOM_MARGIN) this.addPage();
    }

    addSection(title: string) {
        this.addBlank(0.5);
        this.addText(title.toUpperCase(), { size: 13, bold: true, color: [15, 23, 42] });
        this.addBlank(0.5);
    }

    addKeyValue(label: string, value: string | number) {
        this.addText(`${label}: ${value}`, { size: 10 });
    }

    addRows(headers: string[], rows: Array<Array<string | number>>) {
        this.addText(headers.join(" | "), { size: 9, bold: true });
        this.addText("-".repeat(90), { size: 8, color: [90, 90, 90] });
        for (const row of rows) {
            this.addText(row.map((cell) => String(cell)).join(" | "), { size: 8 });
        }
        this.addBlank();
    }

    toUint8Array() {
        const objects: string[] = [];
        const addObject = (body: string) => {
            objects.push(body);
            return objects.length;
        };

        const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
        const pagesId = addObject("");
        const regularFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
        const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
        const pageIds: number[] = [];

        for (const page of this.pages) {
            const content = page.map((line) => {
                const [r, g, b] = line.color.map((c) => (c / 255).toFixed(3));
                const font = line.bold ? "F2" : "F1";
                const x = MARGIN + line.indent;
                return `${r} ${g} ${b} rg\nBT /${font} ${line.size} Tf ${x.toFixed(2)} ${line.y.toFixed(2)} Td (${escapePdfText(line.text)}) Tj ET`;
            }).join("\n");

            const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
            const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
            pageIds.push(pageId);
        }

        objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

        const chunks = ["%PDF-1.4\n"];
        const offsets = [0];

        objects.forEach((body, index) => {
            offsets.push(chunks.join("").length);
            chunks.push(`${index + 1} 0 obj\n${body}\nendobj\n`);
        });

        const xrefOffset = chunks.join("").length;
        chunks.push(`xref\n0 ${objects.length + 1}\n`);
        chunks.push("0000000000 65535 f \n");
        offsets.slice(1).forEach((offset) => {
            chunks.push(`${offset.toString().padStart(10, "0")} 00000 n \n`);
        });
        chunks.push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

        return new TextEncoder().encode(chunks.join(""));
    }

    private addPage() {
        this.pages.push([]);
        this.y = PAGE_HEIGHT - MARGIN;
    }

    private currentPage() {
        return this.pages[this.pages.length - 1];
    }
}

export function downloadPdf(filename: string, pdf: SimplePdf) {
    const blob = new Blob([pdf.toUint8Array()], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
