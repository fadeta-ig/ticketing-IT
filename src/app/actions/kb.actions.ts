"use server";

import { KbService } from "@/services/kb.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasStaffRole, requireSession, requireStaff } from "@/lib/authz";
import { getKnowledgeBasePlainText, sanitizeKnowledgeBaseHtml } from "@/lib/kb-sanitize";

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

const categoryUpdateSchema = categorySchema.partial().strict();
const articleUpdateSchema = articleSchema.omit({ sourceTicketId: true }).partial().strict();

function sanitizeArticle<T extends { content: string }>(article: T): T {
    return {
        ...article,
        content: sanitizeKnowledgeBaseHtml(article.content),
    };
}

function sanitizeArticleContent(content: string) {
    const sanitized = sanitizeKnowledgeBaseHtml(content);
    if (getKnowledgeBasePlainText(sanitized, Number.MAX_SAFE_INTEGER).length < 20) {
        throw new Error("Konten minimal 20 karakter setelah sanitasi");
    }
    return sanitized;
}

// ──────────── Category Actions ────────────

export async function getKbCategoriesAction() {
    const user = await requireSession();
    return hasStaffRole(user)
        ? await KbService.getAllCategories()
        : await KbService.getPublishedCategories();
}

export async function createKbCategoryAction(data: { name: string; description?: string; icon?: string }) {
    try {
        await requireStaff();
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
    await requireStaff();
    const validated = categoryUpdateSchema.parse(data);
    await KbService.updateCategory(id, validated);
    revalidatePath("/dashboard/knowledge-base");
}

export async function deleteKbCategoryAction(id: string) {
    await requireStaff();
    await KbService.deleteCategory(id);
    revalidatePath("/dashboard/knowledge-base");
}

// ──────────── Article Actions ────────────

export async function getKbArticlesAction(filters?: { categoryId?: string; isPublished?: boolean; search?: string }) {
    const user = await requireSession();
    const effectiveFilters = hasStaffRole(user)
        ? filters
        : { ...filters, isPublished: true };

    const articles = await KbService.getAllArticles(effectiveFilters);
    return articles.map(sanitizeArticle);
}

export async function getKbArticleByIdAction(id: string) {
    const user = await requireSession();
    const article = await KbService.getArticleById(id);
    if (article && !article.isPublished && !hasStaffRole(user)) {
        throw new Error("Forbidden");
    }
    return article ? sanitizeArticle(article) : null;
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
        const user = await requireStaff();
        const content = sanitizeArticleContent(validated.content);

        const slug = KbService.generateSlug(validated.title) + "-" + Date.now().toString(36);

        await KbService.createArticle({
            ...validated,
            content,
            slug,
            authorId: user.id,
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
    await requireStaff();
    const validated = articleUpdateSchema.parse(data);
    const payload = {
        ...validated,
        content: validated.content ? sanitizeArticleContent(validated.content) : undefined,
    };

    await KbService.updateArticle(id, payload);
    revalidatePath("/dashboard/knowledge-base");
}

export async function deleteKbArticleAction(id: string) {
    await requireStaff();
    await KbService.deleteArticle(id);
    revalidatePath("/dashboard/knowledge-base");
}

export async function recordKbFeedbackAction(id: string, isHelpful: boolean) {
    await getKbArticleByIdAction(id);
    await KbService.recordFeedback(id, z.boolean().parse(isHelpful));
    revalidatePath("/dashboard/knowledge-base");
}

export async function searchKbArticlesAction(query: string) {
    await requireSession();
    return await KbService.searchPublished(query);
}

export async function getKbStatsAction() {
    const user = await requireSession();
    return hasStaffRole(user)
        ? await KbService.getStats()
        : await KbService.getPublicStats();
}

export async function incrementKbViewCountAction(id: string) {
    try {
        await getKbArticleByIdAction(id);
        await KbService.incrementViewCount(id);
    } catch {
        // non-critical — do not throw to avoid breaking the read experience
    }
}
