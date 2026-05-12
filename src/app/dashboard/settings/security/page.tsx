"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SecurityCheckIcon, Key01Icon, ArrowLeft02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { changePasswordAction } from "@/app/actions/user.actions"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/utils"
import Link from "next/link"

export default function SecuritySettingsPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            await changePasswordAction(formData)
            toast.success("Password berhasil diubah")
            // Clear form
            const form = e.target as HTMLFormElement
            form.reset()
        } catch (error: unknown) {
            toast.error("Gagal mengubah password: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-8 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/dashboard/settings">
                        <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Keamanan Akun</h2>
                    <p className="text-sm text-muted-foreground italic">Kelola kredensial dan amankan akses akun Anda.</p>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
                <HugeiconsIcon icon={InformationCircleIcon} className="size-5 shrink-0 mt-0.5" />
                <p>Gunakan kombinasi password yang kuat dengan campuran huruf, angka, dan simbol untuk keamanan maksimal.</p>
            </div>

            <Card className="border-none shadow-sm">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <HugeiconsIcon icon={Key01Icon} className="size-5" />
                            Ganti Password
                        </CardTitle>
                        <CardDescription>Ubah password Anda secara berkala untuk menjaga keamanan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Password Saat Ini</Label>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                placeholder="******"
                                required
                            />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-dashed">
                            <Label htmlFor="newPassword">Password Baru</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                placeholder="Minimal 6 karakter"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Ulangi password baru"
                                required
                                minLength={6}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/10 px-6 py-4 flex justify-end">
                        <Button type="submit" disabled={isLoading} className="shadow-lg shadow-primary/20">
                            {isLoading ? "Update Password" : "Update Password"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
