"use client";

import { useState, useEffect, useTransition } from "react";
import { getKbCategoriesAction, getKbArticlesAction, createKbCategoryAction, createKbArticleAction, deleteKbArticleAction, deleteKbCategoryAction, updateKbArticleAction, getKbStatsAction, incrementKbViewCountAction } from "@/app/actions/kb.actions";
import { useSession } from "next-auth/react";
import dynamic from 'next/dynamic';
import parse from 'html-react-parser';
import 'react-quill-new/dist/quill.snow.css';
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, CheckmarkBadge01Icon, Folder01Icon, ViewIcon, BookOpen01Icon, Search01Icon, Add01Icon, Delete01Icon, Cancel01Icon, Tick01Icon, FilterIcon, PencilEdit01Icon } from "@hugeicons/core-free-icons";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Category { id: string; name: string; description: string | null; icon: string | null; _count: { articles: number } }
interface Article { id: string; title: string; content: string; slug: string; isPublished: boolean; viewCount: number; helpfulCount: number; notHelpfulCount: number; tags: string | null; categoryId: string; category: { name: string; icon: string | null }; author: { name: string | null }; createdAt: Date; updatedAt: Date }
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
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editTags, setEditTags] = useState("");
    const [editPublished, setEditPublished] = useState(false);

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

    function handleViewArticle(article: Article) {
        setSelectedArticle(article);
        incrementKbViewCountAction(article.id);
        setArticles((prev) => prev.map((a) => a.id === article.id ? { ...a, viewCount: a.viewCount + 1 } : a));
    }

    function handleOpenEdit(article: Article) {
        setEditingArticle(article);
        setEditTitle(article.title);
        setEditContent(article.content);
        setEditCategoryId(article.categoryId);
        setEditTags(article.tags || "");
        setEditPublished(article.isPublished);
    }

    function handleUpdateArticle() {
        if (!editingArticle || !editTitle.trim() || !editContent.trim() || !editCategoryId) return;
        startTransition(async () => {
            try {
                await updateKbArticleAction(editingArticle.id, {
                    title: editTitle,
                    content: editContent,
                    categoryId: editCategoryId,
                    tags: editTags || undefined,
                    isPublished: editPublished,
                });
                setEditingArticle(null);
                showMsg("success", "Artikel berhasil diperbarui!");
                await loadData();
            } catch (err: unknown) {
                showMsg("error", err instanceof Error ? err.message : "Gagal memperbarui artikel");
            }
        });
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
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Knowledge Base</h1>
                    <p className="text-sm text-slate-500 mt-1 italic">Pusat dokumentasi dan panduan penyelesaian masalah mandiri.</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setActiveTab("create")} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold tracking-wider uppercase rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20">
                        <HugeiconsIcon icon={Add01Icon} className="size-4" />
                        Buat Artikel
                    </button>
                )}
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Artikel", value: stats.totalArticles, icon: File01Icon, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Terpublikasi", value: stats.publishedArticles, icon: CheckmarkBadge01Icon, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Kategori", value: stats.totalCategories, icon: Folder01Icon, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: "Total Dibaca", value: stats.totalViews, icon: ViewIcon, color: "text-orange-600", bg: "bg-orange-50" },
                    ].map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all hover:shadow-md">
                            <div className={`p-3 rounded-xl ${s.bg}`}>
                                <HugeiconsIcon icon={s.icon} className={`size-6 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-black tracking-tight text-slate-800">{s.value}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Notification */}
            {message.text && (
                <div className={`text-sm px-5 py-3.5 rounded-xl border flex items-center gap-2 font-medium ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    <HugeiconsIcon icon={message.type === "success" ? Tick01Icon : Cancel01Icon} className="size-5" />
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            {isAdmin && (
                <div className="flex gap-2 border-b border-slate-100 pb-px">
                    {([["articles", "Artikel"], ["categories", "Kategori"], ["create", "Buat Baru"]] as [TabView, string][]).map(([tab, label]) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === tab ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Articles Tab ── */}
            {activeTab === "articles" && (
                <div className="space-y-6">
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <HugeiconsIcon icon={Search01Icon} className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input type="text" placeholder="Cari panduan..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
                        </div>
                        <div className="relative w-full sm:w-64 group">
                            <HugeiconsIcon icon={FilterIcon} className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <select value={filterCategoryId} onChange={(e) => { setFilterCategoryId(e.target.value); }} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none shadow-sm cursor-pointer">
                                <option value="">Semua Kategori</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <button onClick={handleSearch} className="px-6 py-3 bg-slate-900 text-white text-sm font-bold tracking-wider uppercase rounded-xl hover:bg-slate-800 transition-all shadow-sm">Cari</button>
                    </div>

                    {/* Article Grid */}
                    {articles.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100 border-dashed">
                            <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <HugeiconsIcon icon={BookOpen01Icon} className="size-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Belum Ada Artikel</h3>
                            <p className="text-slate-400 text-sm mt-1">{isAdmin ? "Mulai dokumentasi IT pertama Anda!" : "Coba gunakan kata kunci pencarian yang lain."}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <div key={article.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col cursor-pointer" onClick={() => handleViewArticle(article)}>
                                    <div className="p-6 flex-1">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-widest">{article.category.name}</span>
                                            {!article.isPublished && <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-widest">Draf</span>}
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-3">{article.title}</h3>
                                        <div className="text-sm text-slate-500 line-clamp-3 mb-4 leading-relaxed opacity-80" dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + "..." }} />
                                    </div>
                                    <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {article.author.name?.charAt(0) || "U"}
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">{article.author.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                                            <HugeiconsIcon icon={ViewIcon} className="size-3.5" /> {article.viewCount}
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-end gap-4" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleOpenEdit(article)} className="text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                                                <HugeiconsIcon icon={PencilEdit01Icon} className="size-3" /> Edit
                                            </button>
                                            <button onClick={() => togglePublish(article)} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-700 transition-colors">{article.isPublished ? "Unpublish" : "Publish"}</button>
                                            <button onClick={() => handleDeleteArticle(article.id)} className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 transition-colors">Hapus</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Categories Tab ── */}
            {activeTab === "categories" && isAdmin && (
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <HugeiconsIcon icon={Folder01Icon} className="size-4 text-primary" /> Buat Kategori Baru
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nama Kategori</label>
                                <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Deskripsi</label>
                                <input type="text" value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Icon String</label>
                                <input type="text" placeholder="wifi" value={newCategoryIcon} onChange={(e) => setNewCategoryIcon(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                            </div>
                        </div>
                        <button onClick={handleCreateCategory} disabled={isPending || !newCategoryName.trim()} className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all">
                            {isPending ? "Menyimpan..." : "Simpan Kategori"}
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daftar Kategori Aktif</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {categories.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-400">Belum ada kategori.</div>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div>
                                            <p className="font-bold text-slate-800 text-base">{cat.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">{cat.description || "Tidak ada deskripsi"} · <span className="font-bold text-primary">{cat._count.articles} Artikel</span></p>
                                        </div>
                                        <button onClick={() => handleDeleteCategory(cat.id)} disabled={cat._count.articles > 0} className="text-xs text-red-400 hover:text-red-600 disabled:text-slate-300 disabled:cursor-not-allowed font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5">
                                            <HugeiconsIcon icon={Delete01Icon} className="size-4" /> Hapus
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create Tab ── */}
            {activeTab === "create" && isAdmin && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight border-b border-slate-100 pb-4">Tulis Artikel Pengetahuan Baru</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Judul Artikel *</label>
                            <input type="text" placeholder="Misal: Cara Mengatasi WiFi Tidak Terkoneksi" value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Kategori *</label>
                            <select value={articleCategoryId} onChange={(e) => setArticleCategoryId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none shadow-sm">
                                <option value="">-- Pilih Kategori --</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Konten Artikel *</label>
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
                                <ReactQuill
                                    theme="snow"
                                    value={articleContent}
                                    onChange={setArticleContent}
                                    className="h-[400px]"
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
                        <div className="mt-20 pt-8 border-t border-slate-100">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tags (Opsional, pisahkan koma)</label>
                            <input type="text" placeholder="wifi, error, setup" value={articleTags} onChange={(e) => setArticleTags(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <input type="checkbox" checked={articlePublished} onChange={(e) => setArticlePublished(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20" />
                            <span className="text-sm font-bold text-slate-700">Langsung publikasikan agar dapat dibaca user</span>
                        </label>
                    </div>
                    <div className="flex gap-4 pt-8 mt-8 border-t border-slate-100">
                        <button onClick={handleCreateArticle} disabled={isPending || !articleTitle.trim() || !articleContent.trim() || !articleCategoryId} className="px-8 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md">
                            {isPending ? "Menyimpan..." : "Simpan Artikel"}
                        </button>
                        <button onClick={() => setActiveTab("articles")} className="px-8 py-3 border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                            Batal
                        </button>
                    </div>
                </div>
            )}

            {/* ── Article Detail Modal ── */}
            {selectedArticle && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedArticle(null)}>
                    <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                            <div className="pr-8">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest">{selectedArticle.category.name}</span>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 tracking-tight leading-tight">{selectedArticle.title}</h2>
                                <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5"><HugeiconsIcon icon={File01Icon} className="size-3.5" /> Ditulis oleh {selectedArticle.author.name}</span>
                                    <span className="flex items-center gap-1.5"><HugeiconsIcon icon={ViewIcon} className="size-3.5" /> {selectedArticle.viewCount} Dilihat</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedArticle(null)} className="text-slate-400 hover:text-slate-900 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                                <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                            </button>
                        </div>
                        <div className="p-8 prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl prose-pre:bg-slate-900 prose-pre:rounded-xl">
                            {parse(selectedArticle.content)}
                        </div>
                        {selectedArticle.tags && (
                            <div className="px-8 pb-8 flex flex-wrap gap-2">
                                {selectedArticle.tags.split(",").map((tag) => (
                                    <span key={tag.trim()} className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">#{tag.trim()}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* ── Edit Article Modal ── */}
            {editingArticle && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setEditingArticle(null)}>
                    <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <HugeiconsIcon icon={PencilEdit01Icon} className="size-5 text-primary" /> Edit Artikel
                            </h2>
                            <button onClick={() => setEditingArticle(null)} className="text-slate-400 hover:text-slate-900 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                                <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Judul Artikel *</label>
                                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Kategori *</label>
                                <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none shadow-sm">
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Konten Artikel *</label>
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
                                    <ReactQuill theme="snow" value={editContent} onChange={setEditContent} className="h-[300px]"
                                        modules={{ toolbar: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike', 'blockquote'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'code-block'], ['clean']] }}
                                    />
                                </div>
                            </div>
                            <div className="mt-16 pt-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tags (pisahkan koma)</label>
                                <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="wifi, error, setup" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <input type="checkbox" checked={editPublished} onChange={(e) => setEditPublished(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20" />
                                <span className="text-sm font-bold text-slate-700">Publikasikan artikel ini</span>
                            </label>
                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button onClick={handleUpdateArticle} disabled={isPending || !editTitle.trim() || !editContent.trim() || !editCategoryId} className="px-8 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md">
                                    {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                                <button onClick={() => setEditingArticle(null)} className="px-8 py-3 border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
