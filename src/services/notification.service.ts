import { SettingsService } from "./settings.service";

export class NotificationService {
    private static readonly WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "";
    private static readonly FALLBACK_ADMIN_NUMBER = "081553821808";

    private static async getAdminNumber() {
        return await SettingsService.getSetting("WA_ADMIN_NUMBER", this.FALLBACK_ADMIN_NUMBER);
    }

    static async sendWhatsAppNotification(ticket: {
        id: string;
        title: string;
        priority: string;
        creatorName: string;
    }) {
        const message = `🚨 *TIKET BARU DITERIMA* 🚨\n\n` +
            `ID: ${ticket.id}\n` +
            `Judul: ${ticket.title}\n` +
            `Prioritas: ${ticket.priority}\n` +
            `Pengirim: ${ticket.creatorName}\n\n` +
            `Silakan cek dashboard untuk detail lebih lanjut.`;

        const adminNumber = await this.getAdminNumber();
        console.log(`[WhatsApp Notification] Sending to ${adminNumber}:`, message);

        if (!this.WHATSAPP_API_URL) {
            console.warn("[WhatsApp Notification] WHATSAPP_API_URL not configured. Message logged to console only.");
            return;
        }

        try {
            const response = await fetch(this.WHATSAPP_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    number: adminNumber,
                    message: message,
                }),
            });

            if (!response.ok) {
                throw new Error(`WA Gateway error: ${response.statusText}`);
            }

            console.log("[WhatsApp Notification] Successfully sent via gateway.");
        } catch (error) {
            console.error("[WhatsApp Notification] Failed to send:", error);
        }
    }

    static async sendStatusUpdateNotification(params: {
        ticketId: string;
        title: string;
        status: string;
        note?: string;
        recipientNumber?: string;
        recipientName: string;
    }) {
        const message = `🛠️ *UPDATE PENANGANAN TIKET* 🚨\n\n` +
            `ID: ${params.ticketId}\n` +
            `Judul: ${params.title}\n` +
            `Status Kini: *${params.status}*\n\n` +
            (params.note ? `*Catatan IT:* ${params.note}\n\n` : "") +
            `Halo ${params.recipientName}, tiket Anda sedang kami proses. Mohon ditunggu update selanjutnya.`;

        const adminNumber = await this.getAdminNumber();
        const targetNumber = params.recipientNumber || adminNumber;
        console.log(`[WhatsApp Notification] Sending Update to ${targetNumber}:`, message);

        if (!this.WHATSAPP_API_URL) {
            console.warn("[WhatsApp Notification] WHATSAPP_API_URL not configured.");
            return;
        }

        try {
            await fetch(this.WHATSAPP_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ number: targetNumber, message: message }),
            });
        } catch (error) {
            console.error("[WhatsApp Notification] Failed to send update:", error);
        }
    }
}
