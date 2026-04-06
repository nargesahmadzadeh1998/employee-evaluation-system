import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, name, password } = await req.json();
  if (!token || !name || !password) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  if (invitation.accepted) return NextResponse.json({ error: "Already accepted" }, { status: 400 });
  if (new Date() > invitation.expiresAt) return NextResponse.json({ error: "Expired" }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);
  const departmentIds: string[] = JSON.parse(invitation.departmentIds);

  const user = await prisma.user.create({
    data: {
      name,
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role,
      departmentAccess: {
        create: departmentIds.map((dId) => ({ departmentId: dId })),
      },
    },
  });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { accepted: true },
  });

  return NextResponse.json({ success: true, userId: user.id });
}
