"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, MailIcon, ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updateSelfAction } from "@/app/actions/user.actions"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/utils"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function ProfileSettingsPage() {
    const { data: session, update } = useSession()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            await updateSelfAction(formData)
            await update() // Update client-side session
            toast.success("Profil berhasil diperbarui")
        } catch (error: unknown) {
            toast.error("Gagal memperbarui profil: " + formatErrorMessage(error))
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
                    <h2 className="text-2xl font-bold tracking-tight">Profil Saya</h2>
                    <p className="text-sm text-muted-foreground italic">Ubah informasi identitas Anda di platform.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                        <CardDescription>Update nama dan alamat email yang terdaftar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <div className="relative">
                                <HugeiconsIcon icon={UserIcon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={session?.user?.name || ""}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Alamat Email</Label>
                            <div className="relative">
                                <HugeiconsIcon icon={MailIcon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={session?.user?.email || ""}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/10 px-6 py-4 flex justify-end">
                        <Button type="submit" disabled={isLoading} className="shadow-lg shadow-primary/20">
                            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
