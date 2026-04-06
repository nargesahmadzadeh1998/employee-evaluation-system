import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      jobTitle: true,
      departmentId: true,
      department: true,
      departmentAccess: { include: { department: true } },
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, phone, jobTitle, departmentId, password } = await req.json();
  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === "admin";

  if (id !== userId && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data: any = {};
  if (name) data.name = name;
  if (phone !== undefined) data.phone = phone;
  if (jobTitle !== undefined) data.jobTitle = jobTitle;
  if (departmentId !== undefined) data.departmentId = departmentId;
  if (password) data.password = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id: id || userId },
    data,
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, jobTitle: true, departmentId: true, department: true,
    },
  });
  return NextResponse.json(user);
}
