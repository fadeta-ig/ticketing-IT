"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, TaskDaily01Icon } from "@hugeicons/core-free-icons"
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
import { createTaskAction } from "@/app/actions/task.actions"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { formatErrorMessage } from "@/lib/utils"

export function CreateTaskDialog() {
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append("userId", (session?.user as any)?.id || "")

        try {
            await createTaskAction(formData)
            toast.success("Tugas Berhasil Ditambahkan")
            setOpen(false)
        } catch (error: unknown) {
            toast.error("Gagal menambahkan tugas: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                    Tambah Tugas Manual
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HugeiconsIcon icon={TaskDaily01Icon} className="size-5 text-primary" />
                            Tambah Tugas Rutin
                        </DialogTitle>
                        <DialogDescription>
                            Tugas ini akan muncul di daftar checklist sesuai frekuensi yang dipilih.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Nama Tugas</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Contoh: Backup Database HRIS"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Frekuensi</Label>
                            <Select name="frequency" defaultValue="DAILY">
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Frekuensi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAILY">Harian</SelectItem>
                                    <SelectItem value="WEEKLY">Mingguan</SelectItem>
                                    <SelectItem value="MONTHLY">Bulanan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi (Opsional)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Detail langkah pengerjaan..."
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Menyimpan..." : "Simpan Tugas"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
