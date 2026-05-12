"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateSystemSettingAction } from "@/app/actions/settings.actions"
import { formatErrorMessage } from "@/lib/utils"

export function SystemSettingsForm({ initialWaNumber }: { initialWaNumber: string }) {
    const [waNumber, setWaNumber] = useState(initialWaNumber)
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        if (!waNumber.trim()) {
            toast.error("Nomor WhatsApp tidak boleh kosong")
            return
        }

        setIsLoading(true)
        try {
            await updateSystemSettingAction("WA_ADMIN_NUMBER", waNumber)
            toast.success("Pengaturan berhasil disimpan")
        } catch (error: unknown) {
            toast.error("Gagal menyimpan: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifikasi WhatsApp</CardTitle>
                <CardDescription>Atur nomor tujuan penerima notifikasi tiket baru (Admin IT).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="wa_admin">Nomor WhatsApp Admin</Label>
                    <div className="flex gap-3">
                        <Input
                            id="wa_admin"
                            value={waNumber}
                            onChange={(e) => setWaNumber(e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className="max-w-md"
                        />
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Format disarankan: gunakan 08xxx atau 628xxx tanpa spasi/strip.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
