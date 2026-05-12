"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserEdit01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { updateUserAction } from "@/app/actions/user.actions"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/utils"

interface EditUserDialogProps {
    user: { id: string; name: string; email: string; role: string } | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    if (!user) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            await updateUserAction(user.id, formData)
            toast.success("Data pengguna berhasil diperbarui")
            onOpenChange(false)
        } catch (error: unknown) {
            toast.error("Gagal memperbarui: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HugeiconsIcon icon={UserEdit01Icon} className="size-5 text-primary" />
                            Edit Pengguna
                        </DialogTitle>
                        <DialogDescription>
                            Ubah nama, email, peran, atau reset kata sandi pengguna.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Lengkap</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                defaultValue={user.name}
                                placeholder="Nama pengguna"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Alamat Email</Label>
                            <Input
                                id="edit-email"
                                name="email"
                                type="email"
                                defaultValue={user.email}
                                placeholder="email@wijayainovasi.id"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Peran (Role)</Label>
                            <Select name="role" defaultValue={user.role}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Peran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                    <SelectItem value="STAFF">IT Staff</SelectItem>
                                    <SelectItem value="USER">User (Karyawan)</SelectItem>
                                    <SelectItem value="HR">HR</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Kata Sandi Baru</Label>
                            <Input
                                id="edit-password"
                                name="password"
                                type="password"
                                placeholder="Kosongkan jika tidak ingin mengubah"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Kosongkan jika tidak ingin mengubah kata sandi.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
