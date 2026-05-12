"use server"

import { InfraWorkflowService } from "@/services/infra-workflow.service";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AuditService } from "@/services/audit.service";
import { NotificationService } from "@/services/notification.service";
import { z } from "zod";
import prisma from "@/lib/prisma";

const INFRA_PATH = "/dashboard/infrastructure";

function revalidateInfra(projectId?: string) {
    revalidatePath(INFRA_PATH);
    if (projectId) {
        revalidatePath(`${INFRA_PATH}/${projectId}`);
    }
    revalidatePath("/dashboard");
}

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("Sesi tidak valid. Silakan login ulang.");
    }
    return session.user;
}

// ─── Proposal Actions ────────────────────────────────────────

const proposalSchema = z.object({
    background: z.string().optional(),
    objectives: z.string().optional(),
    scope: z.string().optional(),
    benefits: z.string().optional(),
    riskAnalysis: z.string().optional(),
});

export async function saveProposalAction(projectId: string, formData: FormData) {
    try {
        const data = proposalSchema.parse({
            background: formData.get("background") as string || undefined,
            objectives: formData.get("objectives") as string || undefined,
            scope: formData.get("scope") as string || undefined,
            benefits: formData.get("benefits") as string || undefined,
            riskAnalysis: formData.get("riskAnalysis") as string || undefined,
        });

        await InfraWorkflowService.upsertProposal(projectId, data);
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menyimpan proposal");
    }
}

export async function submitProposalAction(projectId: string) {
    try {
        await InfraWorkflowService.submitProposal(projectId);
        const user = await getSessionUser();
        await AuditService.logAction({
            action: "SUBMIT_PROPOSAL",
            entity: "PROJECT",
            entityId: projectId,
            details: "Mengajukan proposal untuk disetujui",
            userId: user.id,
        });
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal mengajukan proposal");
    }
}

export async function approveProposalAction(projectId: string) {
    try {
        const user = await getSessionUser();
        await InfraWorkflowService.approveProposal(projectId, user.name || "Admin");
        await AuditService.logAction({
            action: "APPROVE_PROPOSAL",
            entity: "PROJECT",
            entityId: projectId,
            details: `Proposal disetujui oleh ${user.name}`,
            userId: user.id,
        });
        // WA Notification
        try {
            const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
            await NotificationService.sendWhatsAppNotification({
                id: projectId,
                title: `Proposal "${project?.name}" DISETUJUI`,
                priority: "HIGH",
                creatorName: user.name || "Admin",
            });
        } catch { /* non-critical */ }
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menyetujui proposal");
    }
}

export async function rejectProposalAction(projectId: string, reason: string) {
    try {
        const user = await getSessionUser();
        await InfraWorkflowService.rejectProposal(projectId, reason);
        await AuditService.logAction({
            action: "REJECT_PROPOSAL",
            entity: "PROJECT",
            entityId: projectId,
            details: `Proposal ditolak: ${reason}`,
            userId: user.id,
        });
        // WA Notification
        try {
            const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
            await NotificationService.sendWhatsAppNotification({
                id: projectId,
                title: `Proposal "${project?.name}" DITOLAK`,
                priority: "HIGH",
                creatorName: user.name || "Admin",
            });
        } catch { /* non-critical */ }
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menolak proposal");
    }
}

// ─── RKB Actions ─────────────────────────────────────────────

const rkbItemSchema = z.object({
    itemName: z.string().min(1, "Nama item wajib diisi"),
    specification: z.string().optional(),
    quantity: z.number().min(1, "Quantity minimal 1"),
    unit: z.string().min(1, "Satuan wajib diisi"),
    unitPrice: z.number().min(0, "Harga satuan tidak boleh negatif"),
    vendor: z.string().optional(),
    notes: z.string().optional(),
});

export async function saveRkbAction(projectId: string, formData: FormData) {
    try {
        const data = {
            submissionNumber: formData.get("submissionNumber") as string || undefined,
            justification: formData.get("justification") as string || undefined,
        };
        await InfraWorkflowService.upsertRkbSubmission(projectId, data);
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menyimpan RKB");
    }
}

export async function addRkbItemAction(projectId: string, formData: FormData) {
    try {
        const data = rkbItemSchema.parse({
            itemName: formData.get("itemName") as string,
            specification: formData.get("specification") as string || undefined,
            quantity: Number(formData.get("quantity")),
            unit: formData.get("unit") as string,
            unitPrice: Number(formData.get("unitPrice")),
            vendor: formData.get("vendor") as string || undefined,
            notes: formData.get("notes") as string || undefined,
        });

        await InfraWorkflowService.addRkbItem(projectId, data);
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menambah item RKB");
    }
}

export async function removeRkbItemAction(itemId: string, projectId: string) {
    try {
        await InfraWorkflowService.removeRkbItem(itemId);
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menghapus item RKB");
    }
}

export async function submitRkbAction(projectId: string) {
    try {
        await InfraWorkflowService.submitRkb(projectId);
        const user = await getSessionUser();
        await AuditService.logAction({
            action: "SUBMIT_RKB",
            entity: "PROJECT",
            entityId: projectId,
            details: "Mengajukan RKB untuk disetujui",
            userId: user.id,
        });
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal mengajukan RKB");
    }
}

export async function approveRkbAction(projectId: string) {
    try {
        const user = await getSessionUser();
        await InfraWorkflowService.approveRkb(projectId, user.name || "Admin");
        await AuditService.logAction({
            action: "APPROVE_RKB",
            entity: "PROJECT",
            entityId: projectId,
            details: `RKB disetujui oleh ${user.name}`,
            userId: user.id,
        });
        // WA Notification
        try {
            const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
            await NotificationService.sendWhatsAppNotification({
                id: projectId,
                title: `RKB "${project?.name}" DISETUJUI`,
                priority: "HIGH",
                creatorName: user.name || "Admin",
            });
        } catch { /* non-critical */ }
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menyetujui RKB");
    }
}

