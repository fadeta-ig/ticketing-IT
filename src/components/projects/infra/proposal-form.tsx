"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    saveProposalAction,
    submitProposalAction
} from "@/app/actions/infra-workflow.actions"
import { ApprovalActions } from "./approval-actions"
import { toast } from "sonner"
import { formatErrorMessage, type SafeAny } from "@/lib/utils"

interface ProposalFormProps {
    projectId: string
    proposal: SafeAny
    isCurrentPhase: boolean
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
    DRAFT: { label: "Draft", variant: "secondary" },
    PENDING: { label: "Menunggu Persetujuan", variant: "default" },
    APPROVED: { label: "Disetujui", variant: "outline" },
    REJECTED: { label: "Ditolak", variant: "destructive" },
    REVISED: { label: "Perlu Revisi", variant: "secondary" },
}

export function ProposalForm({ projectId, proposal, isCurrentPhase }: ProposalFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const status = proposal?.approvalStatus || "DRAFT"
    const statusInfo = STATUS_MAP[status] || STATUS_MAP.DRAFT
    const isEditable = isCurrentPhase && (status === "DRAFT" || status === "REJECTED" || status === "REVISED")

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const formData = new FormData(e.currentTarget)
            await saveProposalAction(projectId, formData)
            toast.success("Proposal tersimpan sebagai draft")
        } catch (error: unknown) {
            toast.error("Gagal menyimpan: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            await submitProposalAction(projectId)
            toast.success("Proposal diajukan untuk persetujuan")
        } catch (error: unknown) {
            toast.error("Gagal mengajukan: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Proposal Proyek</CardTitle>
                    <Badge variant={statusInfo.variant} className={
                        status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""
                    }>
                        {statusInfo.label}
                    </Badge>
                </div>
                {proposal?.approvedBy && status === "APPROVED" && (
                    <p className="text-xs text-muted-foreground">
                        Disetujui oleh <strong>{proposal.approvedBy}</strong> pada {new Date(proposal.approvalDate).toLocaleDateString("id-ID")}
                    </p>
                )}
                {proposal?.rejectionReason && status === "REJECTED" && (
                    <p className="text-xs text-destructive">
                        Alasan penolakan: {proposal.rejectionReason}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="background">Latar Belakang</Label>
                        <Textarea
                            id="background"
                            name="background"
                            defaultValue={proposal?.background || ""}
                            placeholder="Mengapa proyek ini diperlukan..."
                            className="min-h-[80px]"
                            disabled={!isEditable}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="objectives">Tujuan</Label>
                        <Textarea
                            id="objectives"
                            name="objectives"
                            defaultValue={proposal?.objectives || ""}
                            placeholder="Apa yang ingin dicapai..."
                            className="min-h-[60px]"
                            disabled={!isEditable}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="scope">Ruang Lingkup</Label>
                        <Textarea
                            id="scope"
                            name="scope"
                            defaultValue={proposal?.scope || ""}
                            placeholder="Cakupan pekerjaan..."
                            className="min-h-[60px]"
                            disabled={!isEditable}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="benefits">Manfaat</Label>
                            <Textarea
                                id="benefits"
                                name="benefits"
                                defaultValue={proposal?.benefits || ""}
                                placeholder="Manfaat yang diharapkan..."
                                className="min-h-[60px]"
                                disabled={!isEditable}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="riskAnalysis">Analisis Risiko</Label>
                            <Textarea
                                id="riskAnalysis"
                                name="riskAnalysis"
                                defaultValue={proposal?.riskAnalysis || ""}
                                placeholder="Potensi risiko dan mitigasi..."
                                className="min-h-[60px]"
                                disabled={!isEditable}
                            />
                        </div>
                    </div>

                    {isEditable && (
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" variant="outline" disabled={isLoading}>
                                {isLoading ? "Menyimpan..." : "Simpan Draft"}
                            </Button>
                            {(status === "DRAFT" || status === "REJECTED" || status === "REVISED") && (
                                <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                                    {isLoading ? "Mengajukan..." : "Ajukan Proposal"}
                                </Button>
                            )}
                        </div>
                    )}
                </form>

                {status === "PENDING" && isCurrentPhase && (
                    <div className="mt-4 pt-4 border-t">
                        <ApprovalActions
                            projectId={projectId}
                            phase="PROPOSAL"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
