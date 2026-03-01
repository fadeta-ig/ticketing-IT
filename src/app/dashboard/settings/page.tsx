import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Settings01Icon, UserMultipleIcon, SecurityCheckIcon, Timer02Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === "ADMIN"

    const settingsItems = [
        {
            title: "Profil Saya",
            description: "Kelola informasi pribadi, nama, dan alamat email Anda.",
            icon: UserIcon,
            href: "/dashboard/settings/profile",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "Keamanan",
            description: "Ganti kata sandi dan amankan akun Anda.",
            icon: SecurityCheckIcon,
            href: "/dashboard/settings/security",
            color: "text-amber-500",
            bg: "bg-amber-50"
        },
        ...(isAdmin ? [
            {
                title: "Manajemen Pengguna",
                description: "Kelola akun pengguna, peran, dan akses sistem.",
                icon: UserMultipleIcon,
                href: "/dashboard/settings/users",
                color: "text-purple-500",
                bg: "bg-purple-50"
            },
            {
                title: "Kebijakan SLA",
                description: "Atur target waktu respon dan penyelesaian tiket berdasarkan prioritas.",
                icon: Timer02Icon,
                href: "/dashboard/settings/sla",
                color: "text-emerald-500",
                bg: "bg-emerald-50"
            }
        ] : [])
    ]

    return (
        <div className="flex flex-1 flex-col gap-8 p-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
                <p className="text-muted-foreground italic">Kelola profil, keamanan, dan preferensi akun Anda.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {settingsItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20">
                            <CardHeader className="flex flex-row items-center gap-4 py-4">
                                <div className={`flex size-10 items-center justify-center rounded-xl ${item.bg} ${item.color} transition-transform group-hover:scale-110`}>
                                    <HugeiconsIcon icon={item.icon} className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-relaxed">
                                    {item.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
