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

    // Allow if no secret is set (dev mode) or if token matches
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
