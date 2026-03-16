import prisma from "@/lib/prisma";
import { ProjectType, ProjectStatus, InfraPhase } from "@prisma/client";

export class ProjectService {
    static async getAllProjects(type?: ProjectType) {
        return await prisma.project.findMany({
            where: type ? { type } : undefined,
            include: {
                manager: {
                    select: { name: true }
                },
                milestones: true,
                webEnvironment: true,
                projectTasks: true
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    static async getProjectById(id: string) {
        return await prisma.project.findUnique({
            where: { id },
            include: {
                manager: {
                    select: { name: true }
                },
                milestones: true,
                proposal: true,
                rkbSubmission: true,
                rkbItems: { orderBy: { createdAt: "asc" } },
                disbursement: true,
                executionLogs: { orderBy: { executionDate: "desc" } },
                webEnvironment: true,
                projectTasks: {
                    orderBy: { title: "asc" },
                    include: { assignee: { select: { name: true } } }
                }
            }
        });
    }

    static async createProject(data: {
        name: string;
        description?: string;
        type: ProjectType;
        managerId: string;
        websiteName?: string;
        environment?: string;
        startDate?: Date;
        endDate?: Date;
        category?: string;
        location?: string;
        requestedBy?: string;
        estimatedBudget?: number;
    }) {
        const isInfra = data.type === ProjectType.INFRASTRUCTURE;
        return await prisma.project.create({
            data: {
                ...data,
                status: ProjectStatus.PLANNING,
                currentPhase: isInfra ? InfraPhase.PROPOSAL : null,
            }
        });
    }

    static async updateProject(id: string, data: Partial<{
        name: string;
        description: string;
        status: ProjectStatus;
        websiteName: string;
        environment: string;
        startDate: Date;
        endDate: Date;
        managerId: string;
    }>) {
        return await prisma.project.update({
            where: { id },
            data
        });
    }

    static async deleteProject(id: string) {
        return await prisma.project.delete({
            where: { id }
        });
    }

    static async updateMilestone(id: string, data: { isCompleted?: boolean; title?: string }) {
        return await prisma.milestone.update({
            where: { id },
            data
        });
    }

    // Web Environment Methods

    static async upsertWebEnvironment(projectId: string, data: {
        repositoryUrl?: string;
        stagingUrl?: string;
        productionUrl?: string;
        stackFramework?: string;
        hostingProvider?: string;
    }) {
        return await prisma.webEnvironment.upsert({
            where: { projectId },
            create: { projectId, ...data },
            update: data
        });
    }

    static async createProjectTask(projectId: string, title: string, assigneeId?: string) {
        return await prisma.projectTask.create({
            data: {
                projectId,
                title,
                assigneeId
            }
        });
    }

    static async toggleProjectTask(id: string, isCompleted: boolean) {
        return await prisma.projectTask.update({
            where: { id },
            data: { isCompleted }
        });
    }

    static async deleteProjectTask(id: string) {
        return await prisma.projectTask.delete({
            where: { id }
        });
    }
}
