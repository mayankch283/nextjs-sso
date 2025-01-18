import { HealthService } from "@/services/Health/HealthService";
import { NextResponse } from "next/server";

export function GET() {
    try {
        return NextResponse.json(HealthService.checkHealth());
    } catch (e) {
        return NextResponse.json({
            success: false,
            message: (e as Error).message
        }, { status: 500 });
    }
}