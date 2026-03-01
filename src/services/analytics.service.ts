import prisma from "@/lib/prisma";
import { TicketStatus, Priority } from "@prisma/client";
import { startOfMonth, endOfMonth, subMonths, format, startOfYear } from "date-fns";

export class AnalyticsService {
    static async getTechnicianWorkload() {
        const technicians = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'STAFF'] }
            },
            select: {
                id: true,
                name: true,
                assignedTickets: {
                    select: {
                        status: true
                    }
                }
            }
        });

        return technicians.map(tech => ({
            name: tech.name || "Unknown",
            total: tech.assignedTickets.length,
            resolved: tech.assignedTickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length,
            inProgress: tech.assignedTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
            open: tech.assignedTickets.filter(t => t.status === TicketStatus.OPEN).length,
        }));
    }

    static async getAnnualTrends() {
        const now = new Date();
        const startOfThisYear = startOfYear(now);

        // Get tickets for the last 12 months
        const tickets = await prisma.ticket.findMany({
            where: {
                createdAt: {
                    gte: subMonths(now, 11)
                }
            },
            select: {
                createdAt: true,
                status: true
            }
        });

        const downtimes = await prisma.downtime.findMany({
            where: {
                startTime: {
                    gte: subMonths(now, 11)
                }
            }
        });

        const months = [];
        for (let i = 11; i >= 0; i--) {
            const date = subMonths(now, i);
            const monthKey = format(date, "MMM yyyy");
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);

            const monthTickets = tickets.filter(t =>
                t.createdAt >= monthStart && t.createdAt <= monthEnd
            );

            const monthDowntime = downtimes.filter(d =>
                d.startTime >= monthStart && d.startTime <= monthEnd
            ).reduce((total, d) => {
                if (!d.endTime) return total;
                return total + (d.endTime.getTime() - d.startTime.getTime()) / (1000 * 60);
            }, 0);

            months.push({
                month: monthKey,
                tickets: monthTickets.length,
                resolved: monthTickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length,
                downtime: Math.round(monthDowntime)
            });
        }

        return months;
    }

    static async getMonthlySnapshot(month?: number, year?: number) {
        const targetDate = (month !== undefined && year !== undefined)
            ? new Date(year, month - 1)
            : new Date();

        const monthStart = startOfMonth(targetDate);
        const monthEnd = endOfMonth(targetDate);

        const tickets = await prisma.ticket.findMany({
            where: {
                createdAt: {
                    gte: monthStart,
                    lte: monthEnd
                }
            },
            include: {
                assignee: { select: { name: true } },
                creator: { select: { name: true } }
            }
        });

        const resolvedTickets = tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED);

        // SLA Calculation
        let slaCompliant = 0;
        resolvedTickets.forEach(t => {
            const resTime = (t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
            const limit = (t.priority === Priority.HIGH || t.priority === Priority.URGENT) ? 24 : 48;
            if (resTime <= limit) slaCompliant++;
        });

        const slaRate = resolvedTickets.length > 0
            ? Math.round((slaCompliant / resolvedTickets.length) * 100)
            : 100;

        return {
            period: format(targetDate, "MMMM yyyy"),
            totalTickets: tickets.length,
            resolvedTickets: resolvedTickets.length,
            slaRate,
            tickets: tickets.map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                category: t.category,
                assignee: t.assignee?.name || "Unassigned",
                createdAt: t.createdAt
            }))
        };
    }
}
