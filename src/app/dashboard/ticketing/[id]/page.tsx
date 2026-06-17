import { TicketService } from "@/services/ticket.service"
import { UserService } from "@/services/user.service"
import { SlaService } from "@/services/sla.service"
import { TicketDetail } from "@/components/ticketing/ticket-detail"
import { notFound } from "next/navigation"
import { Priority } from "@prisma/client"

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [ticket, staffList] = await Promise.all([
        TicketService.getTicketById(id),
        UserService.getStaffUsers(),
    ])

    if (!ticket) {
        notFound()
    }

    // Calculate SLA status server-side
    const slaStatus = SlaService.getSlaStatus(ticket.dueAt, ticket.resolvedAt)
    const slaPolicy = await SlaService.getPolicyForPriority(ticket.priority as Priority)

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
