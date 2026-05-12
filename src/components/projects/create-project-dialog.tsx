"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Building01Icon, Calendar03Icon, UserIcon, GlobalIcon, ComputerIcon, LocationIcon, MoneyReceiveSquareIcon } from "@hugeicons/core-free-icons"
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
import { createProjectAction } from "@/app/actions/project.actions"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { formatErrorMessage } from "@/lib/utils"

export function CreateProjectDialog({ defaultType }: { defaultType: "INFRASTRUCTURE" | "WEB_DEV" }) {
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        if (session?.user?.id) {
            formData.append("managerId", (session.user as any).id)
        } else {
            formData.append("managerId", "") // Fallback if session.user.id is not available
        }
        formData.append("type", defaultType)

        try {
            await createProjectAction(formData)
            toast.success("Proyek Berhasil Dibuat")
            setOpen(false)
        } catch (error: unknown) {
            toast.error("Gagal membuat proyek: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                    <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                    {defaultType === "INFRASTRUCTURE" ? "Proyek Infra Baru" : "Proyek Web Baru"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HugeiconsIcon icon={Building01Icon} className="size-5 text-primary" />
                            Buat Proyek {defaultType === "INFRASTRUCTURE" ? "Infrastruktur" : "Web Dev"}
                        </DialogTitle>
                        <DialogDescription>
                            Tentukan detail proyek dan estimasi waktu pengerjaan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Proyek</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Contoh: Upgrade Server Core"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Tujuan dan cakupan proyek..."
                                className="min-h-[80px]"
                            />
                        </div>

                        {defaultType === "WEB_DEV" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="websiteName">Nama Website/Sistem</Label>
                                    <div className="relative">
                                        <HugeiconsIcon icon={GlobalIcon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="websiteName"
                                            name="websiteName"
                                            placeholder="Contoh: wig-hris.com"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="environment">Environment</Label>
                                    <Select name="environment" defaultValue="PRODUCTION">
                                        <SelectTrigger className="pl-9 relative">
                                            <HugeiconsIcon icon={ComputerIcon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <SelectValue placeholder="Pilih Environment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PRODUCTION">Production</SelectItem>
                                            <SelectItem value="STAGING">Staging</SelectItem>
                                            <SelectItem value="DEVELOPMENT">Development</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {defaultType === "INFRASTRUCTURE" && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Kategori</Label>
                                        <Select name="category">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Server">Server</SelectItem>
                                                <SelectItem value="Network">Network</SelectItem>
                                                <SelectItem value="CCTV">CCTV</SelectItem>
                                                <SelectItem value="Printer">Printer</SelectItem>
                                                <SelectItem value="UPS">UPS</SelectItem>
                                                <SelectItem value="PC/Laptop">PC/Laptop</SelectItem>
                                                <SelectItem value="Telepon">Telepon</SelectItem>
                                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Lokasi Instalasi</Label>
                                        <div className="relative">
                                            <HugeiconsIcon icon={LocationIcon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="location"
                                                name="location"
                                                placeholder="Gedung A Lt. 2"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="requestedBy">Pemohon / Departemen</Label>
                                        <div className="relative">
                                            <HugeiconsIcon icon={UserIcon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="requestedBy"
                                                name="requestedBy"
                                                placeholder="Dept. Produksi"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estimatedBudget">Estimasi Anggaran (Rp)</Label>
                                        <div className="relative">
                                            <HugeiconsIcon icon={MoneyReceiveSquareIcon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="estimatedBudget"
                                                name="estimatedBudget"
                                                type="number"
                                                placeholder="5000000"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Tanggal Mulai</Label>
                                <div className="relative">
                                    <HugeiconsIcon icon={Calendar03Icon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Tenggat Waktu</Label>
                                <div className="relative">
                                    <HugeiconsIcon icon={Calendar03Icon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Mengaktifkan..." : "Buat Proyek"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