export async function rejectRkbAction(projectId: string, reason: string) {
    try {
        const user = await getSessionUser();
        await InfraWorkflowService.rejectRkb(projectId, reason);
        await AuditService.logAction({
            action: "REJECT_RKB",
            entity: "PROJECT",
            entityId: projectId,
            details: `RKB ditolak: ${reason}`,
            userId: user.id,
        });
        // WA Notification
        try {
            const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
            await NotificationService.sendWhatsAppNotification({
                id: projectId,
                title: `RKB "${project?.name}" DITOLAK`,
                priority: "HIGH",
                creatorName: user.name || "Admin",
            });
        } catch { /* non-critical */ }
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menolak RKB");
    }
}

// ─── Disbursement Actions ────────────────────────────────────

const disbursementSchema = z.object({
    approvedBudget: z.number().optional(),
    disbursedAmount: z.number().optional(),
    paymentMethod: z.string().optional(),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
});

export async function saveDisbursementAction(projectId: string, formData: FormData) {
    try {
        const data = disbursementSchema.parse({
            approvedBudget: formData.get("approvedBudget") ? Number(formData.get("approvedBudget")) : undefined,
            disbursedAmount: formData.get("disbursedAmount") ? Number(formData.get("disbursedAmount")) : undefined,
            paymentMethod: formData.get("paymentMethod") as string || undefined,
            referenceNumber: formData.get("referenceNumber") as string || undefined,
            notes: formData.get("notes") as string || undefined,
        });

        const disbursementDate = formData.get("disbursementDate") as string;
        await InfraWorkflowService.upsertDisbursement(projectId, {
            ...data,
            disbursementDate: disbursementDate ? new Date(disbursementDate) : undefined,
        });
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menyimpan pencairan dana");
    }
}

export async function submitDisbursementAction(projectId: string) {
    try {
        await InfraWorkflowService.submitDisbursement(projectId);
        const user = await getSessionUser();
        await AuditService.logAction({
            action: "SUBMIT_DISBURSEMENT",
            entity: "PROJECT",
            entityId: projectId,
            details: "Mengajukan pencairan dana",
            userId: user.id,
        });
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal mengajukan pencairan");
    }
}

export async function approveDisbursementAction(projectId: string) {
    try {
        const user = await getSessionUser();
        await InfraWorkflowService.approveDisbursement(projectId, user.name || "Admin");
        await AuditService.logAction({
            action: "APPROVE_DISBURSEMENT",
            entity: "PROJECT",
            entityId: projectId,
            details: `Pencairan dana disetujui oleh ${user.name}`,
            userId: user.id,
        });
        // WA Notification
        try {
            const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
            await NotificationService.sendWhatsAppNotification({
                id: projectId,
                title: `Pencairan "${project?.name}" DISETUJUI`,
                priority: "HIGH",
                creatorName: user.name || "Admin",
            });
        } catch { /* non-critical */ }
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menyetujui pencairan");
    }
}

export async function rejectDisbursementAction(projectId: string, reason: string) {
    try {
        const user = await getSessionUser();
        await InfraWorkflowService.rejectDisbursement(projectId, reason);
        await AuditService.logAction({
            action: "REJECT_DISBURSEMENT",
            entity: "PROJECT",
            entityId: projectId,
            details: `Pencairan dana ditolak: ${reason}`,
            userId: user.id,
        });
        // WA Notification
        try {
            const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
            await NotificationService.sendWhatsAppNotification({
                id: projectId,
                title: `Pencairan "${project?.name}" DITOLAK`,
                priority: "HIGH",
                creatorName: user.name || "Admin",
            });
        } catch { /* non-critical */ }
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menolak pencairan");
    }
}

// ─── Execution Actions ───────────────────────────────────────

const executionLogSchema = z.object({
    activityDescription: z.string().min(3, "Deskripsi kegiatan minimal 3 karakter"),
    progressPercentage: z.number().min(0).max(100),
    findings: z.string().optional(),
    completedBy: z.string().optional(),
});

export async function addExecutionLogAction(projectId: string, formData: FormData) {
    try {
        const data = executionLogSchema.parse({
            activityDescription: formData.get("activityDescription") as string,
            progressPercentage: Number(formData.get("progressPercentage")),
            findings: formData.get("findings") as string || undefined,
            completedBy: formData.get("completedBy") as string || undefined,
        });

        const executionDate = formData.get("executionDate") as string;
        await InfraWorkflowService.addExecutionLog(projectId, {
            ...data,
            executionDate: executionDate ? new Date(executionDate) : undefined,
        });

        const user = await getSessionUser();
        await AuditService.logAction({
            action: "ADD_EXECUTION_LOG",
            entity: "PROJECT",
            entityId: projectId,
            details: `Log eksekusi: ${data.activityDescription} (${data.progressPercentage}%)`,
            userId: user.id,
        });

        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menambah log eksekusi");
    }
}

export async function completeProjectAction(projectId: string) {
    try {
        await InfraWorkflowService.completeProject(projectId);
        const user = await getSessionUser();
        await AuditService.logAction({
            action: "COMPLETE_PROJECT",
            entity: "PROJECT",
            entityId: projectId,
            details: "Proyek infrastruktur selesai",
            userId: user.id,
        });
        revalidateInfra(projectId);
        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menyelesaikan proyek");
    }
}
