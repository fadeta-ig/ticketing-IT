"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Delete02Icon,
    ViewIcon,
    MoreVerticalIcon,
    ArrowRight02Icon,
    GlobalIcon,
    ComputerIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { Pagination } from "@/components/ui/pagination"
import { updateProjectStatusAction, deleteProjectAction } from "@/app/actions/project.actions"
import { toast } from "sonner"
import { formatErrorMessage } from "@/lib/utils"
import { useRouter } from "next/navigation"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    PLANNING: {
        label: "Backlog",
        className: "bg-slate-100 text-slate-600 border-slate-200",
    },
    IN_PROGRESS: {
        label: "Dikerjakan",
        className: "bg-blue-50 text-blue-600 border-blue-200",
    },
    ON_HOLD: {
        label: "Tertunda",
        className: "bg-amber-50 text-amber-600 border-amber-200",
    },
    COMPLETED: {
        label: "Selesai",
        className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
}

const STATUS_OPTIONS = [
    { id: "PLANNING", title: "Backlog" },
    { id: "IN_PROGRESS", title: "Dikerjakan" },
    { id: "ON_HOLD", title: "Tertunda" },
    { id: "COMPLETED", title: "Selesai" },
]

const ROWS_PER_PAGE = 10



export function KanbanBoard({ initialProjects }: { initialProjects: any[] }) {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [filterStatus, setFilterStatus] = useState<string | null>(null)
    const [projectToDelete, setProjectToDelete] = useState<any | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const filteredProjects = filterStatus
        ? initialProjects.filter(p => p.status === filterStatus)
        : initialProjects

    const totalPages = Math.ceil(filteredProjects.length / ROWS_PER_PAGE)
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    )

    const handleMove = async (id: string, status: string) => {
        try {
            await updateProjectStatusAction(id, status as any)
            toast.success(`Status diperbarui ke ${STATUS_MAP[status]?.label || status}`)
        } catch (error: any) {
            toast.error("Gagal memperbarui: " + formatErrorMessage(error))
        }
    }

    const handleDelete = async () => {
        if (!projectToDelete) return
        setIsDeleting(true)
        try {
            await deleteProjectAction(projectToDelete.id)
            toast.success("Proyek berhasil dihapus")
            setProjectToDelete(null)
        } catch (error: any) {
            toast.error("Gagal menghapus: " + formatErrorMessage(error))
        } finally {
            setIsDeleting(false)
        }
    }

    /** Counts per status for filter tabs */
    const statusCounts: Record<string, number> = {}
    for (const p of initialProjects) {
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
    }

    return (
        <div className="space-y-4">
            {/* Filter tabs */}
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 p-1 w-fit">
                <button
                    onClick={() => { setFilterStatus(null); setCurrentPage(1) }}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filterStatus === null
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Semua <span className="ml-1 text-[10px] opacity-60">{initialProjects.length}</span>
                </button>
                {STATUS_OPTIONS.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => { setFilterStatus(opt.id); setCurrentPage(1) }}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filterStatus === opt.id
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {opt.title} <span className="ml-1 text-[10px] opacity-60">{statusCounts[opt.id] || 0}</span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-background overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Proyek</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Website</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">PIC</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Env</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Diperbarui</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paginatedProjects.length > 0 ? paginatedProjects.map((project) => {
                            const status = STATUS_MAP[project.status] || STATUS_MAP.PLANNING
                            return (
                                <tr
                                    key={project.id}
                                    className="group transition-colors hover:bg-muted/30 cursor-pointer"
                                    onClick={() => router.push(`/dashboard/web-dev/${project.id}`)}
                                >
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-foreground">{project.name}</span>
                                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                                            {project.description || "Tidak ada deskripsi"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        {project.websiteName ? (
                                            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                                <HugeiconsIcon icon={GlobalIcon} className="size-3.5 shrink-0" />
                                                <span className="truncate max-w-[160px]">{project.websiteName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-xs text-muted-foreground">{project.manager?.name || "—"}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                                        {project.environment ? (
                                            <Badge variant="outline" className="text-[10px] uppercase border-purple-200 bg-purple-50 text-purple-600">
                                                <HugeiconsIcon icon={ComputerIcon} className="size-3 mr-1" />
                                                {project.environment}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant="outline" className={`text-[10px] ${status.className}`}>
                                            {status.label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right hidden md:table-cell">
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(project.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/web-dev/${project.id}`)}>
                                                    <HugeiconsIcon icon={ViewIcon} className="mr-2 size-3.5" />
                                                    Lihat Detail
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {STATUS_OPTIONS.filter(s => s.id !== project.status).map(s => (
                                                    <DropdownMenuItem key={s.id} onClick={() => handleMove(project.id, s.id)}>
                                                        <HugeiconsIcon icon={ArrowRight02Icon} className="mr-2 size-3.5" />
                                                        {s.title}
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setProjectToDelete(project)}
                                                    className="text-red-500 focus:text-red-500"
                                                >
                                                    <HugeiconsIcon icon={Delete02Icon} className="mr-2 size-3.5" />
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground italic">
                                    {filterStatus ? "Tidak ada proyek dengan status ini." : "Belum ada proyek."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}



            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                variant="destructive"
                title="Hapus Proyek?"
                description={`Apakah Anda yakin ingin menghapus proyek "${projectToDelete?.name}"? Tindakan ini akan menghapus semua data terkait.`}
                confirmText="Ya, Hapus"
            />
        </div>
    )
}
