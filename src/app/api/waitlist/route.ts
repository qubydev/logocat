import { NextResponse } from "next/server";
import { db } from "@/db";
import { waitlist } from "@/db/schema";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Invalid email" },
                { status: 400 }
            );
        }

        await db.insert(waitlist)
            .values({
                email: email.toLowerCase().trim(),
            })
            .onConflictDoNothing({ target: waitlist.email });

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to join waitlist" },
            { status: 500 }
        );
    }
}