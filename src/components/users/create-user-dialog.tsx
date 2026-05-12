"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, MailIcon, Settings01Icon } from "@hugeicons/core-free-icons"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createUserAction } from "@/app/actions/user.actions"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/utils"

export function CreateUserDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            await createUserAction(formData)
            toast.success("Pengguna Berhasil Ditambahkan")
            setOpen(false)
        } catch (error: unknown) {
            toast.error("Gagal menambahkan pengguna: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                    <HugeiconsIcon icon={UserIcon} className="size-4" />
                    Tambah Pengguna
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HugeiconsIcon icon={UserIcon} className="size-5 text-primary" />
                            Tambah Pengguna Baru
                        </DialogTitle>
                        <DialogDescription>
                            Daftarkan akun baru untuk tim IT atau karyawan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input id="name" name="name" placeholder="Budi Santoso" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Alamat Email</Label>
                            <Input id="email" name="email" type="email" placeholder="budi@wijayainovasi.id" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Peran (Role)</Label>
                            <Select name="role" defaultValue="USER">
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Peran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                    <SelectItem value="STAFF">IT Staff</SelectItem>
                                    <SelectItem value="USER">User (Karyawan)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Kata Sandi Awal</Label>
                            <Input id="password" name="password" type="password" placeholder="******" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Menyimpan..." : "Simpan Pengguna"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
