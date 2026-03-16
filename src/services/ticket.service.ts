import prisma from "@/lib/prisma";
import { Priority, TicketStatus } from "@prisma/client";
import { DowntimeService } from "./downtime.service";

export class TicketService {
    static async getAllTickets(userId?: string) {
        return await prisma.ticket.findMany({
            where: userId ? { creatorId: userId } : undefined,
            include: {
                creator: {
                    select: { name: true, email: true }
                },
                assignee: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getTicketById(id: string) {
        return await prisma.ticket.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { name: true, email: true }
                },
                assignee: {
                    select: { name: true, email: true }
                },
                comments: {
                    include: {
                        author: {
                            select: { name: true, image: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }

    static async createTicket(data: {
        title: string;
        description: string;
        priority: Priority;
        category: string;
        classification: string;
        creatorId: string;
    }) {
        return await prisma.ticket.create({
            data: {
                ...data,
                status: TicketStatus.OPEN
            }
        });
    }

    static async getKPIData() {
        const last30Days = new Date(new Date().setDate(new Date().getDate() - 30));

        // Get Downtime Stats
        const downtimeStats = await DowntimeService.getDowntimeStats(30);

        // 1. Optimize Ticket Counts (Delegated to DB Layer)
        const [totalTickets, resolvedCount] = await Promise.all([
            prisma.ticket.count({
                where: { createdAt: { gte: last30Days } }
            }),
            prisma.ticket.count({
                where: {
                    createdAt: { gte: last30Days },
                    status: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }
                }
            })
        ]);

        // 2. Optimize Category Count via Prisma GroupBy (Eliminate .filter & any)
        const categoryGroup = await prisma.ticket.groupBy({
            by: ['category'],
            where: { createdAt: { gte: last30Days } },
            _count: { category: true }
        });

        const categoryDistribution = { LAPTOP: 0, WIFI: 0, HP: 0, OTHER: 0 };
        categoryGroup.forEach(group => {
            const cat = group.category?.toUpperCase();
            if (cat === "LAPTOP") categoryDistribution.LAPTOP = group._count.category;
            else if (cat === "WIFI") categoryDistribution.WIFI = group._count.category;
            else if (cat === "HP") categoryDistribution.HP = group._count.category;
            else if (cat === "OTHER") categoryDistribution.OTHER = group._count.category;
        });

        // 3. Optimize MTTR & SLA memory limits (Select ONLY required fields, not whole tables)
        const resolvedTickets = await prisma.ticket.findMany({
            where: {
                createdAt: { gte: last30Days },
                status: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }
            },
            select: {
                createdAt: true,
                updatedAt: true,
                priority: true
            }
        });

        let totalResolutionTime = 0;
        let slaCompliantCount = 0;

        resolvedTickets.forEach(ticket => {
            const resTime = (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
            totalResolutionTime += resTime;

            const limit = (ticket.priority === Priority.HIGH || ticket.priority === Priority.URGENT) ? 24 : 48;
            if (resTime <= limit) slaCompliantCount++;
        });

        const mttr = resolvedCount > 0 ? (totalResolutionTime / resolvedCount).toFixed(1) : "0";
        const slaRate = resolvedCount > 0 ? ((slaCompliantCount / resolvedCount) * 100).toFixed(0) : "100";

        return {
            totalTickets,
            resolvedCount,
            mttr,
            slaRate,
            uptime: downtimeStats.uptimePercentage,
            totalDowntime: downtimeStats.totalDowntimeMinutes,
            categoryDistribution
        };
    }

    static async updateTicket(id: string, data: Partial<{
        title: string;
        description: string;
        priority: Priority;
        status: TicketStatus;
        category: string;
        classification: string;
        assigneeId: string;
    }>) {
        return await prisma.ticket.update({
            where: { id },
            data
        });
    }

    static async deleteTicket(id: string) {
        return await prisma.ticket.delete({
            where: { id }
        });
    }

    static async addComment(ticketId: string, authorId: string, content: string) {
        return await prisma.comment.create({
            data: {
                ticketId,
                authorId,
                content,
            }
        });
    }
}
