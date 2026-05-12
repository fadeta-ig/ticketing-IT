"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Calendar03Icon,
    UserIcon,
    AlertCircleIcon,
    ArrowLeft01Icon,
    Clock01Icon,
    CheckmarkBadge01Icon,
    PlayIcon,
    Cancel01Icon,
    InformationCircleIcon
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { updateTicketStatusAction } from "@/app/actions/ticket.actions"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { formatErrorMessage } from "@/lib/utils"

interface TicketComment {
    id: string;
    content: string;
    createdAt: Date;
    author: { name: string | null } | null;
}

interface TicketDetailData {
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    category: string | null;
    classification: string | null;
    createdAt: Date;
    creator: { name: string | null } | null;
    comments: TicketComment[];
}

export function TicketDetail({ ticket }: { ticket: TicketDetailData }) {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "ADMIN"

    const [isLoading, setIsLoading] = useState(false)
    const [note, setNote] = useState("")

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT": return "text-red-600 bg-red-50"
            case "HIGH": return "text-orange-600 bg-orange-50"
            case "MEDIUM": return "text-blue-600 bg-blue-50"
            default: return "text-slate-600 bg-slate-50"
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "OPEN": return "success"
            case "IN_PROGRESS": return "warning"
            case "RESOLVED": return "default"
            case "CLOSED": return "secondary"
            default: return "outline"
        }
    }

    const handleUpdateStatus = async (status: string) => {
        setIsLoading(true)
        try {
            await updateTicketStatusAction(ticket.id, status as Parameters<typeof updateTicketStatusAction>[1], note)
            toast.success(`Berhasil memperbarui status ke ${status}`)
            setNote("")
        } catch (error: unknown) {
            toast.error("Gagal: " + formatErrorMessage(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="size-9 rounded-xl border-slate-200">
                        <Link href="/dashboard/ticketing">
                            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 text-slate-500" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Detail Tiket</h2>
                        <p className="text-[11px] text-slate-400 font-medium">ID: #{ticket.id.substring(0, 8)}</p>
                    </div>
                </div>
                <Badge variant="outline" className="px-3 py-1 rounded-lg font-bold text-[10px] tracking-wider bg-white border-slate-200">
                    {ticket.status}
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Information Section */}
                <div className="md:col-span-2 space-y-4">
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-6">
                            <h1 className="text-xl font-bold text-slate-900 mb-6 leading-tight">
                                {ticket.title}
                            </h1>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <HugeiconsIcon icon={InformationCircleIcon} className="size-3" />
                                    Deskripsi Masalah
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 text-slate-600 text-sm leading-relaxed">
                                    {ticket.description}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <div className="flex-1 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Kategori</p>
                                    <p className="text-xs font-bold text-slate-700">{ticket.category || "General"}</p>
                                </div>
                                <div className="flex-1 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Klasifikasi</p>
                                    <p className="text-xs font-bold text-slate-700">{ticket.classification || "Perangkat"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-4 grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                    <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Prioritas</p>
                                    <p className={`text-xs font-bold ${getPriorityColor(ticket.priority).split(' ')[0]}`}>{ticket.priority}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <HugeiconsIcon icon={UserIcon} className="size-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Pelapor</p>
                                    <p className="text-xs font-bold text-slate-700 truncate">{ticket.creator?.name || "Anonim"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Dilaporkan</p>
                                    <p className="text-xs font-bold text-slate-700">{format(new Date(ticket.createdAt), "dd MMM HH:mm", { locale: id })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Handling History */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
                            <HugeiconsIcon icon={InformationCircleIcon} className="size-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-800">Riwayat Penanganan</h3>
                        </div>
                        <CardContent className="p-6">
                            {ticket.comments && ticket.comments.length > 0 ? (
                                <div className="space-y-6">
                                    {ticket.comments.map((comment: TicketComment, idx: number) => (
                                        <div key={comment.id} className="relative pl-6 pb-2 last:pb-0">
                                            {/* Line marker */}
                                            {idx !== ticket.comments.length - 1 && (
                                                <div className="absolute left-[3px] top-2 bottom-0 w-[1px] bg-slate-100" />
                                            )}
                                            <div className="absolute left-0 top-1.5 size-1.5 rounded-full bg-primary/40 ring-4 ring-primary/5" />

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] font-bold text-slate-700">{comment.author?.name || "Petugas IT"}</p>
                                                    <p className="text-[10px] text-slate-400">{format(new Date(comment.createdAt), "dd MMM, HH:mm", { locale: id })}</p>
                                                </div>
                                                <p className="text-[13px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest italic">Belum ada catatan riwayat</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions Section */}
                <div className="space-y-4">
                    {isAdmin && (
                        <>
                            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="text-sm font-bold text-slate-800">Panel Tindakan</h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Selesaikan tiket sesuai SLA IT</p>
                                </div>
                                <CardContent className="p-5 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                                            Catatan untuk User
                                        </label>
                                        <Textarea
                                            placeholder="Tulis update perbaikan di sini..."
                                            className="min-h-[100px] rounded-xl bg-slate-50 border-slate-100 text-xs focus-visible:ring-slate-200"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2 pt-2">
                                        {ticket.status === "OPEN" && (
                                            <Button
                                                className="h-10 w-full rounded-xl gap-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold shadow-sm"
                                                onClick={() => handleUpdateStatus("IN_PROGRESS")}
                                                disabled={isLoading}
                                            >
                                                <HugeiconsIcon icon={PlayIcon} className="size-3.5" />
                                                Mulai Kerjakan
                                            </Button>
                                        )}

                                        {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
                                            <Button
                                                className="h-10 w-full rounded-xl gap-2 bg-primary text-xs font-bold shadow-sm"
                                                onClick={() => handleUpdateStatus("RESOLVED")}
                                                disabled={isLoading}
                                            >
                                                <HugeiconsIcon icon={CheckmarkBadge01Icon} className="size-3.5" />
                                                Selesaikan
                                            </Button>
                                        )}

                                        {ticket.status !== "CLOSED" && (
                                            <Button
                                                variant="outline"
                                                className="h-10 w-full rounded-xl gap-2 border-slate-200 text-xs font-bold hover:bg-slate-50 text-slate-500"
                                                onClick={() => handleUpdateStatus("CLOSED")}
                                                disabled={isLoading}
                                            >
                                                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                                                Tutup Tiket
                                            </Button>
                                        )}

                                        {ticket.status === "CLOSED" && (
                                            <div className="py-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest italic border border-dashed border-slate-200 rounded-xl">
                                                Tiket Selesai
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                                <p className="text-[11px] text-blue-600 font-medium leading-relaxed italic">
                                    Tip: Pastikan catatan sudah terisi agar user mengetahui progres terbaru.
                                </p>
                            </div>
                        </>
                    )}

                    {!isAdmin && (
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-3">
                            <div className="size-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-primary">
                                <HugeiconsIcon icon={Clock01Icon} className="size-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-800">Status Pengiriman</h4>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                    Tiket Anda sedang dalam antrean penanganan oleh tim IT. Anda akan mendapatkan notifikasi WhatsApp jika terdapat update terbaru.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
