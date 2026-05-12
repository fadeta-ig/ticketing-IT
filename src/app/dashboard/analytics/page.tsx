import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AnalyticsService } from "@/services/analytics.service";
import { WorkloadChart } from "@/components/analytics/workload-chart";
import { TrendChart } from "@/components/analytics/trend-chart";
import { ReportGenerator } from "@/components/analytics/report-generator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    Analytics01Icon
} from "@hugeicons/core-free-icons";
import Link from "next/link";

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "USER") {
        redirect("/dashboard");
    }

    const [workloadData, trendData] = await Promise.all([
        AnalyticsService.getTechnicianWorkload(),
        AnalyticsService.getAnnualTrends()
    ]);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest mb-2">
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                            <HugeiconsIcon icon={Analytics01Icon} className="size-6" />
                        </div>
                        Advanced Analytics
                    </h1>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Year Trends - Bigger */}
                <div className="lg:col-span-8">
                    <TrendChart data={trendData} />
                </div>

                {/* Report Generator - Side */}
                <div className="lg:col-span-4">
                    <ReportGenerator />
                </div>

                {/* Workload - Full Width below */}
                <div className="lg:col-span-12">
                    <WorkloadChart data={workloadData} />
                </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-center py-4">
                <p className="text-[11px] font-medium text-slate-400 italic">
                    Data is refreshed in real-time based on ticket activity.
                </p>
            </div>
        </div>
    );
}
