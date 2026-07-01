"use server";

import { ProjectService } from "@/services/project.service";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/authz";
import { z } from "zod";

const webEnvironmentSchema = z.object({
    repositoryUrl: z.string().optional(),
    stagingUrl: z.string().optional(),
    productionUrl: z.string().optional(),
    stackFramework: z.string().optional(),
    hostingProvider: z.string().optional(),
}).strict();

const projectTaskTitleSchema = z.string().trim().min(1, "Judul tugas wajib diisi");

export async function upsertWebEnvironmentAction(projectId: string, data: {
    repositoryUrl?: string;
    stagingUrl?: string;
    productionUrl?: string;
    stackFramework?: string;
    hostingProvider?: string;
}) {
    try {
        await requireStaff();
        const validated = webEnvironmentSchema.parse(data);
        const env = await ProjectService.upsertWebEnvironment(projectId, validated);
        revalidatePath("/dashboard/web-dev");
        revalidatePath(`/dashboard/web-dev/${projectId}`);
        return env;
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Failed to update web environment.");
    }
}

export async function createProjectTaskAction(projectId: string, title: string, assigneeId?: string) {
    try {
        await requireStaff();
        const validatedTitle = projectTaskTitleSchema.parse(title);
        const task = await ProjectService.createProjectTask(projectId, validatedTitle, assigneeId || undefined);
        revalidatePath("/dashboard/web-dev");
        revalidatePath(`/dashboard/web-dev/${projectId}`);
        return task;
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Failed to create project task.");
    }
}

export async function toggleProjectTaskAction(id: string, isCompleted: boolean) {
    try {
        await requireStaff();
        const task = await ProjectService.toggleProjectTask(id, z.boolean().parse(isCompleted));
        revalidatePath("/dashboard/web-dev");
        revalidatePath(`/dashboard/web-dev/${task.projectId}`);
        return task;
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Failed to update project task status.");
    }
}

export async function deleteProjectTaskAction(id: string) {
    try {
        await requireStaff();
        const task = await ProjectService.deleteProjectTask(id);
        revalidatePath("/dashboard/web-dev");
        revalidatePath(`/dashboard/web-dev/${task.projectId}`);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Failed to delete project task.");
    }
}
