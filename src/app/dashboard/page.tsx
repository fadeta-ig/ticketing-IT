import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { TicketService } from "@/services/ticket.service"
import { ProjectService } from "@/services/project.service"
import { TaskService } from "@/services/task.service"
import { AuditService } from "@/services/audit.service"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import {
    Ticket01Icon,
    Building01Icon,
    SourceCodeIcon,
    TaskDaily01Icon,
    ActivityIcon,
    UserIcon,
    ArrowRight01Icon,
    ChartBarLineIcon
} from "@hugeicons/core-free-icons"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Link from "next/link"
import { redirect } from "next/navigation"

import { ITKPIDashboard } from "@/components/dashboard/kpi-dashboard"
import { RecordDowntimeDialog } from "@/components/dashboard/record-downtime-dialog"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    // Admins see everything, Users see their specific stats
    const isUser = session?.user?.role === "USER"
    const userId = session?.user?.id || ""

    // Fetch Real Data
    const [tickets, projectsInfra, projectsWeb, tasks, rawLogs, kpiData] = await Promise.all([
        TicketService.getAllTickets(isUser ? userId : undefined) as Promise<any[]>,
        ProjectService.getAllProjects("INFRASTRUCTURE") as Promise<any[]>,
        ProjectService.getAllProjects("WEB_DEV") as Promise<any[]>,
        TaskService.getTasksByUser(userId) as Promise<any[]>,
        !isUser ? AuditService.getLogs(5) as Promise<any[]> : Promise.resolve([]),
        !isUser ? TicketService.getKPIData() : Promise.resolve(null)
    ])

    const openTicketsCount = tickets.filter(t => t.status === "OPEN").length
    const activeInfraCount = projectsInfra.filter(p => p.status === "IN_PROGRESS").length
    const activeWebCount = projectsWeb.filter(p => p.status === "IN_PROGRESS").length
    const todayTasks = tasks.filter(t => t.frequency === "DAILY")
    const completedTasksCount = todayTasks.filter(t => t.isCompleted).length

    const stats = [
        {
            title: isUser ? "Tiket Saya" : "Tiket Terbuka",
            value: openTicketsCount.toString(),
            description: "Butuh Perhatian",
            icon: Ticket01Icon,
            color: "text-blue-500",
            bg: "bg-blue-50/50",
            border: "border-blue-100/50"
        },
        ...(!isUser ? [
            {
                title: "Infra Aktif",
                value: activeInfraCount.toString(),
                description: "Dalam Progres",
                icon: Building01Icon,
                color: "text-orange-500",
                bg: "bg-orange-50/50",
                border: "border-orange-100/50"
            },
            {
                title: "Web Aktif",
                value: activeWebCount.toString(),
                description: "Dalam Dev",
                icon: SourceCodeIcon,
                color: "text-purple-500",
                bg: "bg-purple-50/50",
                border: "border-purple-100/50"
            },
            {
                title: "Tugas Rutin",
                value: `${completedTasksCount}/${todayTasks.length}`,
                description: "Progres Terkini",
                icon: TaskDaily01Icon,
                color: "text-emerald-500",
                bg: "bg-emerald-50/50",
                border: "border-emerald-100/50"
            },
        ] : [])
    ]

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
            {/* KPI Dashboard for Admins */}
            {!isUser && kpiData && (
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <HugeiconsIcon icon={ChartBarLineIcon} className="size-3.5" />
                                IT Performance KPI
                            </h2>
                            <Link href="/dashboard/analytics" className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full hover:bg-primary/10 transition-colors uppercase tracking-widest flex items-center gap-1">
                                Full Analytics <HugeiconsIcon icon={ArrowRight01Icon} className="size-2" />
                            </Link>
                        </div>
                        <RecordDowntimeDialog />
                    </div>
                    <ITKPIDashboard data={kpiData} />
                </div>
            )}

            {/* Stats Header */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="group border-primary/10 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white rounded-2xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-5">
                            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100/50 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                <HugeiconsIcon icon={stat.icon} className="size-4 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{stat.description}</span>
                        </CardHeader>
                        <CardContent className="pb-4 px-5">
                            <div className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</div>
                            <p className="text-[12px] font-bold text-slate-500 mt-0.5 uppercase tracking-tighter opacity-80">
                                {stat.title}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className={`grid gap-4 ${isUser ? "grid-cols-1" : "lg:grid-cols-12"}`}>
                {/* Tickets Section */}
                <Card className={`${isUser ? "col-span-1" : "lg:col-span-7"} border-primary/10 shadow-[0_2px_15px_rgba(0,0,0,0.01)] bg-white rounded-2xl overflow-hidden`}>
                    <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-slate-50">
                        <div className="space-y-0.5">
                            <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">{isUser ? "My Tickets" : "Recent Tickets"}</CardTitle>
                            <CardDescription className="text-[11px] font-medium text-slate-400">
                                {isUser ? "Status of your help requests" : "Latest employee support requests"}
                            </CardDescription>
                        </div>
                        <Link href="/dashboard/ticketing" className="text-[10px] font-bold text-primary flex items-center gap-1 hover:opacity-70 transition-opacity uppercase tracking-widest">
                            View All <HugeiconsIcon icon={ArrowRight01Icon} className="size-2.5" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {tickets.length > 0 ? tickets.slice(0, 4).map((ticket) => (
                                <Link href={`/dashboard/ticketing/${ticket.id}`} key={ticket.id} className="group flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-300 group-hover:text-primary transition-colors border border-transparent group-hover:border-primary/10">
                                        <HugeiconsIcon icon={Ticket01Icon} className="size-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[13px] font-bold text-slate-700 truncate mb-0.5 group-hover:text-slate-900 transition-colors">
                                            {ticket.title}
                                        </h4>
                                        <p className="text-[10px] font-medium text-slate-400/80">
                                            {isUser ? `Created ${formatDistanceToNow(ticket.createdAt, { addSuffix: true, locale: id })}` : `${ticket.creator?.name || "Anon"} • ${formatDistanceToNow(ticket.createdAt, { addSuffix: true, locale: id })}`}
                                        </p>
                                    </div>
                                    <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border border-slate-100 bg-slate-50 text-slate-400 group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/5 transition-all`}>
                                        {ticket.priority}
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-center py-8">
                                    <p className="text-xs font-medium text-slate-400 italic">No tickets found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side Column */}
                {!isUser && (
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        {/* Daily Tasks Card */}
                        <Card className="border-primary/10 shadow-[0_2px_15px_rgba(0,0,0,0.01)] bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="px-6 py-5 border-b border-slate-50">
                                <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">Daily To-Do</CardTitle>
                                <CardDescription className="text-[11px] font-medium text-slate-400">
                                    Routine maintenance tasks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 py-4">
                                <div className="space-y-3">
                                    {todayTasks.length > 0 ? todayTasks.slice(0, 5).map((task) => (
                                        <div key={task.id} className="flex items-center gap-3 group">
                                            <div className={`size-4 rounded border transition-all duration-300 flex items-center justify-center ${task.isCompleted
                                                ? 'bg-primary border-primary'
                                                : 'border-slate-200 group-hover:border-primary/50'
                                                }`}>
                                                {task.isCompleted && <div className="size-1 bg-white rounded-full" />}
                                            </div>
                                            <span className={`text-[13px] font-medium transition-colors ${task.isCompleted ? 'text-slate-300 line-through' : 'text-slate-500 group-hover:text-slate-800'
                                                }`}>
                                                {task.title}
                                            </span>
                                        </div>
                                    )) : (
                                        <p className="text-[11px] font-medium text-slate-400 italic">No tasks for today</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audit Logs Card */}
                        <Card className="flex-1 border-primary/10 shadow-[0_2px_15px_rgba(0,0,0,0.01)] bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="px-6 py-4 border-b border-slate-50">
                                <CardTitle className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <HugeiconsIcon icon={ActivityIcon} className="size-3.5" />
                                    System Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50">
                                    {rawLogs.length > 0 ? rawLogs.map((log: any) => (
                                        <div key={log.id} className="px-6 py-3.5 flex items-start gap-3">
                                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-300">
                                                <HugeiconsIcon icon={UserIcon} className="size-3.5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] leading-relaxed">
                                                    <span className="font-bold text-slate-700">{log.user?.name || "System"}</span>
                                                    <span className="text-slate-400 px-1">{log.action}</span>
                                                    <span className="font-bold text-primary/80">{log.entity}</span>
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase mt-1 tracking-tighter">
                                                    {formatDistanceToNow(log.timestamp, { addSuffix: true, locale: id })}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center py-6 text-[11px] font-medium text-slate-400 italic">No activity logs</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
