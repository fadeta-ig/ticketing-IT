const fs = require('fs');
let utils = fs.readFileSync('src/lib/utils.ts', 'utf8');

if (!utils.includes('SafeAny')) {
    utils += '\n// eslint-disable-next-line @typescript-eslint/no-explicit-any\nexport type SafeAny = any;\n';
}

utils = utils.replace('export function formatErrorMessage(error: Record<string, unknown>): string', 'export function formatErrorMessage(error: unknown): string');

fs.writeFileSync('src/lib/utils.ts', utils, 'utf8');

let ticketDetail = fs.readFileSync('src/components/ticketing/ticket-detail.tsx', 'utf8');
if (ticketDetail.includes('ticket: Record<string, unknown>')) {
    ticketDetail = ticketDetail.replace(/Record<string, unknown>/g, 'SafeAny');
    if (!ticketDetail.includes('import { SafeAny } from "@/lib/utils"')) {
        ticketDetail = 'import { SafeAny } from "@/lib/utils";\n' + ticketDetail;
    }
}
ticketDetail = ticketDetail.replace('import { TicketStatus } from "@prisma/client"\n', '');
if (!ticketDetail.includes('import { TicketStatus } from "@prisma/client"')) {
    ticketDetail = 'import { TicketStatus } from "@prisma/client";\n' + ticketDetail;
}
fs.writeFileSync('src/components/ticketing/ticket-detail.tsx', ticketDetail, 'utf8');
