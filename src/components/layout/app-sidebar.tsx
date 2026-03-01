"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    DashboardSquare01Icon,
    Ticket01Icon,
    Building01Icon,
    SourceCodeIcon,
    TaskDaily01Icon,
    Settings01Icon,
    UserIcon,
    Logout01Icon,
    UserMultipleIcon,
    ActivityIcon,
    Book02Icon,
} from "@hugeicons/core-free-icons"
import { signOut, useSession } from "next-auth/react"

import Image from "next/image"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

const items = [
    {
        title: "Beranda",
        url: "/dashboard",
        icon: DashboardSquare01Icon,
    },
    {
        title: "Tiket Bantuan",
        url: "/dashboard/ticketing",
        icon: Ticket01Icon,
    },
    {
        title: "Proyek Infrastruktur",
        url: "/dashboard/infrastructure",
        icon: Building01Icon,
    },
    {
        title: "Proyek Web Dev",
        url: "/dashboard/web-dev",
        icon: SourceCodeIcon,
    },
    {
        title: "Tugas Rutin",
        url: "/dashboard/tasks",
        icon: TaskDaily01Icon,
    },
    {
        title: "Pengaturan",
        url: "/dashboard/settings",
        icon: Settings01Icon,
    },
    {
        title: "Monitoring Uptime",
        url: "/dashboard/monitoring",
        icon: ActivityIcon,
    },
    {
        title: "Pusat Bantuan",
        url: "/dashboard/knowledge-base",
        icon: Book02Icon,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const navItems = React.useMemo(() => {
        let filtered = [...items]

        if (session?.user?.role === "USER") {
            filtered = items.filter(item =>
                item.url === "/dashboard" ||
                item.url === "/dashboard/ticketing"
            )
        }

        if (session?.user?.role === "ADMIN") {
            filtered.push({
                title: "Manajemen Pengguna",
                url: "/dashboard/settings/users",
                icon: UserMultipleIcon,
            })
        }

        return filtered
    }, [session?.user?.role])

    return (
        <Sidebar collapsible="icon" className="border-r border-slate-100 bg-white">
            <SidebarHeader className="pt-5 px-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="h-12 hover:bg-slate-50 rounded-xl transition-all">
                            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 overflow-hidden transition-transform group-hover:scale-105 shrink-0">
                                <Image
                                    src="/Logo WIG.png"
                                    alt="PT WIG Logo"
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col gap-0 ml-2 leading-tight group-data-[state=collapsed]:hidden">
                                <span className="font-bold text-xs text-slate-800 truncate">PT Wijaya Inovasi</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">IT Platform</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="px-2 pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400/80 mb-3">
                        Main Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                        className={`h-10 px-3 rounded-lg transition-all duration-200 ${pathname === item.url
                                            ? "bg-primary/5 text-primary font-bold shadow-sm shadow-primary/5"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                    >
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <HugeiconsIcon
                                                icon={item.icon}
                                                className={`size-4 transition-transform ${pathname === item.url ? "scale-105 text-primary" : ""}`}
                                            />
                                            <span className="text-[13px] tracking-tight">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto pb-4">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                                    className="h-10 px-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                >
                                    <HugeiconsIcon icon={Logout01Icon} className="size-4" />
                                    <span className="text-[13px] font-bold ml-3 uppercase tracking-widest opacity-80">Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
