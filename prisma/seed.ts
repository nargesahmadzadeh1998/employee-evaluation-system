import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.score.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.userDepartmentAccess.deleteMany();
  await prisma.criterion.deleteMany();
  await prisma.skillJobTitle.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Create departments
  const engineering = await prisma.department.create({ data: { name: "Engineering" } });
  const marketing = await prisma.department.create({ data: { name: "Marketing" } });
  const hr = await prisma.department.create({ data: { name: "Human Resources" } });
  const sales = await prisma.department.create({ data: { name: "Sales" } });

  console.log("Departments created");

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
  const evaluator = await prisma.user.create({
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

  console.log("Users created");

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

  console.log("Employees created");

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
        create: [
          { jobTitle: "Marketing Specialist" },
        ],
      },
    },
    include: { criteria: true },
  });

  const salesSkill = await prisma.skill.create({
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
        create: [
          { jobTitle: "Sales Representative" },
        ],
      },
    },
    include: { criteria: true },
  });

  console.log("Skills and criteria created");

  // Add some sample scores
  const [alice, bob, charlie, diana, eve] = employees;

  // Score Alice (Software Engineer) - Good performer
  for (const criterion of communication.criteria) {
    await prisma.score.create({ data: { employeeId: alice.id, criterionId: criterion.id, evaluatorId: admin.id, value: 4 } });
  }
  for (const criterion of technical.criteria) {
    await prisma.score.create({ data: { employeeId: alice.id, criterionId: criterion.id, evaluatorId: admin.id, value: 5 } });
  }
  for (const criterion of teamwork.criteria) {
    await prisma.score.create({ data: { employeeId: alice.id, criterionId: criterion.id, evaluatorId: admin.id, value: 4 } });
  }

  // Score Bob (Software Engineer) - Needs improvement
  for (const criterion of communication.criteria) {
    await prisma.score.create({ data: { employeeId: bob.id, criterionId: criterion.id, evaluatorId: admin.id, value: 3 } });
  }
  for (const criterion of technical.criteria) {
    await prisma.score.create({ data: { employeeId: bob.id, criterionId: criterion.id, evaluatorId: admin.id, value: 3 } });
  }

  // Score Diana (Marketing) - Best fit
  for (const criterion of communication.criteria) {
    await prisma.score.create({ data: { employeeId: diana.id, criterionId: criterion.id, evaluatorId: admin.id, value: 5 } });
  }
  for (const criterion of marketingSkill.criteria) {
    await prisma.score.create({ data: { employeeId: diana.id, criterionId: criterion.id, evaluatorId: admin.id, value: 5 } });
  }

  // Score Charlie (QA) - Low performer
  for (const criterion of communication.criteria) {
    await prisma.score.create({ data: { employeeId: charlie.id, criterionId: criterion.id, evaluatorId: admin.id, value: 2 } });
  }
  for (const criterion of technical.criteria) {
    await prisma.score.create({ data: { employeeId: charlie.id, criterionId: criterion.id, evaluatorId: admin.id, value: 2 } });
  }

  console.log("Sample scores created");
  console.log("\n✅ Seed completed!");
  console.log("\nAdmin credentials:");
  console.log("  Email: admin@example.com");
  console.log("  Password: admin123");
  console.log("\nEvaluator credentials:");
  console.log("  Email: evaluator@example.com");
  console.log("  Password: eval123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
