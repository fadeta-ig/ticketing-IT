"use server"

import { TaskService } from "@/services/task.service";
import { revalidatePath } from "next/cache";
import { TaskFrequency } from "@prisma/client";
import { z } from "zod";
import { requireStaff } from "@/lib/authz";

const taskSchema = z.object({
    title: z.string().min(3, "Judul tugas minimal 3 karakter"),
    description: z.string().optional(),
    frequency: z.nativeEnum(TaskFrequency),
});

async function requireOwnedTask(id: string, userId: string) {
    const task = await TaskService.getTaskById(id);
    if (!task || task.userId !== userId) {
        throw new Error("Forbidden");
    }
    return task;
}

export async function createTaskAction(formData: FormData) {
    const user = await requireStaff();
    const rawData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        frequency: formData.get("frequency") as TaskFrequency,
    };

    const validated = taskSchema.parse(rawData);
    await TaskService.createTask({
        ...validated,
        userId: user.id,
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
}

export async function toggleTaskCompletionAction(id: string, isCompleted: boolean) {
    const user = await requireStaff();
    await requireOwnedTask(id, user.id);
    await TaskService.toggleTask(id, isCompleted);
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
}

export async function deleteTaskAction(id: string) {
    const user = await requireStaff();
    await requireOwnedTask(id, user.id);
    await TaskService.deleteTask(id);
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
}
