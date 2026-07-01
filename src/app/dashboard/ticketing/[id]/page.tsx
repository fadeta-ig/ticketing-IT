import { TicketService } from "@/services/ticket.service"
import { UserService } from "@/services/user.service"
import { SlaService } from "@/services/sla.service"
import { TicketDetail } from "@/components/ticketing/ticket-detail"
import { notFound, redirect } from "next/navigation"
import { Priority } from "@prisma/client"
import { getCurrentUser, hasStaffRole } from "@/lib/authz"

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
        redirect("/auth/login")
    }

    const ticket = await TicketService.getTicketById(id)

    if (!ticket) {
        notFound()
    }

    const canManageTickets = hasStaffRole(user)
    if (!canManageTickets && ticket.creatorId !== user.id) {
        notFound()
    }

    // Calculate SLA status server-side
    const slaStatus = SlaService.getSlaStatus(ticket.dueAt, ticket.resolvedAt)
    const [staffList, slaPolicy] = await Promise.all([
        canManageTickets ? UserService.getStaffUsers() : Promise.resolve([]),
        SlaService.getPolicyForPriority(ticket.priority as Priority),
    ])

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            <TicketDetail
                ticket={ticket}
                staffList={staffList}
                slaStatus={slaStatus}
                slaPolicy={slaPolicy}
            />
        </div>
    )
}
