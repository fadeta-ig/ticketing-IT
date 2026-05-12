"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Building01Icon, Calendar03Icon, UserIcon, Delete02Icon, LocationIcon } from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { deleteProjectAction } from "@/app/actions/project.actions"
import { toast } from "sonner"
import { useState } from "react"
import { formatErrorMessage, type SafeAny } from "@/lib/utils"
import Link from "next/link"

const PHASE_LABELS: Record<string, string> = {
    PROPOSAL: "Proposal",
    RKB: "RKB",
    DISBURSEMENT: "Pencairan",
    EXECUTION: "Eksekusi",
    COMPLETED: "Selesai",
}

const PHASE_ORDER = ["PROPOSAL", "RKB", "DISBURSEMENT", "EXECUTION", "COMPLETED"]

export function InfrastructureProjectCard({ project }: { project: SafeAny }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const currentPhase = project.currentPhase || "PROPOSAL"
    const phaseIndex = PHASE_ORDER.indexOf(currentPhase)
    const phaseProgress = ((phaseIndex) / (PHASE_ORDER.length - 1)) * 100

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteProjectAction(project.id)
            toast.success("Proyek Dihapus")
            setIsConfirmOpen(false)
        } catch (error: unknown) {
            toast.error("Gagal menghapus: " + formatErrorMessage(error))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-md">
            <Link href={`/dashboard/infrastructure/${project.id}`}>
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <HugeiconsIcon icon={Building01Icon} className="size-5" />
                        </div>
                        <div className="flex gap-1.5">
                            <Badge variant="outline" className={
                                currentPhase === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                                    : "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]"
                            }>
                                {PHASE_LABELS[currentPhase] || currentPhase}
                            </Badge>
                            {project.endDate && new Date(project.endDate as string) < new Date() && currentPhase !== "COMPLETED" ? (
                                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] animate-pulse">
                                    Overdue
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">
                                    {project.status as string}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 space-y-1">
                        <CardTitle className="leading-none">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">
                            {project.description || "Tidak ada deskripsi."}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Fase SOP</span>
                            <span className="font-semibold">{phaseIndex + 1}/{PHASE_ORDER.length}</span>
                        </div>
                        <Progress value={phaseProgress} className="h-1.5" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className={`flex items-center gap-1.5 ${project.endDate && new Date(project.endDate as string) < new Date() && currentPhase !== "COMPLETED" ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                            <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                            <span>{project.endDate ? new Date(project.endDate as string).toLocaleDateString("id-ID") : "Belum diatur"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <HugeiconsIcon icon={UserIcon} className="size-3.5" />
                            <span className="truncate">{project.manager?.name || "No PIC"}</span>
                        </div>
                        {project.category && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HugeiconsIcon icon={Building01Icon} className="size-3.5" />
                                <span>{project.category}</span>
                            </div>
                        )}
                        {project.location && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <HugeiconsIcon icon={LocationIcon} className="size-3.5" />
                                <span className="truncate">{project.location}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Link>

            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsConfirmOpen(true) }}
                >
                    <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                </Button>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                variant="destructive"
                title="Hapus Proyek?"
                description={`Apakah Anda yakin ingin menghapus proyek "${project.name}"? Semua data terkait akan ikut terhapus.`}
                confirmText="Hapus Proyek"
            />
        </Card>
    )
}
