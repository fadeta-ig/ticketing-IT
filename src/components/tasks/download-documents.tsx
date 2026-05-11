"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    FileDownloadIcon, File01Icon, FileAttachmentIcon,
} from "@hugeicons/core-free-icons";

type DocFormat = "pdf" | "docx";
type DocType = "sop" | "jobdesk";

export function DownloadDocuments() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleDownload = async (type: DocType, format: DocFormat) => {
        const key = `${type}-${format}`;
        setLoading(key);

        try {
            if (type === "sop" && format === "pdf") {
                const { generateSopPdf } = await import("@/lib/documents/generate-sop-pdf");
                generateSopPdf();
            } else if (type === "sop" && format === "docx") {
                const { generateSopDocx } = await import("@/lib/documents/generate-sop-docx");
                await generateSopDocx();
            } else if (type === "jobdesk" && format === "pdf") {
                const { generateJobdeskPdf } = await import("@/lib/documents/generate-jobdesk-pdf");
                generateJobdeskPdf();
            } else if (type === "jobdesk" && format === "docx") {
                const { generateJobdeskDocx } = await import("@/lib/documents/generate-jobdesk-docx");
                await generateJobdeskDocx();
            }
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setLoading(null);
        }
    };

    const docs = [
        {
            type: "sop" as DocType,
            title: "SOP IT",
            subtitle: "Standard Operating Procedure",
            desc: "Prosedur operasional harian, mingguan, dan bulanan beserta SLA Request",
            icon: File01Icon,
            accent: "bg-blue-50 text-blue-600 border-blue-100",
        },
        {
            type: "jobdesk" as DocType,
            title: "Jobdesk IT",
            subtitle: "Job Description & KPI",
            desc: "Deskripsi jabatan, tanggung jawab, KPI, dan target layanan IT",
            icon: FileAttachmentIcon,
            accent: "bg-purple-50 text-purple-600 border-purple-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {docs.map((d) => (
                <div key={d.type} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                    <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-xl border ${d.accent}`}>
                                <HugeiconsIcon icon={d.icon} className="size-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{d.title}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.subtitle}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{d.desc}</p>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 flex items-center gap-3">
                        <button
                            onClick={() => handleDownload(d.type, "pdf")}
                            disabled={loading !== null}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
                        >
                            <HugeiconsIcon icon={FileDownloadIcon} className="size-4" />
                            {loading === `${d.type}-pdf` ? "Generating..." : "Download PDF"}
                        </button>
                        <button
                            onClick={() => handleDownload(d.type, "docx")}
                            disabled={loading !== null}
                            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all"
                        >
                            <HugeiconsIcon icon={FileDownloadIcon} className="size-4" />
                            {loading === `${d.type}-docx` ? "Generating..." : "Download Word"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
