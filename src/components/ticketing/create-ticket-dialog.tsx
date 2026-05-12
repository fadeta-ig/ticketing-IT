"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Ticket01Icon } from "@hugeicons/core-free-icons"
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
import { createTicketAction } from "@/app/actions/ticket.actions"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { formatErrorMessage } from "@/lib/utils"

export function CreateTicketDialog() {
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        if (session?.user?.id) {
            formData.append("creatorId", (session.user as any).id)
        } else {
            formData.append("creatorId", "")
        }

        try {
            await createTicketAction(formData)
            toast.success("Tiket Berhasil Dibuat")
            setOpen(false)
        } catch (error: unknown) {
            toast.error("Gagal membuat tiket: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                    <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                    Buat Tiket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HugeiconsIcon icon={Ticket01Icon} className="size-5 text-primary" />
                            Buat Tiket Bantuan Baru
                        </DialogTitle>
                        <DialogDescription>
                            Isi detail masalah IT yang Anda hadapi di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul Masalah</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Contoh: Printer Rusak di Lantai 2"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi Lengkap</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Jelaskan masalah secara detail..."
                                className="min-h-[100px]"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="classification">Klasifikasi</Label>
                                <Select name="classification" defaultValue="HARDWARE" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HARDWARE">Hardware</SelectItem>
                                        <SelectItem value="SOFTWARE">Software</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <Select name="category" defaultValue="WIFI" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LAPTOP">Laptop</SelectItem>
                                        <SelectItem value="TABLET">Tablet</SelectItem>
                                        <SelectItem value="HP">Smartphone</SelectItem>
                                        <SelectItem value="WIFI">WiFi/Internet</SelectItem>
                                        <SelectItem value="PRINTER">Printer</SelectItem>
                                        <SelectItem value="OTHER">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Prioritas</Label>
                            <Select name="priority" defaultValue="MEDIUM">
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Prioritas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Rendah</SelectItem>
                                    <SelectItem value="MEDIUM">Sedang</SelectItem>
                                    <SelectItem value="HIGH">Tinggi</SelectItem>
                                    <SelectItem value="URGENT">Mendesak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Mengirim..." : "Kirim Tiket"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
