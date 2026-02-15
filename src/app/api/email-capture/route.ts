import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ detail: "Invalid email" }, { status: 400 });
    }

    await prisma.emailCapture.create({
      data: { email, source: body.source || "flow_wizard" },
    });

    console.log(`[EmailCapture] ${email}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[EmailCapture] Error:", e);
    return NextResponse.json({ detail: "Save failed" }, { status: 500 });
  }
}
