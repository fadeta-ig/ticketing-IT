"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { SLA_REQUESTS } from "@/lib/documents/sop-data";

export function SlaRequestCard() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <HugeiconsIcon icon={Clock01Icon} className="size-5 text-amber-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">SLA Request — Target Waktu Layanan IT</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Estimasi waktu penyelesaian per jenis permintaan</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50/80">
                            <th className="text-left px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori Permintaan</th>
                            <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Waktu</th>
                            <th className="text-left px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {SLA_REQUESTS.map((sla, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-3">
                                    <span className="font-semibold text-slate-700 text-[13px]">{sla.category}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="inline-block px-3 py-1 bg-primary/5 text-primary border border-primary/10 text-xs font-bold rounded-lg tracking-wider">
                                        {sla.target}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-xs text-slate-400 italic hidden md:table-cell">{sla.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
