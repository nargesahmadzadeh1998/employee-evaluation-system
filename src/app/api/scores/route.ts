import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const departmentId = req.nextUrl.searchParams.get("departmentId");
  if (!departmentId) return NextResponse.json({ error: "departmentId required" }, { status: 400 });

  const employees = await prisma.employee.findMany({
    where: { departmentId },
    include: {
      department: true,
      scores: {
        include: {
          criterion: {
            include: { skill: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const skills = await prisma.skill.findMany({
    include: {
      criteria: true,
      jobTitleLinks: true,
    },
  });

  return NextResponse.json({ employees, skills });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { employeeId, scores } = await req.json();
  const evaluatorId = (session.user as any).id;

  const results = [];
  for (const s of scores) {
    const result = await prisma.score.upsert({
      where: {
        employeeId_criterionId: {
          employeeId,
          criterionId: s.criterionId,
        },
      },
      update: { value: s.value, evaluatorId },
      create: {
        employeeId,
        criterionId: s.criterionId,
        value: s.value,
        evaluatorId,
      },
    });
    results.push(result);
  }

  return NextResponse.json(results);
}
