"use server"

import { TicketService } from "@/services/ticket.service";
import { SlaService } from "@/services/sla.service";
import { revalidatePath } from "next/cache";
import { TicketStatus, Priority } from "@prisma/client";
import { z } from "zod";
import { AuditService } from "@/services/audit.service";
import { NotificationService } from "@/services/notification.service";
import { requireAdmin, requireSession, requireStaff } from "@/lib/authz";

const ticketSchema = z.object({
    title: z.string().min(5, "Judul minimal 5 karakter"),
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    priority: z.nativeEnum(Priority),
    category: z.string().min(1, "Kategori wajib dipilih"),
    classification: z.string().min(1, "Klasifikasi wajib dipilih"),
});

const ticketUpdateSchema = z.object({
    title: z.string().min(5, "Judul minimal 5 karakter").optional(),
    description: z.string().min(10, "Deskripsi minimal 10 karakter").optional(),
    priority: z.nativeEnum(Priority).optional(),
    category: z.string().optional(),
    classification: z.string().optional(),
}).strict();

const ticketStatusSchema = z.nativeEnum(TicketStatus);

function revalidateTicketPaths(id?: string) {
    revalidatePath("/dashboard/ticketing");
    if (id) {
        revalidatePath(`/dashboard/ticketing/${id}`);
    }
    revalidatePath("/dashboard");
}

export async function createTicketAction(formData: FormData) {
    try {
        const user = await requireSession();
        const rawData = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            priority: formData.get("priority") as Priority,
            category: formData.get("category") as string,
            classification: formData.get("classification") as string,
        };

        console.log("Creating ticket with rawData:", rawData);

        const validated = ticketSchema.parse(rawData);
        const ticket = await TicketService.createTicket({
            ...validated,
            creatorId: user.id,
        });

        // Auto-calculate SLA due date
        try {
            const dueAt = await SlaService.calculateDueDate(ticket.priority, ticket.createdAt);
            await TicketService.updateTicket(ticket.id, { dueAt });
        } catch (slaError) {
            console.error("Failed to calculate SLA due date:", slaError);
        }

        // Send WhatsApp Notification
        try {
            const creatorName = user.name || "User";
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

        await AuditService.logAction({
            action: "CREATE",
            entity: "TICKET",
            entityId: ticket.id,
            details: `Membuat tiket: ${ticket.title}`,
            userId: user.id
        });

        revalidateTicketPaths(ticket.id);
    } catch (error: unknown) {
        console.error("Error in createTicketAction:", error);
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal membuat tiket");
    }
}

export async function updateTicketStatusAction(id: string, status: TicketStatus, note?: string) {
    const user = await requireStaff();
    const validatedStatus = ticketStatusSchema.parse(status);

    // Build SLA tracking data
    const slaData: Partial<{
        status: TicketStatus;
        firstResponseAt: Date;
        resolvedAt: Date;
        slaBreached: boolean;
    }> = { status: validatedStatus };
    const now = new Date();

    if (validatedStatus === TicketStatus.IN_PROGRESS) {
        // Record first response time (only if not already set)
        const existing = await TicketService.getTicketById(id);
        if (existing && !existing.firstResponseAt) {
            slaData.firstResponseAt = now;
        }
    } else if (validatedStatus === TicketStatus.RESOLVED || validatedStatus === TicketStatus.CLOSED) {
        slaData.resolvedAt = now;
        // Check breach
        const existing = await TicketService.getTicketById(id);
        if (existing?.dueAt && now > existing.dueAt) {
            slaData.slaBreached = true;
        }
    }

    await TicketService.updateTicket(id, slaData);

    // Save note as comment if provided
    if (note) {
        await TicketService.addComment(id, user.id, note);
    }

    await AuditService.logAction({
        action: "UPDATE_STATUS",
        entity: "TICKET",
        entityId: id,
        details: `Mengubah status tiket menjadi ${validatedStatus}${note ? `. Catatan: ${note}` : ""}`,
        userId: user.id
    });

    // Trigger Notification to Creator
    try {
        const fullTicket = await TicketService.getTicketById(id);
        if (fullTicket && fullTicket.creator) {
            await NotificationService.sendStatusUpdateNotification({
                ticketId: id,
                title: fullTicket.title,
                status: validatedStatus,
                // note: note, // Removed based on user request to keep notes internal only
                recipientNumber: fullTicket.creator.phoneNumber || undefined,
                recipientName: fullTicket.creator.name || "User"
            });
        }
    } catch (notifError) {
        console.error("Failed to send status update notification:", notifError);
    }

    revalidateTicketPaths(id);
}

export async function assignTicketAction(id: string, assigneeId: string) {
    const user = await requireStaff();
    const ticket = await TicketService.updateTicket(id, {
        assigneeId,
        status: TicketStatus.IN_PROGRESS
    });

    // Audit trail
    await AuditService.logAction({
        action: "ASSIGN",
        entity: "TICKET",
        entityId: id,
        details: `Tiket di-assign ke ${assigneeId} oleh ${user.name}`,
        userId: user.id,
    });

    // WA Notification to assignee (non-critical)
    try {
        await NotificationService.sendWhatsAppNotification({
            id,
            title: `Tiket "${ticket.title}" telah di-assign kepada Anda`,
            priority: ticket.priority,
            creatorName: user.name || "Admin",
        });
    } catch { /* non-critical */ }

    revalidateTicketPaths(id);
}

export async function updateTicketAction(id: string, data: unknown) {
    await requireStaff();
    const validated = ticketUpdateSchema.parse(data);
    await TicketService.updateTicket(id, validated);
    revalidateTicketPaths(id);
}

export async function deleteTicketAction(id: string) {
    const user = await requireAdmin();
    await TicketService.deleteTicket(id);
    await AuditService.logAction({
        action: "DELETE",
        entity: "TICKET",
        entityId: id,
        details: `Menghapus tiket`,
        userId: user.id
    });
    revalidateTicketPaths();
}
