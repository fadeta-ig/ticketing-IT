"use server";

import { NextRequest, NextResponse } from "next/server";
import { TaskService } from "@/services/task.service";

/**
 * Cron endpoint to reset recurring tasks.
 * Can be called by Vercel Cron, external scheduler, or on page load.
 * Protected by a simple bearer token from env.
 */
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isProduction = process.env.NODE_ENV === "production";

    if (!cronSecret && isProduction) {
        return NextResponse.json(
            { error: "CRON_SECRET is not configured" },
            { status: 500 }
        );
    }

    // Development may run without a secret; production requires a matching bearer token.
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await TaskService.resetRecurringTasks();
        return NextResponse.json({
            success: true,
            resetCount: result.count,
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Reset failed" },
            { status: 500 }
        );
    }
}
