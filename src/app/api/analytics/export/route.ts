import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics.service";

interface jsPDFCustom extends jsPDF {
    lastAutoTable: { finalY: number };
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
        const doc = new jsPDF() as jsPDFCustom;

        // Header
        doc.setFontSize(20);
        doc.setTextColor(140, 20, 20); // Maroon theme
        doc.text(`IT OPERATION REPORT - ${data.period.toUpperCase()}`, 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 30);

        // Stats Summary
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("KPI Summary", 14, 45);

        const summaryRows = [
            ["Total Tickets", data.totalTickets.toString()],
            ["Resolved Tickets", data.resolvedTickets.toString()],
            ["SLA Compliance", `${data.slaRate}%`]
        ];

        autoTable(doc, {
            startY: 50,
            head: [['Metric', 'Value']],
            body: summaryRows,
            theme: 'striped',
            headStyles: { fillColor: [140, 20, 20] }
        });

        // Ticket Details
        doc.text("Ticket Details", 14, doc.lastAutoTable.finalY + 15);

        const ticketRows = data.tickets.map(t => [
            format(new Date(t.createdAt), "dd/MM"),
            t.title.substring(0, 40) + (t.title.length > 40 ? "..." : ""),
            t.priority,
            t.category || "-",
            t.status,
            t.assignee
        ]);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Date', 'Title', 'Priority', 'Category', 'Status', 'Assignee']],
            body: ticketRows,
            theme: 'grid',
            headStyles: { fillColor: [60, 60, 60] },
            styles: { fontSize: 8 }
        });

        const pdfOutput = doc.output("arraybuffer");
        return new NextResponse(pdfOutput, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=IT_Report_${month}_${year}.pdf`
            }
        });
    } else if (formatType === "excel") {
        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const summaryData = [
            ["IT OPERATION REPORT", data.period],
            [],
            ["Metric", "Value"],
            ["Total Tickets", data.totalTickets],
            ["Resolved Tickets", data.resolvedTickets],
            ["SLA Compliance", `${data.slaRate}%`]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        // Details Sheet
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
        const wsDetails = XLSX.utils.aoa_to_sheet(detailsData);
        XLSX.utils.book_append_sheet(wb, wsDetails, "Tickets");

        const excelOutput = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        return new NextResponse(excelOutput, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename=IT_Report_${month}_${year}.xlsx`
            }
        });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}
