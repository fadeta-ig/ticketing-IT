import prisma from "@/lib/prisma";
import { Priority } from "@prisma/client";

/** Default SLA targets (in minutes) when no SlaPolicy exists in DB */
const DEFAULT_SLA_TARGETS: Record<Priority, { responseMins: number; resolutionMins: number }> = {
    URGENT: { responseMins: 15, resolutionMins: 120 },
    HIGH: { responseMins: 30, resolutionMins: 480 },
    MEDIUM: { responseMins: 60, resolutionMins: 1440 },
    LOW: { responseMins: 120, resolutionMins: 2880 },
};

export class SlaService {
    /**
     * Fetch the SLA policy for a given priority.
     * Falls back to sensible defaults if no policy is configured.
     */
    static async getPolicyForPriority(priority: Priority) {
        const policy = await prisma.slaPolicy.findUnique({ where: { priority } });

        if (policy) {
            return {
                responseTimeMins: policy.responseTimeMins,
                resolutionTimeMins: policy.resolutionTimeMins,
                businessHoursOnly: policy.businessHoursOnly,
            };
        }

        const fallback = DEFAULT_SLA_TARGETS[priority];
        return {
            responseTimeMins: fallback.responseMins,
            resolutionTimeMins: fallback.resolutionMins,
            businessHoursOnly: true,
        };
    }

    /** Get all SLA policies (for the settings page) */
    static async getAllPolicies() {
        const policies = await prisma.slaPolicy.findMany({
            orderBy: { priority: "asc" },
        });

        // Fill missing priorities with defaults
        const priorities: Priority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];
        return priorities.map((p) => {
            const existing = policies.find((pol) => pol.priority === p);
            if (existing) return existing;
            const fallback = DEFAULT_SLA_TARGETS[p];
            return {
                id: null,
                priority: p,
                responseTimeMins: fallback.responseMins,
                resolutionTimeMins: fallback.resolutionMins,
                businessHoursOnly: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });
    }

    /** Create or update an SLA policy for a priority */
    static async upsertPolicy(data: {
        priority: Priority;
        responseTimeMins: number;
        resolutionTimeMins: number;
        businessHoursOnly: boolean;
    }) {
        return await prisma.slaPolicy.upsert({
            where: { priority: data.priority },
            update: {
                responseTimeMins: data.responseTimeMins,
                resolutionTimeMins: data.resolutionTimeMins,
                businessHoursOnly: data.businessHoursOnly,
            },
            create: data,
        });
    }

    /**
     * Calculate the due date for a ticket based on its priority.
     * Uses business hours (Mon-Fri 08:00-17:00, 540 min/day) when applicable.
     */
    static async calculateDueDate(priority: Priority, createdAt: Date): Promise<Date> {
        const policy = await this.getPolicyForPriority(priority);

        if (!policy.businessHoursOnly) {
            return new Date(createdAt.getTime() + policy.resolutionTimeMins * 60 * 1000);
        }

        return this.addBusinessMinutes(createdAt, policy.resolutionTimeMins);
    }

    /**
     * Add minutes counting only business hours (Mon-Fri 08:00-17:00).
     * 1 business day = 540 minutes.
     */
    static addBusinessMinutes(startDate: Date, minutes: number): Date {
        const WORK_START_HOUR = 8;
        const WORK_END_HOUR = 17;
        const MINUTES_PER_DAY = (WORK_END_HOUR - WORK_START_HOUR) * 60; // 540

        let remaining = minutes;
        const cursor = new Date(startDate);

        // If starting outside business hours, snap to next business day start
        if (cursor.getDay() === 0 || cursor.getDay() === 6) {
            this.moveToNextBusinessDay(cursor, WORK_START_HOUR);
        } else if (cursor.getHours() >= WORK_END_HOUR) {
            cursor.setDate(cursor.getDate() + 1);
            this.moveToNextBusinessDay(cursor, WORK_START_HOUR);
        } else if (cursor.getHours() < WORK_START_HOUR) {
            cursor.setHours(WORK_START_HOUR, 0, 0, 0);
        }

        while (remaining > 0) {
            if (cursor.getDay() === 0 || cursor.getDay() === 6) {
                this.moveToNextBusinessDay(cursor, WORK_START_HOUR);
                continue;
            }

            const endOfDay = new Date(cursor);
            endOfDay.setHours(WORK_END_HOUR, 0, 0, 0);

            const minutesLeftToday = Math.floor((endOfDay.getTime() - cursor.getTime()) / 60000);

            if (remaining <= minutesLeftToday) {
                cursor.setTime(cursor.getTime() + remaining * 60000);
                remaining = 0;
            } else {
                remaining -= minutesLeftToday;
                cursor.setDate(cursor.getDate() + 1);
                cursor.setHours(WORK_START_HOUR, 0, 0, 0);
            }
        }

        return cursor;
    }

    /** Helper: Move date cursor to the next weekday at the given hour */
    private static moveToNextBusinessDay(date: Date, hour: number) {
        while (date.getDay() === 0 || date.getDay() === 6) {
            date.setDate(date.getDate() + 1);
        }
        date.setHours(hour, 0, 0, 0);
    }

    /** Check whether a ticket has breached its SLA */
    static isBreached(dueAt: Date | null): boolean {
        if (!dueAt) return false;
        return new Date() > dueAt;
    }

    /** Get SLA status label & color for a ticket */
    static getSlaStatus(dueAt: Date | null, resolvedAt: Date | null): { label: string; color: string } {
        if (!dueAt) return { label: "Tidak Ada SLA", color: "slate" };

        if (resolvedAt) {
            return resolvedAt <= dueAt
                ? { label: "Selesai Tepat Waktu", color: "green" }
                : { label: "Selesai Terlambat", color: "red" };
        }

        const now = new Date();
        const timeLeft = dueAt.getTime() - now.getTime();
        const totalMins = timeLeft / 60000;

        if (totalMins <= 0) return { label: "SLA Terlewat", color: "red" };
        if (totalMins <= 60) return { label: "Hampir Habis", color: "amber" };
        return { label: "Dalam Target", color: "green" };
    }

    /** Get SLA compliance stats for the dashboard */
    static async getComplianceStats(days: number = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const tickets = await prisma.ticket.findMany({
            where: {
                createdAt: { gte: since },
                resolvedAt: { not: null },
            },
            select: {
                dueAt: true,
                resolvedAt: true,
                priority: true,
                firstResponseAt: true,
                createdAt: true,
            },
        });

        const total = tickets.length;
        const onTime = tickets.filter((t) => t.dueAt && t.resolvedAt && t.resolvedAt <= t.dueAt).length;
        const breached = total - onTime;
        const complianceRate = total > 0 ? Math.round((onTime / total) * 100) : 100;

        // Average Resolution Time in hours
        let totalResolutionMins = 0;
        tickets.forEach((t) => {
            if (t.resolvedAt) {
                totalResolutionMins += (t.resolvedAt.getTime() - t.createdAt.getTime()) / 60000;
            }
        });
        const avgResolutionHours = total > 0 ? (totalResolutionMins / total / 60).toFixed(1) : "0";

        return { total, onTime, breached, complianceRate, avgResolutionHours };
    }
}
