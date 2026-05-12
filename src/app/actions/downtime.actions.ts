"use server"

import { DowntimeService } from "@/services/downtime.service";
import { revalidatePath } from "next/cache";
import { DowntimeReason } from "@prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AuditService } from "@/services/audit.service";

const downtimeSchema = z.object({
    startTime: z.string().transform(val => new Date(val)),
    endTime: z.string().optional().transform(val => val ? new Date(val) : undefined),
    reason: z.nativeEnum(DowntimeReason),
    details: z.string().optional(),
});

export async function recordDowntimeAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        throw new Error("Hanya Admin atau Staff yang dapat mencatat downtime");
    }

    try {
        const rawData = {
            startTime: formData.get("startTime") as string,
            endTime: formData.get("endTime") as string || undefined,
            reason: formData.get("reason") as DowntimeReason,
            details: formData.get("details") as string,
        };

        const validated = downtimeSchema.parse(rawData);
        const downtime = await DowntimeService.recordDowntime(validated);

        if (session?.user?.id) {
            await AuditService.logAction({
                action: "CREATE",
                entity: "DOWNTIME",
                entityId: downtime.id,
                details: `Mencatat downtime: ${downtime.reason} (${downtime.startTime.toLocaleDateString()})`,
                userId: session.user.id
            });
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/infrastructure");
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal mencatat downtime");
    }
}
