import { ProjectService } from "@/services/project.service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { GlobalIcon, ComputerIcon, Calendar01Icon, UserIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { WebEnvironmentForm } from "@/components/projects/web-environment-form"
import { ProjectTasksList } from "@/components/projects/project-tasks-list"
import Link from "next/link"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    PLANNING: { label: "Backlog", className: "bg-slate-100 text-slate-600 border-slate-200" },
    IN_PROGRESS: { label: "Dikerjakan", className: "bg-blue-50 text-blue-600 border-blue-200" },
    ON_HOLD: { label: "Tertunda", className: "bg-amber-50 text-amber-600 border-amber-200" },
    COMPLETED: { label: "Selesai", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
}

export default async function WebDevDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (session?.user?.role === "USER") {
        redirect("/dashboard")
    }

    const project = await ProjectService.getProjectById(params.id)

    if (!project || project.type !== "WEB_DEV") {
        redirect("/dashboard/web-dev")
    }

    const status = STATUS_MAP[project.status] || STATUS_MAP.PLANNING

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/dashboard/web-dev" className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors group">
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
                        <Badge variant="outline" className={`shrink-0 ${status.className}`}>
                            {status.label}
                        </Badge>
                    </div>
                    {project.websiteName && (
                        <div className="flex items-center gap-1.5 text-sm text-primary font-semibold mt-1">
                            <HugeiconsIcon icon={GlobalIcon} className="size-4" />
                            <span>{project.websiteName}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 relative z-10">Deskripsi Proyek</h3>
                        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap relative z-10">
                            {project.description || "Tidak ada deskripsi yang ditambahkan untuk proyek ini."}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-5">
                        <WebEnvironmentForm project={project} />
                    </div>

                    <div className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-5">
                        <ProjectTasksList project={project} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 space-y-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 relative z-10">Informasi Proyek</h3>
                        
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5"><HugeiconsIcon icon={UserIcon} className="size-3.5"/>PIC Proyek</span>
                            <p className="text-sm font-bold text-slate-800">{project.manager?.name || "Belum ditentukan"}</p>
                        </div>
                        
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5"><HugeiconsIcon icon={ComputerIcon} className="size-3.5"/>Target Environment</span>
                            <p className="text-sm font-bold text-slate-800">{project.environment || "—"}</p>
                        </div>
                        
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5"><HugeiconsIcon icon={Calendar01Icon} className="size-3.5"/>Dibuat Pada</span>
                            <p className="text-sm font-bold text-slate-800">
                                {new Date(project.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
