"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface WorkloadData {
    name: string;
    total: number;
    resolved: number;
    inProgress: number;
    open: number;
}

export function WorkloadChart({ data }: { data: WorkloadData[] }) {
    return (
        <Card className="border-primary/10 shadow-sm bg-white rounded-2xl overflow-hidden h-full">
            <CardHeader className="px-6 py-5 border-b border-slate-50">
                <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">Technician Workload</CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-400">
                    Distribution of tickets among IT staff
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-6 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            cursor={{ fill: '#f8fafc' }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', paddingBottom: '20px' }}
                        />
                        <Bar name="Resolved" dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar name="In Progress" dataKey="inProgress" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar name="Open" dataKey="open" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
