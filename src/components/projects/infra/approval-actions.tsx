"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import {
    approveProposalAction,
    rejectProposalAction,
    approveRkbAction,
    rejectRkbAction,
    approveDisbursementAction,
    rejectDisbursementAction,
} from "@/app/actions/infra-workflow.actions"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/utils"

type Phase = "PROPOSAL" | "RKB" | "DISBURSEMENT"

interface ApprovalActionsProps {
    projectId: string
    phase: Phase
}

const approveHandlers: Record<Phase, (id: string) => Promise<any>> = {
    PROPOSAL: approveProposalAction,
    RKB: approveRkbAction,
    DISBURSEMENT: approveDisbursementAction,
}

const rejectHandlers: Record<Phase, (id: string, reason: string) => Promise<any>> = {
    PROPOSAL: rejectProposalAction,
    RKB: rejectRkbAction,
    DISBURSEMENT: rejectDisbursementAction,
}

const phaseLabels: Record<Phase, string> = {
    PROPOSAL: "Proposal",
    RKB: "RKB",
    DISBURSEMENT: "Pencairan Dana",
}

export function ApprovalActions({ projectId, phase }: ApprovalActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showRejectForm, setShowRejectForm] = useState(false)
    const [reason, setReason] = useState("")

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            await approveHandlers[phase](projectId)
            toast.success(`${phaseLabels[phase]} disetujui!`)
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        if (!reason.trim()) {
            toast.error("Alasan penolakan wajib diisi")
            return
        }
        setIsLoading(true)
        try {
            await rejectHandlers[phase](projectId, reason)
            toast.success(`${phaseLabels[phase]} ditolak`)
            setShowRejectForm(false)
            setReason("")
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
                Tindakan Persetujuan — {phaseLabels[phase]}
            </p>
            <div className="flex gap-2">
                <Button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                    {isLoading ? "Memproses..." : "Setujui"}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    disabled={isLoading}
                    className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                    <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                    Tolak
                </Button>
            </div>

            {showRejectForm && (
                <div className="space-y-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Alasan penolakan..."
                        className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isLoading}
                        >
                            {isLoading ? "Memproses..." : "Konfirmasi Tolak"}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setShowRejectForm(false); setReason("") }}
                        >
                            Batal
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
