"use client"

import { useEffect, useState, useCallback } from "react"
import { MonitoringCard } from "@/components/monitoring/monitoring-card"
import { MONITORING_TARGETS, MonitoringStatus } from "@/types/monitoring"
import { getUptimeStatusAction } from "@/app/actions/monitoring.actions"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon, SignalIcon, GlobalIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function MonitoringDashboard() {
    const [statuses, setStatuses] = useState<MonitoringStatus[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    const fetchStatus = useCallback(async (isManual = false) => {
        if (isManual) setIsLoading(true)
        try {
            const results = await getUptimeStatusAction()
            setStatuses(results)
            setLastUpdated(new Date())
            if (isManual) toast.success("Monitoring data updated")
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStatus()
        // Auto refresh every 60 seconds
        const interval = setInterval(() => fetchStatus(), 60000)
        return () => clearInterval(interval)
    }, [fetchStatus])

    const getStatusForId = (id: string) => statuses.find(s => s.id === id)

    const networkNodes = MONITORING_TARGETS.filter(t => t.type === "IP")
    const webServices = MONITORING_TARGETS.filter(t => t.type === "WEBSITE")

    return (
        <div className="flex flex-1 flex-col gap-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Monitoring Uptime</h2>
                    <p className="text-muted-foreground italic mt-1">
                        Pantaun status konektivitas infrastruktur dan server secara real-time.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Last Updated</p>
                        <p className="text-xs font-mono font-medium text-slate-600">
                            {lastUpdated.toLocaleTimeString("id-ID")}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchStatus(true)}
                        disabled={isLoading}
                        className="gap-2 shadow-sm border-slate-200"
                    >
                        <HugeiconsIcon icon={Refresh01Icon} className={cn("size-4", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="space-y-10">
                {/* Network Nodes */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="size-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                            <HugeiconsIcon icon={SignalIcon} className="size-3.5 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest opacity-80 italic">Network Nodes (IP)</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {networkNodes.map((target) => (
                            <MonitoringCard
                                key={target.id}
                                name={target.name}
                                address={target.address}
                                type={target.type}
                                status={getStatusForId(target.id)}
                                isLoading={isLoading}
                            />
                        ))}
                    </div>
                </section>

                {/* Web Services */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="size-6 rounded-md bg-purple-500/10 flex items-center justify-center">
                            <HugeiconsIcon icon={GlobalIcon} className="size-3.5 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest opacity-80 italic">Web Services (SaaS)</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {webServices.map((target) => (
                            <MonitoringCard
                                key={target.id}
                                name={target.name}
                                address={target.address}
                                type={target.type}
                                status={getStatusForId(target.id)}
                                isLoading={isLoading}
                            />
                        ))}
                    </div>
                </section>
            </div>

            <div className="mt-auto pt-8 border-t border-dashed flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500" />
                        Operational
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-red-500" />
                        Incident
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-slate-300" />
                        Pending
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">
                    Uptime data is refreshed automatically every 60 seconds.
                </p>
            </div>
        </div>
    )
}
