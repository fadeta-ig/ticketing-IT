"use server";

import { ProjectService } from "@/services/project.service";
import { revalidatePath } from "next/cache";

export async function upsertWebEnvironmentAction(projectId: string, data: {
    repositoryUrl?: string;
    stagingUrl?: string;
    productionUrl?: string;
    stackFramework?: string;
    hostingProvider?: string;
}) {
    try {
        const env = await ProjectService.upsertWebEnvironment(projectId, data);
        revalidatePath("/dashboard/web-dev");
        revalidatePath(`/dashboard/projects/${projectId}`); // Assuming there's a detailed view if applicable
        return env;
    } catch (error: any) {
        throw new Error(error.message || "Failed to update web environment.");
    }
}

export async function createProjectTaskAction(projectId: string, title: string, assigneeId?: string) {
    try {
        const task = await ProjectService.createProjectTask(projectId, title, assigneeId || undefined);
        revalidatePath("/dashboard/web-dev");
        return task;
    } catch (error: any) {
        throw new Error(error.message || "Failed to create project task.");
    }
}

export async function toggleProjectTaskAction(id: string, isCompleted: boolean) {
    try {
        const task = await ProjectService.toggleProjectTask(id, isCompleted);
        revalidatePath("/dashboard/web-dev");
        return task;
    } catch (error: any) {
        throw new Error(error.message || "Failed to update project task status.");
    }
}

export async function deleteProjectTaskAction(id: string) {
    try {
        await ProjectService.deleteProjectTask(id);
        revalidatePath("/dashboard/web-dev");
        return { success: true };
    } catch (error: any) {
        throw new Error(error.message || "Failed to delete project task.");
    }
}
