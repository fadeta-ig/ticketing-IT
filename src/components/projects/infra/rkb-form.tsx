"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import {
    saveRkbAction,
    addRkbItemAction,
    removeRkbItemAction,
    submitRkbAction,
} from "@/app/actions/infra-workflow.actions"
import { ApprovalActions } from "./approval-actions"
import { toast } from "sonner"
import { formatErrorMessage, type SafeAny } from "@/lib/utils"

interface RkbFormProps {
    projectId: string
    rkbSubmission: SafeAny
    rkbItems: SafeAny[]
    isCurrentPhase: boolean
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
    DRAFT: { label: "Draft", variant: "secondary" },
    PENDING: { label: "Menunggu Persetujuan", variant: "default" },
    APPROVED: { label: "Disetujui", variant: "outline" },
    REJECTED: { label: "Ditolak", variant: "destructive" },
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)
}

export function RkbForm({ projectId, rkbSubmission, rkbItems, isCurrentPhase }: RkbFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isAddingItem, setIsAddingItem] = useState(false)
    const status = rkbSubmission?.approvalStatus || "DRAFT"
    const statusInfo = STATUS_MAP[status] || STATUS_MAP.DRAFT
    const isEditable = isCurrentPhase && (status === "DRAFT" || status === "REJECTED")

    const handleSaveHeader = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const formData = new FormData(e.currentTarget)
            await saveRkbAction(projectId, formData)
            toast.success("Data RKB tersimpan")
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsAddingItem(true)
        try {
            const formData = new FormData(e.currentTarget)
            await addRkbItemAction(projectId, formData);
            (e.target as HTMLFormElement).reset()
            toast.success("Item ditambahkan")
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsAddingItem(false)
        }
    }

    const handleRemoveItem = async (itemId: string) => {
        try {
            await removeRkbItemAction(itemId, projectId)
            toast.success("Item dihapus")
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            await submitRkbAction(projectId)
            toast.success("RKB diajukan untuk persetujuan")
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    const totalBudget = rkbItems.reduce((sum: number, item: SafeAny) => sum + (item.totalPrice || 0), 0)

    return (
        <div className="space-y-4">
            {/* RKB Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Rencana Kebutuhan Barang (RKB)</CardTitle>
                        <Badge variant={statusInfo.variant} className={
                            status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""
                        }>
                            {statusInfo.label}
                        </Badge>
                    </div>
                    {rkbSubmission?.rejectionReason && status === "REJECTED" && (
                        <p className="text-xs text-destructive">Alasan penolakan: {rkbSubmission.rejectionReason}</p>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveHeader} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="submissionNumber">Nomor Pengajuan</Label>
                                <Input
                                    id="submissionNumber"
                                    name="submissionNumber"
                                    defaultValue={rkbSubmission?.submissionNumber || ""}
                                    placeholder="RKB/IT/2026/001"
                                    disabled={!isEditable}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Anggaran</Label>
                                <Input value={formatCurrency(totalBudget)} disabled className="font-semibold" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="justification">Justifikasi Kebutuhan</Label>
                            <Textarea
                                id="justification"
                                name="justification"
                                defaultValue={rkbSubmission?.justification || ""}
                                placeholder="Alasan mengapa barang/jasa ini diperlukan..."
                                className="min-h-[60px]"
                                disabled={!isEditable}
                            />
                        </div>
                        {isEditable && (
                            <Button type="submit" variant="outline" disabled={isLoading}>
                                {isLoading ? "Menyimpan..." : "Simpan"}
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* RKB Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Daftar Item Kebutuhan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 pr-3">No</th>
                                    <th className="pb-2 pr-3">Nama Barang/Jasa</th>
                                    <th className="pb-2 pr-3">Spesifikasi</th>
                                    <th className="pb-2 pr-3 text-center">Qty</th>
                                    <th className="pb-2 pr-3">Satuan</th>
                                    <th className="pb-2 pr-3 text-right">Harga Satuan</th>
                                    <th className="pb-2 pr-3 text-right">Total</th>
                                    <th className="pb-2 pr-3">Vendor</th>
                                    {isEditable && <th className="pb-2 w-10"></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {rkbItems.map((item: SafeAny, index: number) => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="py-2 pr-3 text-muted-foreground">{index + 1}</td>
                                        <td className="py-2 pr-3 font-medium">{item.itemName}</td>
                                        <td className="py-2 pr-3 text-muted-foreground text-xs max-w-[150px] truncate">{item.specification || "-"}</td>
                                        <td className="py-2 pr-3 text-center">{item.quantity}</td>
                                        <td className="py-2 pr-3">{item.unit}</td>
                                        <td className="py-2 pr-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                        <td className="py-2 pr-3 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                                        <td className="py-2 pr-3 text-xs">{item.vendor || "-"}</td>
                                        {isEditable && (
                                            <td className="py-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                >
                                                    <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {rkbItems.length === 0 && (
                                    <tr>
                                        <td colSpan={isEditable ? 9 : 8} className="py-6 text-center text-muted-foreground text-sm">
                                            Belum ada item. Tambahkan item kebutuhan di bawah.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {rkbItems.length > 0 && (
                                <tfoot>
                                    <tr className="border-t font-semibold">
                                        <td colSpan={6} className="py-2 pr-3 text-right">Total Keseluruhan:</td>
                                        <td className="py-2 pr-3 text-right text-primary">{formatCurrency(totalBudget)}</td>
                                        <td colSpan={isEditable ? 2 : 1}></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Add Item Form */}
                    {isEditable && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-3">Tambah Item Baru</p>
                            <form onSubmit={handleAddItem} className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="col-span-2 md:col-span-1 space-y-1">
                                        <Label className="text-xs">Nama Barang/Jasa *</Label>
                                        <Input name="itemName" placeholder="Router Mikrotik" required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Spesifikasi</Label>
                                        <Input name="specification" placeholder="RB750Gr3" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Vendor</Label>
                                        <Input name="vendor" placeholder="PT Supplier" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Qty *</Label>
                                        <Input name="quantity" type="number" defaultValue="1" min="1" required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Satuan</Label>
                                        <Input name="unit" defaultValue="Unit" required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Harga Satuan (Rp) *</Label>
                                        <Input name="unitPrice" type="number" placeholder="500000" min="0" required />
                                    </div>
                                </div>
                                <Button type="submit" size="sm" disabled={isAddingItem} className="gap-1.5">
                                    <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                                    {isAddingItem ? "Menambahkan..." : "Tambah Item"}
                                </Button>
                            </form>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submit & Approval */}
            {isEditable && rkbItems.length > 0 && (
                <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Mengajukan..." : "Ajukan RKB untuk Persetujuan"}
                    </Button>
                </div>
            )}

            {status === "PENDING" && isCurrentPhase && (
                <ApprovalActions projectId={projectId} phase="RKB" />
            )}
        </div>
    )
}
