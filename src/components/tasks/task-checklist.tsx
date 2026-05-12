"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { toggleTaskCompletionAction, deleteTaskAction } from "@/app/actions/task.actions"
import { toast } from "sonner"
import { cn, formatErrorMessage, type SafeAny } from "@/lib/utils"

const ITEMS_PER_PAGE = 6

export function TaskChecklist({ tasks }: { tasks: SafeAny[] }) {
    const [currentPage, setCurrentPage] = useState(1)
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Pagination Logic
    const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedTasks = tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const handleToggle = async (id: string, isCompleted: boolean) => {
        try {
            await toggleTaskCompletionAction(id, isCompleted)
            toast.success(isCompleted ? "Tugas selesai" : "Tugas dibuka kembali")
        } catch (error: unknown) {
            toast.error("Gagal memperbarui tugas: " + formatErrorMessage(error))
        }
    }

    const handleDelete = async () => {
        if (!taskToDelete) return
        setIsDeleting(true)

        try {
            await deleteTaskAction(taskToDelete)
            toast.success("Tugas dihapus")
            setTaskToDelete(null)
            setTaskToDelete(null)
        } catch (error: unknown) {
            toast.error("Gagal menghapus tugas: " + formatErrorMessage(error))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-3">
                {paginatedTasks.length > 0 ? (
                    paginatedTasks.map((task) => (
                        <Card key={task.id} className={cn(
                            "group transition-all hover:shadow-sm",
                            task.isCompleted && "bg-muted/50 opacity-70"
                        )}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <Checkbox
                                        checked={task.isCompleted}
                                        onCheckedChange={(checked) => handleToggle(task.id, !!checked)}
                                    />
                                    <div className="space-y-0.5">
                                        <p className={cn(
                                            "text-sm font-semibold",
                                            task.isCompleted && "line-through text-muted-foreground"
                                        )}>
                                            {task.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {task.description || "Tidak ada deskripsi."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {task.lastCompletedAt && (
                                        <span className="text-[10px] text-muted-foreground italic">
                                            Selesai: {new Date(task.lastCompletedAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity"
                                        onClick={() => setTaskToDelete(task.id)}
                                    >
                                        <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                        Belum ada tugas untuk kategori ini.
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="pt-2 border-none"
            />

            <ConfirmModal
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                variant="destructive"
                title="Hapus Tugas?"
                description="Tugas ini akan dihapus dari daftar harian Anda. Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus Tugas"
            />
        </div>
    )
}
