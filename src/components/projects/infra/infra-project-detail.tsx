"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, Calendar03Icon, UserIcon, LocationIcon, Building01Icon } from "@hugeicons/core-free-icons"
import { PhaseStepper, type PhaseKey } from "./phase-stepper"
import { ProposalForm } from "./proposal-form"
import { RkbForm } from "./rkb-form"
import { DisbursementTracker } from "./disbursement-tracker"
import { ExecutionPanel } from "./execution-panel"
import { type SafeAny } from "@/lib/utils"

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)
}

interface InfraProjectDetailProps {
    project: SafeAny
}

export function InfraProjectDetail({ project }: InfraProjectDetailProps) {
    const currentPhase = (project.currentPhase || "PROPOSAL") as PhaseKey
    const [activeTab, setActiveTab] = useState<PhaseKey>(currentPhase)

    const handlePhaseClick = (phase: PhaseKey) => {
        setActiveTab(phase)
    }

    const rkbTotalBudget = project.rkbItems?.reduce(
        (sum: number, item: SafeAny) => sum + (item.totalPrice || 0), 0
    ) || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/infrastructure">
                            <Button variant="ghost" size="icon" className="size-8">
                                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
                            <p className="text-sm text-muted-foreground italic">
                                {project.description || "Tidak ada deskripsi"}
                            </p>
                        </div>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={
                        currentPhase === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }
                >
                    {project.status}
                </Badge>
            </div>

            {/* Project Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {project.category && (
                    <Card className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Building01Icon} className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kategori</p>
                                <p className="text-sm font-bold text-slate-800">{project.category as string}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {project.location && (
                    <Card className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <HugeiconsIcon icon={LocationIcon} className="size-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lokasi</p>
                                <p className="text-sm font-bold text-slate-800">{project.location as string}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {project.requestedBy && (
                    <Card className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <HugeiconsIcon icon={UserIcon} className="size-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pemohon</p>
                                <p className="text-sm font-bold text-slate-800">{project.requestedBy as string}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {project.estimatedBudget && (
                    <Card className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <span className="font-bold text-emerald-600">Rp</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimasi</p>
                                <p className="text-sm font-bold text-slate-800">{formatCurrency(project.estimatedBudget as number)}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <HugeiconsIcon icon={UserIcon} className="size-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PIC</p>
                            <p className="text-sm font-bold text-slate-800">{(project.manager as SafeAny)?.name as string || "-"}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <HugeiconsIcon icon={Calendar03Icon} className="size-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Deadline</p>
                            <p className="text-sm font-bold text-slate-800">
                                {project.endDate
                                    ? new Date(project.endDate as string).toLocaleDateString("id-ID")
                                    : "-"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Phase Stepper */}
            <Card className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <CardContent className="p-6">
                    <PhaseStepper
                        currentPhase={currentPhase}
                        onPhaseClick={handlePhaseClick}
                        activeTab={activeTab}
                    />
                </CardContent>
            </Card>

            {/* Phase Content */}
            <div>
                {activeTab === "PROPOSAL" && (
                    <ProposalForm
                        projectId={project.id}
                        proposal={project.proposal}
                        isCurrentPhase={currentPhase === "PROPOSAL"}
                    />
                )}
                {activeTab === "RKB" && (
                    <RkbForm
                        projectId={project.id}
                        rkbSubmission={project.rkbSubmission}
                        rkbItems={project.rkbItems || []}
                        isCurrentPhase={currentPhase === "RKB"}
                    />
                )}
                {activeTab === "DISBURSEMENT" && (
                    <DisbursementTracker
                        projectId={project.id}
                        disbursement={project.disbursement}
                        rkbTotalBudget={rkbTotalBudget}
                        isCurrentPhase={currentPhase === "DISBURSEMENT"}
                    />
                )}
                {activeTab === "EXECUTION" && (
                    <ExecutionPanel
                        projectId={project.id}
                        executionLogs={project.executionLogs || []}
                        isCurrentPhase={currentPhase === "EXECUTION"}
                    />
                )}
                {activeTab === "COMPLETED" && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Proyek Selesai!</h3>
                            <p className="text-muted-foreground text-sm max-w-md">
                                Seluruh fase SOP telah dilalui. Proyek infrastruktur ini telah selesai dilaksanakan.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
