import prisma from "@/lib/prisma";

export class KbService {
    // ──────────── Category CRUD ────────────

    static async getAllCategories() {
        return await prisma.kbCategory.findMany({
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { articles: true } } },
        });
    }

    static async getPublishedCategories() {
        return await prisma.kbCategory.findMany({
            orderBy: { sortOrder: "asc" },
            include: {
                _count: {
                    select: {
                        articles: { where: { isPublished: true } },
                    },
                },
            },
        });
    }

    static async createCategory(data: { name: string; description?: string; icon?: string }) {
        return await prisma.kbCategory.create({ data });
    }

    static async updateCategory(id: string, data: { name?: string; description?: string; icon?: string }) {
        return await prisma.kbCategory.update({ where: { id }, data });
    }

    static async deleteCategory(id: string) {
        return await prisma.kbCategory.delete({ where: { id } });
    }

    // ──────────── Article CRUD ────────────

    static async getAllArticles(filters?: { categoryId?: string; isPublished?: boolean; search?: string }) {
        return await prisma.kbArticle.findMany({
            where: {
                ...(filters?.categoryId && { categoryId: filters.categoryId }),
                ...(filters?.isPublished !== undefined && { isPublished: filters.isPublished }),
                ...(filters?.search && {
                    OR: [
                        { title: { contains: filters.search } },
                        { content: { contains: filters.search } },
                        { tags: { contains: filters.search } },
                    ],
                }),
            },
            include: {
                category: { select: { name: true, icon: true } },
                author: { select: { name: true } },
            },
            orderBy: { updatedAt: "desc" },
        });
    }

    static async getArticleBySlug(slug: string) {
        return await prisma.kbArticle.findUnique({
            where: { slug },
            include: {
                category: true,
                author: { select: { name: true, image: true } },
            },
        });
    }

    static async getArticleById(id: string) {
        return await prisma.kbArticle.findUnique({
            where: { id },
            include: {
                category: true,
                author: { select: { name: true, image: true } },
            },
        });
    }

    static async createArticle(data: {
        title: string;
        content: string;
        slug: string;
        categoryId: string;
        authorId: string;
        tags?: string;
        isPublished?: boolean;
        sourceTicketId?: string;
    }) {
        return await prisma.kbArticle.create({ data });
    }

    static async updateArticle(
        id: string,
        data: Partial<{
            title: string;
            content: string;
            slug: string;
            categoryId: string;
            tags: string;
            isPublished: boolean;
        }>
    ) {
        return await prisma.kbArticle.update({ where: { id }, data });
    }

    static async deleteArticle(id: string) {
        return await prisma.kbArticle.delete({ where: { id } });
    }

    /** Increment the view count when a user reads an article */
    static async incrementViewCount(id: string) {
        return await prisma.kbArticle.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
    }

    /** Record a "helpful" or "not helpful" vote */
    static async recordFeedback(id: string, isHelpful: boolean) {
        return await prisma.kbArticle.update({
            where: { id },
            data: isHelpful ? { helpfulCount: { increment: 1 } } : { notHelpfulCount: { increment: 1 } },
        });
    }

    /**
     * Search published articles — used for ticket deflection (suggesting
     * articles while the user is typing a new ticket title).
     */
    static async searchPublished(query: string, limit: number = 5) {
        if (!query || query.length < 2) return [];

        return await prisma.kbArticle.findMany({
            where: {
                isPublished: true,
                OR: [
                    { title: { contains: query } },
                    { tags: { contains: query } },
                ],
            },
            select: {
                id: true,
                title: true,
                slug: true,
                category: { select: { name: true, icon: true } },
            },
            take: limit,
            orderBy: { viewCount: "desc" },
        });
    }

    /** Generate a URL-safe slug from a title */
    static generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .substring(0, 80);
    }

    /** Get popular articles for the KB landing page */
    static async getPopularArticles(limit: number = 6) {
        return await prisma.kbArticle.findMany({
            where: { isPublished: true },
            include: {
                category: { select: { name: true, icon: true } },
                author: { select: { name: true } },
            },
            orderBy: { viewCount: "desc" },
            take: limit,
        });
    }

    /** Dashboard stats */
    static async getStats() {
        const [totalArticles, publishedArticles, totalCategories, totalViews] = await Promise.all([
            prisma.kbArticle.count(),
            prisma.kbArticle.count({ where: { isPublished: true } }),
            prisma.kbCategory.count(),
            prisma.kbArticle.aggregate({ _sum: { viewCount: true } }),
        ]);

        return {
            totalArticles,
            publishedArticles,
            totalCategories,
            totalViews: totalViews._sum.viewCount ?? 0,
        };
    }

    /** Public stats that do not leak draft article counts. */
    static async getPublicStats() {
        const [publishedArticles, totalCategories, totalViews] = await Promise.all([
            prisma.kbArticle.count({ where: { isPublished: true } }),
            prisma.kbCategory.count({
                where: { articles: { some: { isPublished: true } } },
            }),
            prisma.kbArticle.aggregate({
                where: { isPublished: true },
                _sum: { viewCount: true },
            }),
        ]);

        return {
            totalArticles: publishedArticles,
            publishedArticles,
            totalCategories,
            totalViews: totalViews._sum.viewCount ?? 0,
        };
    }
}
