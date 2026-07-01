"use server"

import { ProjectService } from "@/services/project.service";
import { revalidatePath } from "next/cache";
import { ProjectStatus, ProjectType } from "@prisma/client";
import { z } from "zod";
import { AuditService } from "@/services/audit.service";
import { requireStaff } from "@/lib/authz";

const projectSchema = z.object({
    name: z.string().min(3, "Nama proyek minimal 3 karakter"),
    description: z.string().optional(),
    type: z.nativeEnum(ProjectType),
    websiteName: z.string().optional(),
    environment: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    requestedBy: z.string().optional(),
    estimatedBudget: z.string().optional(),
});

const projectStatusSchema = z.nativeEnum(ProjectStatus);

export async function createProjectAction(formData: FormData) {
    try {
        const user = await requireStaff();
        const rawData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            type: formData.get("type") as ProjectType,
            websiteName: formData.get("websiteName") as string || undefined,
            environment: formData.get("environment") as string || undefined,
            startDate: (formData.get("startDate") as string) || undefined,
            endDate: (formData.get("endDate") as string) || undefined,
            category: formData.get("category") as string || undefined,
            location: formData.get("location") as string || undefined,
            requestedBy: formData.get("requestedBy") as string || undefined,
            estimatedBudget: formData.get("estimatedBudget") as string || undefined,
        };

        const validated = projectSchema.parse(rawData);
        const project = await ProjectService.createProject({
            ...validated,
            managerId: user.id,
            startDate: validated.startDate ? new Date(validated.startDate) : undefined,
            endDate: validated.endDate ? new Date(validated.endDate) : undefined,
            estimatedBudget: validated.estimatedBudget ? parseFloat(validated.estimatedBudget) : undefined,
        });

        await AuditService.logAction({
            action: "CREATE",
            entity: "PROJECT",
            entityId: project.id,
            details: `Membuat proyek: ${project.name}`,
            userId: user.id
        });

        revalidatePath("/dashboard/infrastructure");
        revalidatePath("/dashboard/web-dev");
        revalidatePath("/dashboard");
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal membuat proyek");
    }
}

export async function updateProjectStatusAction(id: string, status: ProjectStatus) {
    const user = await requireStaff();
    const validatedStatus = projectStatusSchema.parse(status);
    await ProjectService.updateProject(id, { status: validatedStatus });
    await AuditService.logAction({
        action: "UPDATE_STATUS",
        entity: "PROJECT",
        entityId: id,
        details: `Mengubah status proyek menjadi ${validatedStatus}`,
        userId: user.id
    });
    revalidatePath("/dashboard/infrastructure");
    revalidatePath("/dashboard/web-dev");
}

export async function deleteProjectAction(id: string) {
    const user = await requireStaff();
    await ProjectService.deleteProject(id);
    await AuditService.logAction({
        action: "DELETE",
        entity: "PROJECT",
        entityId: id,
        details: `Menghapus proyek`,
        userId: user.id
    });
    revalidatePath("/dashboard/infrastructure");
    revalidatePath("/dashboard/web-dev");
    revalidatePath("/dashboard");
}

export async function toggleMilestoneAction(id: string, isCompleted: boolean) {
    await requireStaff();
    await ProjectService.updateMilestone(id, { isCompleted });
    revalidatePath("/dashboard/infrastructure");
    revalidatePath("/dashboard/web-dev");
}
