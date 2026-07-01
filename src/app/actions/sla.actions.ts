"use server";

import { SlaService } from "@/services/sla.service";
import { revalidatePath } from "next/cache";
import { Priority } from "@prisma/client";
import { z } from "zod";
import { requireAdmin, requireStaff } from "@/lib/authz";

const slaPolicySchema = z.object({
    priority: z.nativeEnum(Priority),
    responseTimeMins: z.number().int().min(1, "Minimal 1 menit"),
    resolutionTimeMins: z.number().int().min(1, "Minimal 1 menit"),
    businessHoursOnly: z.boolean(),
});

export async function getSlaPolicesAction() {
    await requireAdmin();
    return await SlaService.getAllPolicies();
}

export async function upsertSlaPolicyAction(data: {
    priority: Priority;
    responseTimeMins: number;
    resolutionTimeMins: number;
    businessHoursOnly: boolean;
}) {
    try {
        await requireAdmin();
        const validated = slaPolicySchema.parse(data);
        await SlaService.upsertPolicy(validated);
        revalidatePath("/dashboard/settings/sla");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menyimpan kebijakan SLA");
    }
}

export async function getSlaComplianceAction(days: number = 30) {
    await requireStaff();
    return await SlaService.getComplianceStats(days);
}
