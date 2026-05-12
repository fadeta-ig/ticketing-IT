"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import {
    addExecutionLogAction,
    completeProjectAction,
} from "@/app/actions/infra-workflow.actions"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { toast } from "sonner"
import { formatErrorMessage, type SafeAny } from "@/lib/utils"

interface ExecutionPanelProps {
    projectId: string
    executionLogs: SafeAny[]
    isCurrentPhase: boolean
}

export function ExecutionPanel({ projectId, executionLogs, isCurrentPhase }: ExecutionPanelProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isCompleteOpen, setIsCompleteOpen] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)

    const latestProgress = executionLogs.length > 0 ? executionLogs[0].progressPercentage : 0

    const handleAddLog = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const formData = new FormData(e.currentTarget)
            await addExecutionLogAction(projectId, formData);
            (e.target as HTMLFormElement).reset()
            toast.success("Log eksekusi ditambahkan")
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const handleComplete = async () => {
        setIsCompleting(true)
        try {
            await completeProjectAction(projectId)
            toast.success("Proyek diselesaikan!")
            setIsCompleteOpen(false)
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsCompleting(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Eksekusi Proyek</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress Terkini</span>
                            <span className="font-bold text-lg">{latestProgress}%</span>
                        </div>
                        <Progress value={latestProgress} className="h-3" />
                    </div>

                    {isCurrentPhase && latestProgress >= 100 && (
                        <div className="pt-2">
                            <Button
                                onClick={() => setIsCompleteOpen(true)}
                                className="gap-2 w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                                Tandai Proyek Selesai
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Execution Log */}
            {isCurrentPhase && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Tambah Log Eksekusi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddLog} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="activityDescription">Deskripsi Kegiatan *</Label>
                                <Textarea
                                    id="activityDescription"
                                    name="activityDescription"
                                    placeholder="Hari ini telah dilakukan pemasangan..."
                                    className="min-h-[60px]"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="executionDate">Tanggal</Label>
                                    <Input
                                        id="executionDate"
                                        name="executionDate"
                                        type="date"
                                        defaultValue={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="progressPercentage">Progress (%)</Label>
                                    <Input
                                        id="progressPercentage"
                                        name="progressPercentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue={latestProgress}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="completedBy">Dilakukan Oleh</Label>
                                    <Input
                                        id="completedBy"
                                        name="completedBy"
                                        placeholder="Nama pelaksana"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="findings">Temuan/Catatan</Label>
                                <Textarea
                                    id="findings"
                                    name="findings"
                                    placeholder="Catatan atau temuan selama eksekusi..."
                                    className="min-h-[50px]"
                                />
                            </div>
                            <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
                                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                                {isLoading ? "Menambahkan..." : "Tambah Log"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Execution Timeline */}
            {executionLogs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Riwayat Eksekusi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {executionLogs.map((log: SafeAny) => (
                                <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-muted last:pb-0">
                                    <div className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-primary" />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{new Date(log.executionDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                                            <span>•</span>
                                            <span className="font-medium text-primary">{log.progressPercentage}%</span>
                                            {log.completedBy && <span>• {log.completedBy}</span>}
                                        </div>
                                        <p className="text-sm">{log.activityDescription}</p>
                                        {log.findings && (
                                            <p className="text-xs text-muted-foreground italic mt-1">Temuan: {log.findings}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <ConfirmModal
                isOpen={isCompleteOpen}
                onClose={() => setIsCompleteOpen(false)}
                onConfirm={handleComplete}
                isLoading={isCompleting}
                title="Selesaikan Proyek?"
                description="Apakah Anda yakin proyek ini sudah 100% selesai? Status akan berubah menjadi COMPLETED."
                confirmText="Ya, Selesaikan"
            />
        </div>
    )
}
