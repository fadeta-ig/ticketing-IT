"use server";

import { KbService } from "@/services/kb.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const categorySchema = z.object({
    name: z.string().min(2, "Nama kategori minimal 2 karakter"),
    description: z.string().optional(),
    icon: z.string().optional(),
});

const articleSchema = z.object({
    title: z.string().min(5, "Judul minimal 5 karakter"),
    content: z.string().min(20, "Konten minimal 20 karakter"),
    categoryId: z.string().min(1, "Kategori wajib dipilih"),
    tags: z.string().optional(),
    isPublished: z.boolean().optional(),
    sourceTicketId: z.string().optional(),
});

// ──────────── Category Actions ────────────

export async function getKbCategoriesAction() {
    return await KbService.getAllCategories();
}

export async function createKbCategoryAction(data: { name: string; description?: string; icon?: string }) {
    try {
        const validated = categorySchema.parse(data);
        await KbService.createCategory(validated);
        revalidatePath("/dashboard/knowledge-base");
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) throw new Error(error.issues[0].message);
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal membuat kategori");
    }
}

export async function updateKbCategoryAction(id: string, data: { name?: string; description?: string; icon?: string }) {
    await KbService.updateCategory(id, data);
    revalidatePath("/dashboard/knowledge-base");
}

export async function deleteKbCategoryAction(id: string) {
    await KbService.deleteCategory(id);
    revalidatePath("/dashboard/knowledge-base");
}

// ──────────── Article Actions ────────────

export async function getKbArticlesAction(filters?: { categoryId?: string; isPublished?: boolean; search?: string }) {
    return await KbService.getAllArticles(filters);
}

export async function getKbArticleByIdAction(id: string) {
    return await KbService.getArticleById(id);
}

export async function createKbArticleAction(data: {
    title: string;
    content: string;
    categoryId: string;
    tags?: string;
    isPublished?: boolean;
    sourceTicketId?: string;
}) {
    try {
        const validated = articleSchema.parse(data);
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) throw new Error("Unauthorized");

        const slug = KbService.generateSlug(validated.title) + "-" + Date.now().toString(36);

        await KbService.createArticle({
            ...validated,
            slug,
            authorId: session.user.id,
        });

        revalidatePath("/dashboard/knowledge-base");
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) throw new Error(error.issues[0].message);
        throw new Error((error instanceof Error ? error.message : String(error)) || "Gagal membuat artikel");
    }
}

export async function updateKbArticleAction(
    id: string,
    data: Partial<{
        title: string;
        content: string;
        categoryId: string;
        tags: string;
        isPublished: boolean;
    }>
) {
    await KbService.updateArticle(id, data);
    revalidatePath("/dashboard/knowledge-base");
}

export async function deleteKbArticleAction(id: string) {
    await KbService.deleteArticle(id);
    revalidatePath("/dashboard/knowledge-base");
}

export async function recordKbFeedbackAction(id: string, isHelpful: boolean) {
    await KbService.recordFeedback(id, isHelpful);
    revalidatePath("/dashboard/knowledge-base");
}

export async function searchKbArticlesAction(query: string) {
    return await KbService.searchPublished(query);
}

export async function getKbStatsAction() {
    return await KbService.getStats();
}

export async function incrementKbViewCountAction(id: string) {
    try {
        await KbService.incrementViewCount(id);
    } catch {
        // non-critical — do not throw to avoid breaking the read experience
    }
}
