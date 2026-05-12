"use client";

import { useState, useEffect, useTransition } from "react";
import { getSlaPolicesAction, upsertSlaPolicyAction } from "@/app/actions/sla.actions";
import { toast } from "sonner";

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
    URGENT: { label: "Urgent", color: "bg-red-500" },
    HIGH: { label: "High", color: "bg-orange-500" },
    MEDIUM: { label: "Medium", color: "bg-yellow-500" },
    LOW: { label: "Low", color: "bg-blue-500" },
};

interface PolicyRow {
    id: string | null;
    priority: string;
    responseTimeMins: number;
    resolutionTimeMins: number;
    businessHoursOnly: boolean;
}

export default function SlaSettingsPage() {
    const [policies, setPolicies] = useState<PolicyRow[]>([]);
    const [isPending, startTransition] = useTransition();
    const [savedMsg, setSavedMsg] = useState("");

    useEffect(() => {
        loadPolicies();
    }, []);

    async function loadPolicies() {
        const data = await getSlaPolicesAction();
        setPolicies(data as PolicyRow[]);
    }

    function handleChange(index: number, field: keyof PolicyRow, value: any) {
        setPolicies((prev) =>
            prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
        );
    }

    function handleSave(policy: PolicyRow) {
        startTransition(async () => {
            try {
                await upsertSlaPolicyAction({
                    priority: policy.priority as any,
                    responseTimeMins: policy.responseTimeMins,
                    resolutionTimeMins: policy.resolutionTimeMins,
                    businessHoursOnly: policy.businessHoursOnly,
                });
                setSavedMsg(`Kebijakan SLA ${policy.priority} berhasil disimpan!`);
                setTimeout(() => setSavedMsg(""), 3000);
            } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Gagal menyimpan SLA");
            }
        });
    }

    function formatTime(mins: number): string {
        if (mins < 60) return `${mins} menit`;
        const hours = Math.floor(mins / 60);
        const remaining = mins % 60;
        if (remaining === 0) return `${hours} jam`;
        return `${hours} jam ${remaining} mnt`;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Pengaturan SLA</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Atur target waktu respon dan penyelesaian tiket berdasarkan prioritas. SLA diukur dalam menit dan bisa menggunakan jam kerja (Sen-Jum, 08:00-17:00).
                </p>
            </div>

            {savedMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    {savedMsg}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Target SLA per Prioritas</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {policies.map((policy, index) => {
                        const meta = PRIORITY_LABELS[policy.priority];
                        return (
                            <div key={policy.priority} className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex items-center gap-3 md:w-40 shrink-0">
                                    <span className={`w-3 h-3 rounded-full ${meta?.color}`} />
                                    <span className="font-semibold text-slate-700">{meta?.label}</span>
                                </div>

                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 font-medium block mb-1">Respon Pertama (menit)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={policy.responseTimeMins}
                                            onChange={(e) => handleChange(index, "responseTimeMins", Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                        <span className="text-[11px] text-slate-400 mt-1 block">
                                            = {formatTime(policy.responseTimeMins)}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 font-medium block mb-1">Penyelesaian (menit)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={policy.resolutionTimeMins}
                                            onChange={(e) => handleChange(index, "resolutionTimeMins", Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                        <span className="text-[11px] text-slate-400 mt-1 block">
                                            = {formatTime(policy.resolutionTimeMins)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 pt-5">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={policy.businessHoursOnly}
                                                onChange={(e) => handleChange(index, "businessHoursOnly", e.target.checked)}
                                                className="rounded border-slate-300 text-primary focus:ring-primary/20"
                                            />
                                            <span className="text-xs text-slate-600">Jam Kerja Saja</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSave(policy)}
                                    disabled={isPending}
                                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 shrink-0 self-end md:self-center"
                                >
                                    {isPending ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-3">Panduan</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong>Respon Pertama:</strong> Waktu maksimal dari tiket dibuat hingga teknisi mengambil/merespon tiket.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong>Penyelesaian:</strong> Waktu maksimal dari tiket dibuat hingga status berubah menjadi &quot;Resolved&quot;.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong>Jam Kerja Saja:</strong> Bila dicentang, penghitungan hanya berjalan pada hari kerja (Senin–Jumat, 08:00–17:00).</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
