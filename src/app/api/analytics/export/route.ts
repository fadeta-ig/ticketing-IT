import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics.service";
import { SimplePdf } from "@/lib/documents/simple-pdf";

function xmlEscape(value: string | number) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function worksheetXml(name: string, rows: Array<Array<string | number>>) {
    return `
        <Worksheet ss:Name="${xmlEscape(name)}">
            <Table>
                ${rows.map((row) => `
                    <Row>
                        ${row.map((cell) => `<Cell><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${xmlEscape(cell)}</Data></Cell>`).join("")}
                    </Row>
                `).join("")}
            </Table>
        </Worksheet>
    `;
}

function createSpreadsheetXml(sheets: Array<{ name: string; rows: Array<Array<string | number>> }>) {
    return `<?xml version="1.0"?>
        <?mso-application progid="Excel.Sheet"?>
        <Workbook
            xmlns="urn:schemas-microsoft-com:office:spreadsheet"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
            ${sheets.map((sheet) => worksheetXml(sheet.name, sheet.rows)).join("")}
        </Workbook>
    `;
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role === "USER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));
    const formatType = searchParams.get("format");

    if (!month || !year || !formatType) {
        return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const data = await AnalyticsService.getMonthlySnapshot(month, year);

    if (formatType === "pdf") {
        const pdf = new SimplePdf();
        pdf.addText(`IT OPERATION REPORT - ${data.period.toUpperCase()}`, { size: 18, bold: true, color: [140, 20, 20] });
        pdf.addText(`Generated on: ${format(new Date(), "dd MMM yyyy HH:mm")}`, { size: 9, color: [90, 90, 90] });
        pdf.addBlank();
        pdf.addSection("KPI Summary");
        pdf.addRows(
            ["Metric", "Value"],
            [
                ["Total Tickets", data.totalTickets],
                ["Resolved Tickets", data.resolvedTickets],
                ["SLA Compliance", `${data.slaRate}%`],
            ]
        );

        pdf.addSection("Ticket Details");
        pdf.addRows(["Date", "Title", "Priority", "Category", "Status", "Assignee"], data.tickets.map(t => [
            format(new Date(t.createdAt), "dd/MM"),
            t.title.substring(0, 40) + (t.title.length > 40 ? "..." : ""),
            t.priority,
            t.category || "-",
            t.status,
            t.assignee
        ]));

        const pdfOutput = pdf.toUint8Array();
        return new NextResponse(pdfOutput, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=IT_Report_${month}_${year}.pdf`
            }
        });
    } else if (formatType === "excel") {
        const summaryData = [
            ["IT OPERATION REPORT", data.period],
            [],
            ["Metric", "Value"],
            ["Total Tickets", data.totalTickets],
            ["Resolved Tickets", data.resolvedTickets],
            ["SLA Compliance", `${data.slaRate}%`]
        ];

        const detailsData = [
            ["Date", "Title", "Priority", "Category", "Status", "Assignee"],
            ...data.tickets.map(t => [
                format(new Date(t.createdAt), "yyyy-MM-dd"),
                t.title,
                t.priority,
                t.category || "-",
                t.status,
                t.assignee
            ])
        ];

        const excelOutput = createSpreadsheetXml([
            { name: "Summary", rows: summaryData },
            { name: "Tickets", rows: detailsData },
        ]);

        return new NextResponse(excelOutput, {
            headers: {
                "Content-Type": "application/vnd.ms-excel; charset=utf-8",
                "Content-Disposition": `attachment; filename=IT_Report_${month}_${year}.xls`
            }
        });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}
