import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invitations = await prisma.invitation.findMany({
    include: { invitedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invitations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, role, departmentIds } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "User already exists" }, { status: 400 });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.invitation.create({
    data: {
      email,
      role: role || "evaluator",
      token,
      expiresAt,
      invitedById: (session.user as any).id,
      departmentIds: JSON.stringify(departmentIds || []),
    },
  });

  return NextResponse.json({
    ...invitation,
    inviteLink: `${process.env.NEXTAUTH_URL || ""}/accept-invite?token=${token}`,
  });
}
