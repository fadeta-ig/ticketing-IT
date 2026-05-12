"use server"

import { ProjectService } from "@/services/project.service";
import { revalidatePath } from "next/cache";
import { ProjectStatus, ProjectType } from "@prisma/client";
import { z } from "zod";
import { AuditService } from "@/services/audit.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const projectSchema = z.object({
    name: z.string().min(3, "Nama proyek minimal 3 karakter"),
    description: z.string().optional(),
    type: z.nativeEnum(ProjectType),
    managerId: z.string(),
    websiteName: z.string().optional(),
    environment: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    requestedBy: z.string().optional(),
    estimatedBudget: z.string().optional(),
});

export async function createProjectAction(formData: FormData) {
    try {
        const rawData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            type: formData.get("type") as ProjectType,
            managerId: formData.get("managerId") as string,
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
            startDate: validated.startDate ? new Date(validated.startDate) : undefined,
            endDate: validated.endDate ? new Date(validated.endDate) : undefined,
            estimatedBudget: validated.estimatedBudget ? parseFloat(validated.estimatedBudget) : undefined,
        });

        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            await AuditService.logAction({
                action: "CREATE",
                entity: "PROJECT",
                entityId: project.id,
                details: `Membuat proyek: ${project.name}`,
                userId: session.user.id
            });
        }

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
    await ProjectService.updateProject(id, { status });
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        await AuditService.logAction({
            action: "UPDATE_STATUS",
            entity: "PROJECT",
            entityId: id,
            details: `Mengubah status proyek menjadi ${status}`,
            userId: session.user.id
        });
    }
    revalidatePath("/dashboard/infrastructure");
    revalidatePath("/dashboard/web-dev");
}

export async function deleteProjectAction(id: string) {
    await ProjectService.deleteProject(id);
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        await AuditService.logAction({
            action: "DELETE",
            entity: "PROJECT",
            entityId: id,
            details: `Menghapus proyek`,
            userId: session.user.id
        });
    }
    revalidatePath("/dashboard/infrastructure");
    revalidatePath("/dashboard/web-dev");
    revalidatePath("/dashboard");
}

export async function toggleMilestoneAction(id: string, isCompleted: boolean) {
    await ProjectService.updateMilestone(id, { isCompleted });
    revalidatePath("/dashboard/infrastructure");
    revalidatePath("/dashboard/web-dev");
}
