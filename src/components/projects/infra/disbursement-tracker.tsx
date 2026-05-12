"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    saveDisbursementAction,
    submitDisbursementAction,
} from "@/app/actions/infra-workflow.actions"
import { ApprovalActions } from "./approval-actions"
import { toast } from "sonner"
import { formatErrorMessage, type SafeAny } from "@/lib/utils"

interface DisbursementTrackerProps {
    projectId: string
    disbursement: SafeAny
    rkbTotalBudget: number
    isCurrentPhase: boolean
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
    DRAFT: { label: "Draft", variant: "secondary" },
    PENDING: { label: "Menunggu Pencairan", variant: "default" },
    APPROVED: { label: "Dana Cair", variant: "outline" },
    REJECTED: { label: "Ditolak", variant: "destructive" },
}

export function DisbursementTracker({ projectId, disbursement, rkbTotalBudget, isCurrentPhase }: DisbursementTrackerProps) {
    const [isLoading, setIsLoading] = useState(false)
    const status = disbursement?.approvalStatus || "DRAFT"
    const statusInfo = STATUS_MAP[status] || STATUS_MAP.DRAFT
    const isEditable = isCurrentPhase && (status === "DRAFT" || status === "REJECTED")

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const formData = new FormData(e.currentTarget)
            await saveDisbursementAction(projectId, formData)
            toast.success("Data pencairan tersimpan")
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            await submitDisbursementAction(projectId)
            toast.success("Pencairan dana diajukan")
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pencairan Dana</CardTitle>
                    <Badge variant={statusInfo.variant} className={
                        status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""
                    }>
                        {statusInfo.label}
                    </Badge>
                </div>
                {disbursement?.approvedBy && status === "APPROVED" && (
                    <p className="text-xs text-muted-foreground">
                        Disetujui oleh <strong>{disbursement.approvedBy}</strong> pada {new Date(disbursement.approvalDate).toLocaleDateString("id-ID")}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                {/* Budget Reference */}
                <div className="p-3 rounded-lg bg-muted/50 mb-4 text-sm">
                    <span className="text-muted-foreground">Total Anggaran RKB: </span>
                    <span className="font-semibold text-primary">{formatCurrency(rkbTotalBudget)}</span>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="approvedBudget">Anggaran Disetujui (Rp)</Label>
                            <Input
                                id="approvedBudget"
                                name="approvedBudget"
                                type="number"
                                defaultValue={disbursement?.approvedBudget || ""}
                                placeholder="Masukkan jumlah"
                                disabled={!isEditable}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="disbursedAmount">Jumlah Dicairkan (Rp)</Label>
                            <Input
                                id="disbursedAmount"
                                name="disbursedAmount"
                                type="number"
                                defaultValue={disbursement?.disbursedAmount || ""}
                                placeholder="Masukkan jumlah"
                                disabled={!isEditable}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="disbursementDate">Tanggal Pencairan</Label>
                            <Input
                                id="disbursementDate"
                                name="disbursementDate"
                                type="date"
                                defaultValue={disbursement?.disbursementDate ? new Date(disbursement.disbursementDate).toISOString().split("T")[0] : ""}
                                disabled={!isEditable}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                            <Select name="paymentMethod" defaultValue={disbursement?.paymentMethod || ""} disabled={!isEditable}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih metode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="PETTY_CASH">Kas Kecil</SelectItem>
                                    <SelectItem value="CREDIT">Kredit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="referenceNumber">Nomor Referensi Pembayaran</Label>
                        <Input
                            id="referenceNumber"
                            name="referenceNumber"
                            defaultValue={disbursement?.referenceNumber || ""}
                            placeholder="TRF-20260219-001"
                            disabled={!isEditable}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            defaultValue={disbursement?.notes || ""}
                            placeholder="Catatan pencairan..."
                            className="min-h-[60px]"
                            disabled={!isEditable}
                        />
                    </div>

                    {isEditable && (
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" variant="outline" disabled={isLoading}>
                                {isLoading ? "Menyimpan..." : "Simpan"}
                            </Button>
                            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? "Mengajukan..." : "Ajukan Pencairan"}
                            </Button>
                        </div>
                    )}
                </form>

                {status === "PENDING" && isCurrentPhase && (
                    <div className="mt-4 pt-4 border-t">
                        <ApprovalActions projectId={projectId} phase="DISBURSEMENT" />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
