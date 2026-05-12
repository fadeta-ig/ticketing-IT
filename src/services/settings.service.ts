import prisma from "@/lib/prisma";

export class SettingsService {
    static async getSetting(key: string, defaultValue: string = ""): Promise<string> {
        try {
            const result = await prisma.$queryRaw<Array<{ value: string }>>`SELECT value FROM SystemSetting WHERE \`key\` = ${key} LIMIT 1`;
            if (result && result.length > 0) {
                return result[0].value;
            }
            return defaultValue;
        } catch (error) {
            console.error("Error getting setting:", error);
            return defaultValue;
        }
    }

    static async setSetting(key: string, value: string, description: string = "") {
        try {
            await prisma.$executeRaw`
                INSERT INTO SystemSetting (\`key\`, value, description, updatedAt)
                VALUES (${key}, ${value}, ${description}, NOW())
                ON DUPLICATE KEY UPDATE value = ${value}, description = ${description}, updatedAt = NOW()
            `;
            return true;
        } catch (error) {
            console.error("Error setting setting:", error);
            return false;
        }
    }
}
