"use server"

import { SettingsService } from "@/services/settings.service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { AuditService } from "@/services/audit.service"

export async function updateSystemSettingAction(key: string, value: string) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Hanya admin yang dapat mengubah pengaturan sistem")
    }

    try {
        await SettingsService.setSetting(key, value)

        await AuditService.logAction({
            action: "UPDATE",
            entity: "SYSTEM_SETTING",
            entityId: key,
            details: `Memperbarui pengaturan sistem: ${key}`,
            userId: session.user.id
        })

        revalidatePath("/dashboard/settings/system")
        return { success: true }
    } catch (error) {
        throw new Error("Gagal menyimpan pengaturan")
    }
}
