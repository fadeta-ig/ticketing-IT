import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { SettingsService } from "@/services/settings.service"
import { SystemSettingsForm } from "@/components/settings/system-settings-form"

export default async function SystemSettingsPage() {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard/settings")
    }

    const waAdminNumber = await SettingsService.getSetting("WA_ADMIN_NUMBER", "081553821808")

    return (
        <div className="flex flex-1 flex-col gap-6 p-8 max-w-3xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h2>
                <p className="text-muted-foreground italic">Konfigurasi variabel sistem global seperti nomor WhatsApp admin.</p>
            </div>

            <SystemSettingsForm initialWaNumber={waAdminNumber} />
        </div>
    )
}
