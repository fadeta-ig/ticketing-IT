"use server"

import { TaskService } from "@/services/task.service";
import { revalidatePath } from "next/cache";
import { TaskFrequency } from "@prisma/client";
import { z } from "zod";

const taskSchema = z.object({
    title: z.string().min(3, "Judul tugas minimal 3 karakter"),
    description: z.string().optional(),
    frequency: z.nativeEnum(TaskFrequency),
    userId: z.string(),
});

export async function createTaskAction(formData: FormData) {
    const rawData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        frequency: formData.get("frequency") as TaskFrequency,
        userId: formData.get("userId") as string,
    };

    const validated = taskSchema.parse(rawData);
    await TaskService.createTask(validated);

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
}

export async function toggleTaskCompletionAction(id: string, isCompleted: boolean) {
    await TaskService.toggleTask(id, isCompleted);
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
}

export async function deleteTaskAction(id: string) {
    await TaskService.deleteTask(id);
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
}
