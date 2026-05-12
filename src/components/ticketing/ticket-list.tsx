"use client"

import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    MoreVerticalIcon,
    Delete02Icon,
    Search01Icon,
    FilterIcon,
    ViewIcon,
    Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { deleteTicketAction, updateTicketStatusAction } from "@/app/actions/ticket.actions"
import { toast } from "sonner"
import { formatErrorMessage, type SafeAny } from "@/lib/utils"
import { useSession } from "next-auth/react"

const ITEMS_PER_PAGE = 8

const STATUS_OPTIONS = [
    { value: "ALL", label: "Semua Status" },
    { value: "OPEN", label: "Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CLOSED", label: "Closed" },
]

const PRIORITY_OPTIONS = [
    { value: "ALL", label: "Semua Prioritas" },
    { value: "URGENT", label: "Urgent" },
    { value: "HIGH", label: "High" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LOW", label: "Low" },
]

export function TicketList({ initialTickets }: { initialTickets: SafeAny[] }) {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "ADMIN"

    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState("ALL")
    const [filterPriority, setFilterPriority] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const [ticketToDelete, setTicketToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    const hasActiveFilter = filterStatus !== "ALL" || filterPriority !== "ALL"

    const filteredTickets = initialTickets.filter((ticket) => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === "ALL" || ticket.status === filterStatus
        const matchesPriority = filterPriority === "ALL" || ticket.priority === filterPriority
        return matchesSearch && matchesStatus && matchesPriority
    })

    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedTickets = filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    // Reset to page 1 when any filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, filterStatus, filterPriority])

    const handleClearFilters = () => {
        setFilterStatus("ALL")
        setFilterPriority("ALL")
        setSearchQuery("")
    }

    const handleDelete = async () => {
        if (!ticketToDelete) return
        setIsDeleting(true)
        try {
            await deleteTicketAction(ticketToDelete)
            toast.success("Tiket Berhasil Dihapus")
            setTicketToDelete(null)
        } catch (error: unknown) {
            toast.error("Gagal menghapus tiket: " + formatErrorMessage(error))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateTicketStatusAction(id, status as SafeAny)
            toast.success(`Status tiket diperbarui ke ${status}`)
        } catch (error: unknown) {
            toast.error("Gagal memperbarui status: " + formatErrorMessage(error))
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT": return "bg-red-500/10 text-red-500 border-red-500/20"
            case "HIGH": return "bg-orange-500/10 text-orange-500 border-orange-500/20"
            case "MEDIUM": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-green-500/10 text-green-500 border-green-500/20"
            case "IN_PROGRESS": return "bg-amber-500/10 text-amber-500 border-amber-500/20"
            case "RESOLVED": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "CLOSED": return "bg-slate-500/10 text-slate-500 border-slate-500/20"
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20"
        }
    }

    return (
        <div className="space-y-4">
            {/* Search + Filter Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari tiket berdasarkan judul atau ID..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    variant={showFilters ? "default" : "outline"}
                    className="gap-2 shrink-0 relative"
                    onClick={() => setShowFilters((v) => !v)}
                >
                    <HugeiconsIcon icon={FilterIcon} className="size-4" />
                    Filter
                    {hasActiveFilter && (
                        <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-primary text-[9px] text-white font-bold flex items-center justify-center">
                            {(filterStatus !== "ALL" ? 1 : 0) + (filterPriority !== "ALL" ? 1 : 0)}
                        </span>
                    )}
                </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-xl border border-dashed animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Status:</span>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-8 text-xs bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Prioritas:</span>
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger className="h-8 text-xs bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PRIORITY_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {hasActiveFilter && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                            onClick={handleClearFilters}
                        >
                            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                            Reset
                        </Button>
                    )}

                    <p className="text-[11px] text-muted-foreground ml-auto">
                        {filteredTickets.length} tiket ditemukan
                    </p>
                </div>
            )}

            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[120px]">ID</TableHead>
                                <TableHead>Judul Masalah</TableHead>
                                <TableHead>Pemohon</TableHead>
                                <TableHead>Prioritas</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTickets.length > 0 ? (
                                paginatedTickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-mono text-xs font-medium">{ticket.id.substring(0, 8)}</TableCell>
                                        <TableCell className="font-medium">{ticket.title}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{ticket.creator?.name || "Anonim"}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                                {ticket.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(ticket.status)}>
                                                {ticket.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8 text-primary hover:bg-primary/10" asChild title="Lihat Detail">
                                                    <Link href={`/dashboard/ticketing/${ticket.id}`}>
                                                        <HugeiconsIcon icon={ViewIcon} className="size-4" />
                                                    </Link>
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8">
                                                            <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                            <Link href={`/dashboard/ticketing/${ticket.id}`} className="flex items-center">
                                                                <HugeiconsIcon icon={ViewIcon} className="mr-2 size-4" />
                                                                Lihat Detail
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                {ticket.status === "OPEN" && (
                                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, "IN_PROGRESS")} className="cursor-pointer">
                                                                        Kerjakan
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
                                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, "RESOLVED")} className="cursor-pointer">
                                                                        Selesaikan
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {ticket.status !== "CLOSED" && (
                                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, "CLOSED")} className="cursor-pointer">
                                                                        Tutup
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setTicketToDelete(ticket.id)}
                                                                    className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer"
                                                                >
                                                                    <HugeiconsIcon icon={Delete02Icon} className="mr-2 size-4" />
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        {hasActiveFilter || searchQuery
                                            ? "Tidak ada tiket yang sesuai dengan filter."
                                            : "Tidak ada tiket ditemukan."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <ConfirmModal
                isOpen={!!ticketToDelete}
                onClose={() => setTicketToDelete(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                variant="destructive"
                title="Hapus Tiket?"
                description="Tiket ini akan dihapus permanen. Pastikan masalah sudah benar-benar selesai atau tidak valid."
                confirmText="Ya, Hapus Tiket"
            />
        </div>
    )
}
