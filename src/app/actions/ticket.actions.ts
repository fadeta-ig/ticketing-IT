"use server"

import { TicketService } from "@/services/ticket.service";
import { SlaService } from "@/services/sla.service";
import { revalidatePath } from "next/cache";
import { TicketStatus, Priority } from "@prisma/client";
import { z } from "zod";
import { AuditService } from "@/services/audit.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationService } from "@/services/notification.service";

const ticketSchema = z.object({
    title: z.string().min(5, "Judul minimal 5 karakter"),
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    priority: z.nativeEnum(Priority),
    category: z.string().min(1, "Kategori wajib dipilih"),
    classification: z.string().min(1, "Klasifikasi wajib dipilih"),
    creatorId: z.string(),
});

export async function createTicketAction(formData: FormData) {
    try {
        const rawData = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            priority: formData.get("priority") as Priority,
            category: formData.get("category") as string,
            classification: formData.get("classification") as string,
            creatorId: formData.get("creatorId") as string,
        };

        console.log("Creating ticket with rawData:", rawData);

        const validated = ticketSchema.parse(rawData);
        const ticket = await TicketService.createTicket(validated);

        // Auto-calculate SLA due date
        try {
            const dueAt = await SlaService.calculateDueDate(ticket.priority, ticket.createdAt);
            await TicketService.updateTicket(ticket.id, { dueAt } as any);
        } catch (slaError) {
            console.error("Failed to calculate SLA due date:", slaError);
        }

        const session = await getServerSession(authOptions);

        // Send WhatsApp Notification
        try {
            const creatorName = session?.user?.name || "User";
            await NotificationService.sendWhatsAppNotification({
                id: ticket.id,
                title: ticket.title,
                priority: ticket.priority,
                creatorName: creatorName
            });
        } catch (waError) {
            console.error("Failed to send WA notification:", waError);
            // Don't throw here, ticket is already created
        }

        if (session?.user?.id) {
            await AuditService.logAction({
                action: "CREATE",
                entity: "TICKET",
                entityId: ticket.id,
                details: `Membuat tiket: ${ticket.title}`,
                userId: session.user.id
            });
        }

        revalidatePath("/dashboard/ticketing");
        revalidatePath("/dashboard");
    } catch (error: any) {
        console.error("Error in createTicketAction:", error);
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error(error.message || "Gagal membuat tiket");
    }
}

export async function updateTicketStatusAction(id: string, status: TicketStatus, note?: string) {
    // Build SLA tracking data
    const slaData: Record<string, any> = { status };
    const now = new Date();

    if (status === TicketStatus.IN_PROGRESS) {
        // Record first response time (only if not already set)
        const existing = await TicketService.getTicketById(id);
        if (existing && !existing.firstResponseAt) {
            slaData.firstResponseAt = now;
        }
    } else if (status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED) {
        slaData.resolvedAt = now;
        // Check breach
        const existing = await TicketService.getTicketById(id);
        if (existing?.dueAt && now > existing.dueAt) {
            slaData.slaBreached = true;
        }
    }

    const updatedTicket = await TicketService.updateTicket(id, slaData);
    const session = await getServerSession(authOptions);

    // Save note as comment if provided
    if (note && session?.user?.id) {
        await TicketService.addComment(id, session.user.id, note);
    }

    if (session?.user?.id) {
        await AuditService.logAction({
            action: "UPDATE_STATUS",
            entity: "TICKET",
            entityId: id,
            details: `Mengubah status tiket menjadi ${status}${note ? `. Catatan: ${note}` : ""}`,
            userId: session.user.id
        });
    }

    // Trigger Notification to Creator
    try {
        const fullTicket = await TicketService.getTicketById(id);
        if (fullTicket && fullTicket.creator) {
            await NotificationService.sendStatusUpdateNotification({
                ticketId: id,
                title: fullTicket.title,
                status: status,
                // note: note, // Removed based on user request to keep notes internal only
                recipientNumber: (fullTicket.creator as any).phoneNumber || undefined,
                recipientName: fullTicket.creator.name || "User"
            });
        }
    } catch (notifError) {
        console.error("Failed to send status update notification:", notifError);
    }

    revalidatePath("/dashboard/ticketing");
    revalidatePath(`/dashboard/ticketing/${id}`);
    revalidatePath("/dashboard");
}

export async function assignTicketAction(id: string, assigneeId: string) {
    await TicketService.updateTicket(id, {
        assigneeId,
        status: TicketStatus.IN_PROGRESS
    });
    revalidatePath("/dashboard/ticketing");
}

export async function updateTicketAction(id: string, data: any) {
    // Basic validation can be added here
    await TicketService.updateTicket(id, data);
    revalidatePath("/dashboard/ticketing");
}

export async function deleteTicketAction(id: string) {
    await TicketService.deleteTicket(id);
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        await AuditService.logAction({
            action: "DELETE",
            entity: "TICKET",
            entityId: id,
            details: `Menghapus tiket`,
            userId: session.user.id
        });
    }
    revalidatePath("/dashboard/ticketing");
    revalidatePath("/dashboard");
}
