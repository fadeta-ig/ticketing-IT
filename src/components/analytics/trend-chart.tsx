"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TrendData {
    month: string;
    tickets: number;
    resolved: number;
    downtime: number;
}

export function TrendChart({ data }: { data: TrendData[] }) {
    return (
        <Card className="border-primary/10 shadow-sm bg-white rounded-2xl overflow-hidden h-full">
            <CardHeader className="px-6 py-5 border-b border-slate-50">
                <CardTitle className="text-sm font-bold text-slate-800 tracking-tight">Annual Disturbance Trends</CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-400">
                    Ticket volume vs Downtime duration
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-6 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorDowntime" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', paddingBottom: '20px' }}
                        />
                        <Area
                            type="monotone"
                            name="Ticket Volume"
                            dataKey="tickets"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorTickets)"
                            strokeWidth={3}
                        />
                        <Area
                            type="monotone"
                            name="Downtime (min)"
                            dataKey="downtime"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorDowntime)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
