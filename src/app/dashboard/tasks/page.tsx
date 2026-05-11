import { TaskService } from "@/services/task.service"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TaskChecklist } from "@/components/tasks/task-checklist"
import { DownloadDocuments } from "@/components/tasks/download-documents"
import { SlaRequestCard } from "@/components/tasks/sla-request-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function TasksPage() {
    const session = await getServerSession(authOptions)
    if (session?.user?.role === "USER") {
        redirect("/dashboard")
    }

    const tasks = await TaskService.getTasksByUser(session?.user?.id || "")
    if (!tasks) return null

    const dailyTasks = tasks.filter(t => t.frequency === "DAILY")
    const weeklyTasks = tasks.filter(t => t.frequency === "WEEKLY")
    const monthlyTasks = tasks.filter(t => t.frequency === "MONTHLY")

    return (
        <div className="flex flex-1 flex-col gap-8 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tugas Rutin IT</h2>
                    <p className="text-muted-foreground italic">Pantau dan selesaikan checklist pemeliharaan sistem berkala.</p>
                </div>
                <CreateTaskDialog />
            </div>

            {/* Download Documents Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Dokumen IT</h3>
                    <div className="flex-1 border-t border-dashed border-slate-100" />
                </div>
                <DownloadDocuments />
            </div>

            {/* Task Checklist */}
            <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-3 bg-muted/50 p-1">
                    <TabsTrigger value="daily">Harian ({dailyTasks.length})</TabsTrigger>
                    <TabsTrigger value="weekly">Mingguan ({weeklyTasks.length})</TabsTrigger>
                    <TabsTrigger value="monthly">Bulanan ({monthlyTasks.length})</TabsTrigger>
                </TabsList>
                <div className="mt-6">
                    <TabsContent value="daily">
                        <TaskChecklist tasks={dailyTasks} />
                    </TabsContent>
                    <TabsContent value="weekly">
                        <TaskChecklist tasks={weeklyTasks} />
                    </TabsContent>
                    <TabsContent value="monthly">
                        <TaskChecklist tasks={monthlyTasks} />
                    </TabsContent>
                </div>
            </Tabs>

            {/* SLA Request Reference */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Referensi SLA Request</h3>
                    <div className="flex-1 border-t border-dashed border-slate-100" />
                </div>
                <SlaRequestCard />
            </div>
        </div>
    )
}
