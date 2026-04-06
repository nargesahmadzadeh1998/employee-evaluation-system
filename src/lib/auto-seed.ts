import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

let seeded = false;

export async function autoSeed() {
  if (seeded) return;

  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      seeded = true;
      return;
    }

    console.log("First run detected — seeding database...");

    // Create departments
    const engineering = await prisma.department.create({ data: { name: "Engineering" } });
    const marketing = await prisma.department.create({ data: { name: "Marketing" } });
    const hr = await prisma.department.create({ data: { name: "Human Resources" } });
    const sales = await prisma.department.create({ data: { name: "Sales" } });

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: adminPassword,
        role: "admin",
        jobTitle: "System Administrator",
        departmentId: engineering.id,
      },
    });

    // Create evaluator user
    const evalPassword = await bcrypt.hash("eval123", 10);
    await prisma.user.create({
      data: {
        name: "Sarah Evaluator",
        email: "evaluator@example.com",
        password: evalPassword,
        role: "evaluator",
        jobTitle: "Team Lead",
        departmentId: engineering.id,
        departmentAccess: {
          create: [
            { departmentId: engineering.id },
            { departmentId: marketing.id },
          ],
        },
      },
    });

    // Create employees
    const employees = await Promise.all([
      prisma.employee.create({ data: { name: "Alice Johnson", jobTitle: "Software Engineer", joinDate: new Date("2026-01-15"), departmentId: engineering.id } }),
      prisma.employee.create({ data: { name: "Bob Smith", jobTitle: "Software Engineer", joinDate: new Date("2026-02-01"), departmentId: engineering.id } }),
      prisma.employee.create({ data: { name: "Charlie Brown", jobTitle: "QA Engineer", joinDate: new Date("2026-01-20"), departmentId: engineering.id } }),
      prisma.employee.create({ data: { name: "Diana Prince", jobTitle: "Marketing Specialist", joinDate: new Date("2026-03-01"), departmentId: marketing.id } }),
      prisma.employee.create({ data: { name: "Eve Wilson", jobTitle: "Marketing Specialist", joinDate: new Date("2026-02-15"), departmentId: marketing.id } }),
      prisma.employee.create({ data: { name: "Frank Castle", jobTitle: "HR Coordinator", joinDate: new Date("2026-01-10"), departmentId: hr.id } }),
      prisma.employee.create({ data: { name: "Grace Lee", jobTitle: "Sales Representative", joinDate: new Date("2026-03-10"), departmentId: sales.id } }),
      prisma.employee.create({ data: { name: "Henry Adams", jobTitle: "Sales Representative", joinDate: new Date("2026-02-20"), departmentId: sales.id } }),
    ]);

    // Create skills with criteria
    const communication = await prisma.skill.create({
      data: {
        name: "Communication",
        description: "Ability to convey information effectively",
        criteria: {
          create: [
            { name: "Verbal Communication", description: "Clarity in spoken communication" },
            { name: "Written Communication", description: "Quality of written documents and emails" },
            { name: "Active Listening", description: "Demonstrates attentive listening skills" },
          ],
        },
        jobTitleLinks: {
          create: [
            { jobTitle: "Software Engineer" },
            { jobTitle: "QA Engineer" },
            { jobTitle: "Marketing Specialist" },
            { jobTitle: "HR Coordinator" },
            { jobTitle: "Sales Representative" },
          ],
        },
      },
      include: { criteria: true },
    });

    const technical = await prisma.skill.create({
      data: {
        name: "Technical Skills",
        description: "Technical proficiency in relevant tools and technologies",
        criteria: {
          create: [
            { name: "Code Quality", description: "Writes clean, maintainable code" },
            { name: "Problem Solving", description: "Ability to debug and solve technical problems" },
            { name: "Best Practices", description: "Follows industry best practices and standards" },
            { name: "Tool Proficiency", description: "Proficiency with required tools and frameworks" },
          ],
        },
        jobTitleLinks: {
          create: [
            { jobTitle: "Software Engineer" },
            { jobTitle: "QA Engineer" },
          ],
        },
      },
      include: { criteria: true },
    });

    const teamwork = await prisma.skill.create({
      data: {
        name: "Teamwork",
        description: "Ability to collaborate effectively with team members",
        criteria: {
          create: [
            { name: "Collaboration", description: "Works well with others on team projects" },
            { name: "Conflict Resolution", description: "Handles disagreements constructively" },
            { name: "Reliability", description: "Can be depended upon by team members" },
          ],
        },
        jobTitleLinks: {
          create: [
            { jobTitle: "Software Engineer" },
            { jobTitle: "QA Engineer" },
            { jobTitle: "Marketing Specialist" },
            { jobTitle: "HR Coordinator" },
            { jobTitle: "Sales Representative" },
          ],
        },
      },
      include: { criteria: true },
    });

    const marketingSkill = await prisma.skill.create({
      data: {
        name: "Marketing Acumen",
        description: "Understanding of marketing principles and strategies",
        criteria: {
          create: [
            { name: "Campaign Planning", description: "Ability to plan effective marketing campaigns" },
            { name: "Analytics", description: "Uses data to drive marketing decisions" },
            { name: "Creativity", description: "Brings innovative ideas to marketing efforts" },
          ],
        },
        jobTitleLinks: {
          create: [{ jobTitle: "Marketing Specialist" }],
        },
      },
      include: { criteria: true },
    });

    await prisma.skill.create({
      data: {
        name: "Sales Performance",
        description: "Effectiveness in sales activities",
        criteria: {
          create: [
            { name: "Client Relations", description: "Building and maintaining client relationships" },
            { name: "Negotiation", description: "Ability to negotiate favorable terms" },
            { name: "Product Knowledge", description: "Understanding of products and services" },
          ],
        },
        jobTitleLinks: {
          create: [{ jobTitle: "Sales Representative" }],
        },
      },
    });

    // Sample scores
    const [alice, bob, charlie, diana] = employees;

    for (const c of communication.criteria) {
      await prisma.score.create({ data: { employeeId: alice.id, criterionId: c.id, evaluatorId: admin.id, value: 4 } });
    }
    for (const c of technical.criteria) {
      await prisma.score.create({ data: { employeeId: alice.id, criterionId: c.id, evaluatorId: admin.id, value: 5 } });
    }
    for (const c of teamwork.criteria) {
      await prisma.score.create({ data: { employeeId: alice.id, criterionId: c.id, evaluatorId: admin.id, value: 4 } });
    }
    for (const c of communication.criteria) {
      await prisma.score.create({ data: { employeeId: bob.id, criterionId: c.id, evaluatorId: admin.id, value: 3 } });
    }
    for (const c of technical.criteria) {
      await prisma.score.create({ data: { employeeId: bob.id, criterionId: c.id, evaluatorId: admin.id, value: 3 } });
    }
    for (const c of communication.criteria) {
      await prisma.score.create({ data: { employeeId: diana.id, criterionId: c.id, evaluatorId: admin.id, value: 5 } });
    }
    for (const c of marketingSkill.criteria) {
      await prisma.score.create({ data: { employeeId: diana.id, criterionId: c.id, evaluatorId: admin.id, value: 5 } });
    }
    for (const c of communication.criteria) {
      await prisma.score.create({ data: { employeeId: charlie.id, criterionId: c.id, evaluatorId: admin.id, value: 2 } });
    }
    for (const c of technical.criteria) {
      await prisma.score.create({ data: { employeeId: charlie.id, criterionId: c.id, evaluatorId: admin.id, value: 2 } });
    }

    seeded = true;
    console.log("Database seeded successfully!");
  } catch (e) {
    console.error("Auto-seed error:", e);
  }
}
