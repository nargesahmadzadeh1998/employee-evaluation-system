import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const departmentId = req.nextUrl.searchParams.get("departmentId");

  const departments = await prisma.department.findMany({
    include: { _count: { select: { employees: true } } },
  });

  const employeeWhere = departmentId ? { departmentId } : {};
  const employees = await prisma.employee.findMany({
    where: employeeWhere,
    include: {
      department: true,
      scores: {
        include: {
          criterion: { include: { skill: true } },
        },
      },
    },
  });

  const skills = await prisma.skill.findMany({
    include: { criteria: true },
  });

  // Compute per-skill averages
  const skillAverages: Record<string, { name: string; totalScore: number; count: number }> = {};
  const criterionAverages: Record<string, { name: string; skillName: string; totalScore: number; count: number }> = {};

  for (const emp of employees) {
    for (const score of emp.scores) {
      if (score.value === null) continue;

      const skillId = score.criterion.skillId;
      const skillName = score.criterion.skill.name;
      if (!skillAverages[skillId]) {
        skillAverages[skillId] = { name: skillName, totalScore: 0, count: 0 };
      }
      skillAverages[skillId].totalScore += score.value;
      skillAverages[skillId].count += 1;

      const critId = score.criterionId;
      if (!criterionAverages[critId]) {
        criterionAverages[critId] = { name: score.criterion.name, skillName, totalScore: 0, count: 0 };
      }
      criterionAverages[critId].totalScore += score.value;
      criterionAverages[critId].count += 1;
    }
  }

  // Employee summaries
  const employeeSummaries = employees.map((emp) => {
    const validScores = emp.scores.filter((s) => s.value !== null);
    const avg = validScores.length > 0
      ? validScores.reduce((sum, s) => sum + (s.value || 0), 0) / validScores.length
      : null;

    let suggestion = "Not evaluated";
    if (avg !== null) {
      if (avg < 3) suggestion = "Not fit for the role";
      else if (avg < 4) suggestion = "Needs improvement";
      else if (avg < 4.5) suggestion = "Good fit";
      else suggestion = "Best fit";
    }

    return {
      id: emp.id,
      name: emp.name,
      department: emp.department.name,
      jobTitle: emp.jobTitle,
      averageScore: avg,
      suggestion,
    };
  });

  return NextResponse.json({
    departments: departments.map((d) => ({
      id: d.id,
      name: d.name,
      employeeCount: d._count.employees,
    })),
    skillAverages: Object.entries(skillAverages).map(([id, data]) => ({
      id,
      name: data.name,
      average: data.count > 0 ? data.totalScore / data.count : 0,
    })),
    criterionAverages: Object.entries(criterionAverages).map(([id, data]) => ({
      id,
      name: data.name,
      skillName: data.skillName,
      average: data.count > 0 ? data.totalScore / data.count : 0,
    })),
    employeeSummaries,
  });
}
