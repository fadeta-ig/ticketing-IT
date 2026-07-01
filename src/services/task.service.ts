import prisma from "@/lib/prisma";
import { TaskFrequency } from "@prisma/client";

export class TaskService {
    static async createTask(data: {
        title: string;
        description?: string;
        frequency: TaskFrequency;
        userId: string;
    }) {
        return await prisma.task.create({
            data: {
                ...data,
                isCompleted: false
            }
        });
    }

    static async getTasksByUser(userId: string) {
        return await prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getTaskById(id: string) {
        return await prisma.task.findUnique({
            where: { id }
        });
    }

    static async updateTask(id: string, data: Partial<{
        title: string;
        description: string;
        frequency: TaskFrequency;
        isCompleted: boolean;
        lastCompletedAt: Date;
    }>) {
        return await prisma.task.update({
            where: { id },
            data
        });
    }

    static async deleteTask(id: string) {
        return await prisma.task.delete({
            where: { id }
        });
    }

    static async toggleTask(id: string, isCompleted: boolean) {
        return await prisma.task.update({
            where: { id },
            data: {
                isCompleted,
                lastCompletedAt: isCompleted ? new Date() : undefined
            }
        });
    }

    static async resetRecurringTasks() {
        // Logic to reset DAILY tasks at midnight, etc.
        // This could be run by a cron job
        const now = new Date();
        // Example: Reset all daily tasks that were completed yesterday
        return await prisma.task.updateMany({
            where: {
                frequency: TaskFrequency.DAILY,
                isCompleted: true,
                lastCompletedAt: {
                    lt: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                }
            },
            data: {
                isCompleted: false
            }
        });
    }
}
