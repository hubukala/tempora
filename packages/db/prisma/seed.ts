import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@tempora.app",
      name: "Jan Kowalski",
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Jan's Workspace",
      slug: "jans-workspace",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  // Create clients
  const clientAcme = await prisma.client.create({
    data: {
      name: "Acme Corp",
      email: "contact@acme.com",
      company: "Acme Corporation",
      hourlyRate: 150,
      workspaceId: workspace.id,
    },
  });

  const clientStartup = await prisma.client.create({
    data: {
      name: "TechStartup",
      email: "cto@techstartup.io",
      company: "TechStartup Sp. z o.o.",
      hourlyRate: 120,
      workspaceId: workspace.id,
    },
  });

  // Create projects
  const projectWeb = await prisma.project.create({
    data: {
      name: "Acme Website Redesign",
      description: "Complete redesign of corporate website",
      color: "#3b82f6",
      hourlyRate: 150,
      workspaceId: workspace.id,
      clientId: clientAcme.id,
    },
  });

  const projectApp = await prisma.project.create({
    data: {
      name: "Mobile App MVP",
      description: "React Native MVP for TechStartup",
      color: "#8b5cf6",
      hourlyRate: 120,
      workspaceId: workspace.id,
      clientId: clientStartup.id,
    },
  });

  // Create tasks for kanban
  const taskStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
  const tasks = [
    { title: "Design system setup", status: "DONE", priority: "HIGH", project: projectWeb.id },
    { title: "Homepage layout", status: "IN_REVIEW", priority: "HIGH", project: projectWeb.id },
    { title: "Contact form + validation", status: "IN_PROGRESS", priority: "MEDIUM", project: projectWeb.id },
    { title: "Blog section with MDX", status: "TODO", priority: "MEDIUM", project: projectWeb.id },
    { title: "SEO optimization", status: "TODO", priority: "LOW", project: projectWeb.id },
    { title: "Performance audit", status: "TODO", priority: "HIGH", project: projectWeb.id },
    { title: "Auth flow (login/register)", status: "DONE", priority: "URGENT", project: projectApp.id },
    { title: "Dashboard screen", status: "IN_PROGRESS", priority: "HIGH", project: projectApp.id },
    { title: "Push notifications", status: "TODO", priority: "MEDIUM", project: projectApp.id },
    { title: "Stripe integration", status: "TODO", priority: "HIGH", project: projectApp.id },
  ];

  for (let i = 0; i < tasks.length; i++) {
    await prisma.task.create({
      data: {
        title: tasks[i].title,
        status: tasks[i].status as any,
        priority: tasks[i].priority as any,
        position: i,
        projectId: tasks[i].project,
        creatorId: user.id,
        assigneeId: user.id,
      },
    });
  }

  // Create some time entries (last 7 days)
  const now = new Date();
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() - dayOffset);
    day.setHours(9, 0, 0, 0);

    const entries = Math.floor(Math.random() * 3) + 1;
    for (let e = 0; e < entries; e++) {
      const startHour = 9 + e * 2 + Math.floor(Math.random() * 2);
      const duration = (Math.floor(Math.random() * 4) + 1) * 1800; // 30min - 2h

      const startTime = new Date(day);
      startTime.setHours(startHour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setSeconds(endTime.getSeconds() + duration);

      await prisma.timeEntry.create({
        data: {
          description: `Working on ${e % 2 === 0 ? "Acme" : "TechStartup"} project`,
          startTime,
          endTime,
          duration,
          userId: user.id,
          projectId: e % 2 === 0 ? projectWeb.id : projectApp.id,
        },
      });
    }
  }

  console.log("✅ Seed complete!");
  console.log(`   User: ${user.email}`);
  console.log(`   Workspace: ${workspace.name}`);
  console.log(`   Projects: 2`);
  console.log(`   Tasks: ${tasks.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
