"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Download01Icon,
    File01Icon,
    TableIcon,
    Calendar01Icon
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

export function ReportGenerator() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async (format: "pdf" | "excel") => {
        setIsLoading(true);
        toast.info(`Generating ${format.toUpperCase()} report...`);

        try {
            const response = await fetch(`/api/analytics/export?month=${month}&year=${year}&format=${format}`);
            if (!response.ok) throw new Error("Failed to generate report");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `IT_Report_${month}_${year}.${format === "pdf" ? "pdf" : "xlsx"}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Report generated successfully!");
        } catch (error) {
            toast.error("Error generating report");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <Card className="border-primary/10 shadow-sm bg-white rounded-2xl overflow-hidden h-full">
            <CardHeader className="px-6 py-5 border-b border-slate-50">
                <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">Generate Monthly Report</CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-400">
                    Export high-level IT KPI snapshots
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                            <HugeiconsIcon icon={Calendar01Icon} className="size-2.5" />
                            Month
                        </label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:bg-slate-100"
                        >
                            {months.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                            <HugeiconsIcon icon={Calendar01Icon} className="size-2.5" />
                            Year
                        </label>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:bg-slate-100"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-4 grid grid-cols-1 gap-3">
                    <Button
                        onClick={() => handleExport("pdf")}
                        disabled={isLoading}
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm gap-2 font-bold"
                    >
                        <HugeiconsIcon icon={File01Icon} className="size-4" />
                        Export to PDF
                    </Button>
                    <Button
                        onClick={() => handleExport("excel")}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-11 border-emerald-100 bg-emerald-50/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl gap-2 font-bold"
                    >
                        <HugeiconsIcon icon={TableIcon} className="size-4" />
                        Export to Excel
                    </Button>
                </div>

                <p className="text-[10px] text-center text-slate-400 font-medium px-4 pt-2">
                    Reports include SLA compliance, technician workload, and ticket details for the selected period.
                </p>
            </CardContent>
        </Card>
    );
}
