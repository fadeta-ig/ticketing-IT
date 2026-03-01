import prisma from "@/lib/prisma";

export class DowntimeService {
    static async recordDowntime(data: {
        startTime: Date;
        endTime?: Date;
        reason: any; // Keep any for enum if not imported, or use DowntimeReason
        details?: string;
    }) {
        return await prisma.downtime.create({
            data
        });
    }

    static async getDowntimeStats(days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const downtimes = await prisma.downtime.findMany({
            where: {
                startTime: {
                    gte: startDate
                }
            }
        });

        const totalDowntimeMinutes = downtimes.reduce((total, d) => {
            if (!d.endTime) return total;
            const diff = d.endTime.getTime() - d.startTime.getTime();
            return total + (diff / (1000 * 60));
        }, 0);

        const totalPeriodMinutes = days * 24 * 60;
        const uptimePercentage = ((totalPeriodMinutes - totalDowntimeMinutes) / totalPeriodMinutes) * 100;

        return {
            totalDowntimeMinutes: Math.round(totalDowntimeMinutes),
            uptimePercentage: Math.max(0, Math.min(100, Number(uptimePercentage.toFixed(2)))),
            incidentCount: downtimes.length,
            reasonBreakdown: {
                POWER: (downtimes as any[]).filter(d => d.reason === "POWER").length,
                ISP: (downtimes as any[]).filter(d => d.reason === "ISP").length,
                HARDWARE: (downtimes as any[]).filter(d => d.reason === "HARDWARE").length,
                MAINTENANCE: (downtimes as any[]).filter(d => d.reason === "MAINTENANCE").length,
                OTHER: (downtimes as any[]).filter(d => d.reason === "OTHER").length,
            }
        };
    }
}
