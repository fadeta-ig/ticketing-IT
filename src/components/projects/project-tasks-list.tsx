"use client"

import { useState, useTransition } from "react"
import { createProjectTaskAction, toggleProjectTaskAction, deleteProjectTaskAction } from "@/app/actions/web-dev.actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { Plus } from "lucide-react"

export function ProjectTasksList({ project }: { project: any }) {
    const tasks = project.projectTasks || []
    const [isPending, startTransition] = useTransition()
    const [newTaskTitle, setNewTaskTitle] = useState("")

    const handleCreate = () => {
        if (!newTaskTitle.trim()) return
        startTransition(async () => {
            try {
                await createProjectTaskAction(project.id, newTaskTitle)
                setNewTaskTitle("")
                toast.success("Tugas ditambahkan")
            } catch (error: any) {
                toast.error(error.message)
            }
        })
    }

    const handleToggle = (id: string, isCompleted: boolean) => {
        startTransition(async () => {
            try {
                await toggleProjectTaskAction(id, isCompleted)
            } catch (error: any) {
                toast.error(error.message)
            }
        })
    }

    const handleDelete = (id: string) => {
        startTransition(async () => {
            try {
                await deleteProjectTaskAction(id)
            } catch (error: any) {
                toast.error(error.message)
            }
        })
    }

    const progress = tasks.length > 0 ? Math.round((tasks.filter((t: any) => t.isCompleted).length / tasks.length) * 100) : 0

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">To-Do / Fitur & Bugs</h3>
                {tasks.length > 0 && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{progress}% Selesai</span>
                )}
            </div>

            <div className="flex gap-2">
                <Input 
                    value={newTaskTitle} 
                    onChange={e => setNewTaskTitle(e.target.value)} 
                    placeholder="Tambah tugas baru..." 
                    className="h-8 text-sm"
                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                />
                <Button size="icon" onClick={handleCreate} disabled={isPending || !newTaskTitle.trim()} className="h-8 w-8 shrink-0">
                    <Plus className="size-4" />
                </Button>
            </div>

            <div className="space-y-1 mt-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {tasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">Belum ada tugas untuk proyek ini.</p>
                ) : (
                    tasks.map((task: any) => (
                        <div key={task.id} className="flex items-center gap-3 group bg-slate-50/50 p-2 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                            <input
                                type="checkbox"
                                checked={task.isCompleted}
                                onChange={(e) => handleToggle(task.id, e.target.checked)}
                                className="rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                disabled={isPending}
                            />
                            <span className={`flex-1 text-sm transition-colors ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {task.title}
                            </span>
                            <button 
                                onClick={() => handleDelete(task.id)} 
                                disabled={isPending}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                            >
                                <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
