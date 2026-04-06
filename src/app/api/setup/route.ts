import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoSeed } from "@/lib/auto-seed";

export async function GET() {
  try {
    // Run migrations via prisma db push equivalent - create tables if needed
    // Auto-seed if database is empty
    await autoSeed();

    const userCount = await prisma.user.count();
    return NextResponse.json({
      ready: true,
      seeded: userCount > 0,
      message: userCount > 0 ? "System is ready" : "Seeding...",
    });
  } catch (e: any) {
    return NextResponse.json({ ready: false, error: e.message }, { status: 500 });
  }
}
