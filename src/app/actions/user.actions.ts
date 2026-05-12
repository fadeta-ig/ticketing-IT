"use server"

import { UserService } from "@/services/user.service";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { z } from "zod";
import { AuditService } from "@/services/audit.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const userSchema = z.object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Format email salah"),
    role: z.nativeEnum(Role),
    password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Akses ditolak. Anda bukan Admin.");
    }
}

export async function createUserAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Hanya admin yang dapat mengelola pengguna");
    }

    try {
        const rawData = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            password: (formData.get("password") as string) || undefined,
            role: formData.get("role") as Role,
        };

        const validated = userSchema.parse(rawData);
        const user = await UserService.createUser(validated);

        if (session?.user?.id) {
            await AuditService.logAction({
                action: "CREATE",
                entity: "USER",
                entityId: user.id,
                details: `Membuat pengguna baru: ${user.name} (${user.role})`,
                userId: session.user.id
            });
        }
        revalidatePath("/dashboard/settings/users");
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal membuat pengguna");
    }
}

export async function updateUserAction(id: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    const currentRole = session?.user?.role;
    
    if (currentRole !== "ADMIN" && currentRole !== "STAFF") {
        throw new Error("Akses ditolak. Anda bukan Admin atau Staff.");
    }

    try {
        const rawData = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            role: formData.get("role") as Role,
            password: (formData.get("password") as string) || undefined,
        };

        const targetUser = await UserService.getUserById(id);
        if (!targetUser) throw new Error("Pengguna tidak ditemukan");

        if (currentRole === "STAFF") {
            if (targetUser.role !== "USER") {
                throw new Error("Staff hanya dapat memodifikasi akun pengguna biasa (USER).");
            }
            // Ensure STAFF cannot escalate privileges
            rawData.role = "USER";
        }

        const validated = userSchema.partial().parse(rawData);
        const user = await UserService.updateUser(id, validated);

        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            await AuditService.logAction({
                action: "UPDATE",
                entity: "USER",
                entityId: user.id,
                details: `Memperbarui data pengguna: ${user.name}`,
                userId: session.user.id
            });
        }
        revalidatePath("/dashboard/settings/users");
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal memperbarui pengguna");
    }
}

export async function deleteUserAction(id: string) {
    try {
        await checkAdmin();
        await UserService.deleteUser(id);

        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            await AuditService.logAction({
                action: "DELETE",
                entity: "USER",
                entityId: id,
                details: `Menghapus pengguna`,
                userId: session.user.id
            });
        }
        revalidatePath("/dashboard/settings/users");
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal menghapus pengguna");
    }
}

export async function updateSelfAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("Anda harus login terlebih dahulu.");
    }

    try {
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
        };

        const validated = z.object({
            name: z.string().min(3, "Nama minimal 3 karakter"),
            email: z.string().email("Format email salah"),
        }).parse(data);

        const user = await UserService.updateUser(session.user.id, validated);

        await AuditService.logAction({
            action: "UPDATE",
            entity: "USER",
            entityId: user.id,
            details: `Memperbarui profil mandiri: ${user.name}`,
            userId: session.user.id
        });

        revalidatePath("/dashboard/settings/profile");
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
        }
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal memperbarui profil");
    }
}

export async function changePasswordAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("Anda harus login terlebih dahulu.");
    }

    try {
        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (newPassword !== confirmPassword) {
            throw new Error("Konfirmasi password baru tidak cocok.");
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user || !user.passwordHash) {
            throw new Error("Pengguna tidak ditemukan.");
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new Error("Password saat ini salah.");
        }

        await UserService.updateUser(session.user.id, { password: newPassword });

        await AuditService.logAction({
            action: "UPDATE",
            entity: "USER",
            entityId: session.user.id,
            details: `Mengubah password akun`,
            userId: session.user.id
        });

        return { success: true };
    } catch (error: unknown) {
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal mengubah password");
    }
}

