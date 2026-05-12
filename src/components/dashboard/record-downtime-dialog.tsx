"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Timer02Icon, AlertCircleIcon, Calendar03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { recordDowntimeAction } from "@/app/actions/downtime.actions"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/utils"

export function RecordDowntimeDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            await recordDowntimeAction(formData)
            toast.success("Kejadian Downtime Berhasil Dicatat")
            setOpen(false)
        } catch (error: unknown) {
            toast.error("Gagal mencatat downtime: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" />
                    Catat Downtime / Outage
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <HugeiconsIcon icon={Timer02Icon} className="size-5" />
                            Catat Gangguan Layanan
                        </DialogTitle>
                        <DialogDescription>
                            Gunakan form ini untuk mencatat waktu downtime server atau outage ISP.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Waktu Mulai</Label>
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="datetime-local"
                                    required
                                    className="text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">Waktu Selesai</Label>
                                <Input
                                    id="endTime"
                                    name="endTime"
                                    type="datetime-local"
                                    required
                                    className="text-xs"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Alasan Gangguan</Label>
                            <Select name="reason" defaultValue="POWER" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Alasan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="POWER">Gangguan Listrik (PLN)</SelectItem>
                                    <SelectItem value="ISP">Gangguan Internet (ISP)</SelectItem>
                                    <SelectItem value="HARDWARE">Kerusakan Hardware</SelectItem>
                                    <SelectItem value="MAINTENANCE">Pemeliharaan Terencana</SelectItem>
                                    <SelectItem value="OTHER">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="details">Detail Kejadian (Opsional)</Label>
                            <Textarea
                                id="details"
                                name="details"
                                placeholder="Contoh: Pemadaman bergilir area industri..."
                                className="min-h-[80px] text-xs"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                            {isLoading ? "Menyimpan..." : "Simpan Laporan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
