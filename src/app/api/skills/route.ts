import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const skills = await prisma.skill.findMany({
    include: {
      criteria: true,
      jobTitleLinks: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(skills);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, criteria, jobTitles } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const skill = await prisma.skill.create({
    data: {
      name,
      description: description || "",
      criteria: {
        create: (criteria || []).map((c: any) => ({
          name: c.name,
          description: c.description || "",
        })),
      },
      jobTitleLinks: {
        create: (jobTitles || []).map((jt: string) => ({ jobTitle: jt })),
      },
    },
    include: { criteria: true, jobTitleLinks: true },
  });
  return NextResponse.json(skill);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, description, criteria, jobTitles } = await req.json();

  await prisma.criterion.deleteMany({ where: { skillId: id } });
  await prisma.skillJobTitle.deleteMany({ where: { skillId: id } });

  const skill = await prisma.skill.update({
    where: { id },
    data: {
      name,
      description: description || "",
      criteria: {
        create: (criteria || []).map((c: any) => ({
          name: c.name,
          description: c.description || "",
        })),
      },
      jobTitleLinks: {
        create: (jobTitles || []).map((jt: string) => ({ jobTitle: jt })),
      },
    },
    include: { criteria: true, jobTitleLinks: true },
  });
  return NextResponse.json(skill);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.skill.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
