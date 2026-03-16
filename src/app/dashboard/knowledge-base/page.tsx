"use client";

import { useState, useEffect, useTransition } from "react";
import { getKbCategoriesAction, getKbArticlesAction, createKbCategoryAction, createKbArticleAction, deleteKbArticleAction, deleteKbCategoryAction, updateKbArticleAction, getKbStatsAction } from "@/app/actions/kb.actions";
import { useSession } from "next-auth/react";
import dynamic from 'next/dynamic';
import parse from 'html-react-parser';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Category { id: string; name: string; description: string | null; icon: string | null; _count: { articles: number } }
interface Article { id: string; title: string; content: string; slug: string; isPublished: boolean; viewCount: number; helpfulCount: number; notHelpfulCount: number; tags: string | null; categoryId: string; category: { name: string; icon: string | null }; author: { name: string | null }; createdAt: string; updatedAt: string }
interface KbStats { totalArticles: number; publishedArticles: number; totalCategories: number; totalViews: number }

type TabView = "articles" | "categories" | "create";

export default function KnowledgeBasePage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

    const [activeTab, setActiveTab] = useState<TabView>("articles");
    const [categories, setCategories] = useState<Category[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [stats, setStats] = useState<KbStats | null>(null);
    const [search, setSearch] = useState("");
    const [filterCategoryId, setFilterCategoryId] = useState("");
    const [isPending, startTransition] = useTransition();

    // Create form state
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDesc, setNewCategoryDesc] = useState("");
    const [newCategoryIcon, setNewCategoryIcon] = useState("");

    const [articleTitle, setArticleTitle] = useState("");
    const [articleContent, setArticleContent] = useState("");
    const [articleCategoryId, setArticleCategoryId] = useState("");
    const [articleTags, setArticleTags] = useState("");
    const [articlePublished, setArticlePublished] = useState(false);

    const [message, setMessage] = useState({ type: "", text: "" });
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        const [cats, arts, st] = await Promise.all([
            getKbCategoriesAction(),
            getKbArticlesAction({ search: search || undefined, categoryId: filterCategoryId || undefined }),
            getKbStatsAction(),
        ]);
        setCategories(cats as Category[]);
        setArticles(arts as Article[]);
        setStats(st);
    }

    async function handleSearch() { await loadData(); }

    function showMsg(type: string, text: string) {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }

    function handleCreateCategory() {
        if (!newCategoryName.trim()) return;
        startTransition(async () => {
            try {
                await createKbCategoryAction({ name: newCategoryName, description: newCategoryDesc || undefined, icon: newCategoryIcon || undefined });
                setNewCategoryName(""); setNewCategoryDesc(""); setNewCategoryIcon("");
                showMsg("success", "Kategori berhasil dibuat!");
                await loadData();
            } catch (err: any) { showMsg("error", err.message); }
        });
    }

    function handleCreateArticle() {
        if (!articleTitle.trim() || !articleContent.trim() || !articleCategoryId) return;
        startTransition(async () => {
            try {
                await createKbArticleAction({
                    title: articleTitle, content: articleContent, categoryId: articleCategoryId,
                    tags: articleTags || undefined, isPublished: articlePublished,
                });
                setArticleTitle(""); setArticleContent(""); setArticleCategoryId(""); setArticleTags(""); setArticlePublished(false);
                setActiveTab("articles");
                showMsg("success", "Artikel berhasil dibuat!");
                await loadData();
            } catch (err: any) { showMsg("error", err.message); }
        });
    }

    function handleDeleteArticle(id: string) {
        if (!confirm("Hapus artikel ini?")) return;
        startTransition(async () => {
            await deleteKbArticleAction(id);
            showMsg("success", "Artikel dihapus.");
            await loadData();
        });
    }

    function handleDeleteCategory(id: string) {
        if (!confirm("Hapus kategori ini? Semua artikel di kategori ini harus sudah dipindahkan.")) return;
        startTransition(async () => {
            try {
                await deleteKbCategoryAction(id);
                showMsg("success", "Kategori dihapus.");
                await loadData();
            } catch (err: any) { showMsg("error", "Gagal menghapus: " + err.message); }
        });
    }

    function togglePublish(article: Article) {
        startTransition(async () => {
            await updateKbArticleAction(article.id, { isPublished: !article.isPublished });
            showMsg("success", article.isPublished ? "Artikel di-unpublish." : "Artikel dipublish!");
            await loadData();
        });
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pusat Bantuan (Knowledge Base)</h1>
                    <p className="text-sm text-slate-500 mt-1">Cari solusi mandiri atau kelola artikel pengetahuan</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setActiveTab("create")} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 self-start">
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Buat Artikel Baru
                    </button>
                )}
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Artikel", value: stats.totalArticles, icon: "📄" },
                        { label: "Terpublikasi", value: stats.publishedArticles, icon: "✅" },
                        { label: "Kategori", value: stats.totalCategories, icon: "📁" },
                        { label: "Total Dibaca", value: stats.totalViews, icon: "👁️" },
                    ].map((s) => (
                        <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                            <span className="text-2xl">{s.icon}</span>
                            <div>
                                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                                <p className="text-xs text-slate-400">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Notification */}
            {message.text && (
                <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            {isAdmin && (
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                    {([["articles", "Artikel"], ["categories", "Kategori"], ["create", "Buat Baru"]] as [TabView, string][]).map(([tab, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Articles Tab ── */}
            {activeTab === "articles" && (
                <div className="space-y-4">
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input type="text" placeholder="Cari artikel..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                        <select value={filterCategoryId} onChange={(e) => { setFilterCategoryId(e.target.value); }} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={handleSearch} className="px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-all">Cari</button>
                    </div>

                    {/* Article Grid */}
                    {articles.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-5xl mb-4">📚</p>
                            <p className="text-slate-500 text-sm">Belum ada artikel. {isAdmin ? "Buat artikel pertama Anda!" : ""}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {articles.map((article) => (
                                <div key={article.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{article.category.name}</span>
                                            {!article.isPublished && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Draf</span>}
                                        </div>
                                        <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 mb-2">{article.title}</h3>
                                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{article.content.substring(0, 120)}...</p>
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span>oleh {article.author.name}</span>
                                            <span className="flex items-center gap-1">👁️ {article.viewCount}</span>
                                        </div>
                                    </div>
                                    <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center gap-2">
                                        <button onClick={() => setSelectedArticle(article)} className="text-xs text-primary font-medium hover:underline">Baca</button>
                                        {isAdmin && (
                                            <>
                                                <span className="text-slate-200">|</span>
                                                <button onClick={() => togglePublish(article)} className="text-xs text-slate-500 hover:text-primary font-medium">{article.isPublished ? "Unpublish" : "Publish"}</button>
                                                <span className="text-slate-200">|</span>
                                                <button onClick={() => handleDeleteArticle(article.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Hapus</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Categories Tab ── */}
            {activeTab === "categories" && isAdmin && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Buat Kategori Baru</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input type="text" placeholder="Nama Kategori *" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            <input type="text" placeholder="Deskripsi (opsional)" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            <input type="text" placeholder="Icon (opsional, misal: wifi)" value={newCategoryIcon} onChange={(e) => setNewCategoryIcon(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                        </div>
                        <button onClick={handleCreateCategory} disabled={isPending || !newCategoryName.trim()} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all">
                            {isPending ? "Membuat..." : "Buat Kategori"}
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Daftar Kategori</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {categories.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-400">Belum ada kategori.</div>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id} className="px-6 py-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-700">{cat.name}</p>
                                            <p className="text-xs text-slate-400">{cat.description || "Tidak ada deskripsi"} · {cat._count.articles} artikel</p>
                                        </div>
                                        <button onClick={() => handleDeleteCategory(cat.id)} disabled={cat._count.articles > 0} className="text-xs text-red-400 hover:text-red-600 disabled:text-slate-300 disabled:cursor-not-allowed">Hapus</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create Tab ── */}
            {activeTab === "create" && isAdmin && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                    <h3 className="text-lg font-bold text-slate-700">Buat Artikel Baru</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">Judul Artikel *</label>
                            <input type="text" placeholder="Misal: Cara Mengatasi WiFi Tidak Terkoneksi" value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">Kategori *</label>
                            <select value={articleCategoryId} onChange={(e) => setArticleCategoryId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                                <option value="">Pilih Kategori</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">Konten Artikel *</label>
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                <ReactQuill
                                    theme="snow"
                                    value={articleContent}
                                    onChange={setArticleContent}
                                    className="h-64 sm:h-80"
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                                            ['link', 'code-block'],
                                            ['clean']
                                        ],
                                    }}
                                    placeholder="Tulis panduan langkah demi langkah di sini..."
                                />
                            </div>
                        </div>
                        <div className="mt-14 sm:mt-12">
                            <label className="text-xs text-slate-500 font-medium block mb-1">Tags (pisahkan dengan koma)</label>
                            <input type="text" placeholder="wifi, koneksi, jaringan" value={articleTags} onChange={(e) => setArticleTags(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={articlePublished} onChange={(e) => setArticlePublished(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary/20" />
                            <span className="text-sm text-slate-600">Langsung Publikasikan</span>
                        </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={handleCreateArticle} disabled={isPending || !articleTitle.trim() || !articleContent.trim() || !articleCategoryId} className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all">
                            {isPending ? "Menyimpan..." : "Simpan Artikel"}
                        </button>
                        <button onClick={() => setActiveTab("articles")} className="px-6 py-2.5 border border-slate-200 text-slate-500 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all">
                            Batal
                        </button>
                    </div>
                </div>
            )}

            {/* ── Article Detail Modal ── */}
            {selectedArticle && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedArticle(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                            <div>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{selectedArticle.category.name}</span>
                                <h2 className="text-xl font-bold text-slate-800 mt-2">{selectedArticle.title}</h2>
                                <p className="text-xs text-slate-400 mt-1">oleh {selectedArticle.author.name} · 👁️ {selectedArticle.viewCount} kali dibaca</p>
                            </div>
                            <button onClick={() => setSelectedArticle(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
                            {parse(selectedArticle.content)}
                        </div>
                        {selectedArticle.tags && (
                            <div className="px-6 pb-4 flex flex-wrap gap-2">
                                {selectedArticle.tags.split(",").map((tag) => (
                                    <span key={tag.trim()} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{tag.trim()}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
