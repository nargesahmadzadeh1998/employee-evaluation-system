import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const departmentId = req.nextUrl.searchParams.get("departmentId");
  const where = departmentId ? { departmentId } : {};

  const employees = await prisma.employee.findMany({
    where,
    include: { department: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, jobTitle, joinDate, departmentId } = await req.json();
  if (!name || !jobTitle || !joinDate || !departmentId) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const employee = await prisma.employee.create({
    data: { name, jobTitle, joinDate: new Date(joinDate), departmentId },
    include: { department: true },
  });
  return NextResponse.json(employee);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, jobTitle, joinDate, departmentId } = await req.json();
  const employee = await prisma.employee.update({
    where: { id },
    data: { name, jobTitle, joinDate: new Date(joinDate), departmentId },
    include: { department: true },
  });
  return NextResponse.json(employee);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
