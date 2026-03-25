import { FastifyPluginAsync } from "fastify";
import { prisma } from "@tempora/db";
import { z } from "zod";
import type { ApiResponse } from "@tempora/types";

// ── Validation schemas ───────────────────────

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .default("#3b82f6"),
  hourlyRate: z.number().positive().optional(),
  clientId: z.string().cuid().optional(),
});

const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
});

const projectParamsSchema = z.object({
  projectId: z.string().cuid(),
});

const projectQuerySchema = z.object({
  workspaceId: z.string().cuid(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20),
});

// ── Routes ───────────────────────────────────

export const projectRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/projects
  app.get("/projects", async (request, reply) => {
    const query = projectQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: query.error.message },
      } satisfies ApiResponse<never>);
    }

    const { workspaceId, status, page, perPage } = query.data;
    const skip = (page - 1) * perPage;

    const where = {
      workspaceId,
      ...(status && { status }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          _count: { select: { tasks: true, timeEntries: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.project.count({ where }),
    ]);

    return reply.send({
      success: true,
      data: projects,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  });

  // GET /api/v1/projects/:projectId
  app.get("/projects/:projectId", async (request, reply) => {
    const params = projectParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid project ID" },
      } satisfies ApiResponse<never>);
    }

    const project = await prisma.project.findUnique({
      where: { id: params.data.projectId },
      include: {
        client: true,
        tasks: { orderBy: { position: "asc" } },
        _count: { select: { timeEntries: true } },
      },
    });

    if (!project) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found" },
      } satisfies ApiResponse<never>);
    }

    return reply.send({ success: true, data: project });
  });

  // POST /api/v1/projects
  app.post("/projects", async (request, reply) => {
    const body = createProjectSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: body.error.message },
      } satisfies ApiResponse<never>);
    }

    const query = z
      .object({ workspaceId: z.string().cuid() })
      .safeParse(request.query);
    if (!query.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "workspaceId required" },
      } satisfies ApiResponse<never>);
    }

    const project = await prisma.project.create({
      data: {
        ...body.data,
        workspaceId: query.data.workspaceId,
      },
    });

    return reply.status(201).send({ success: true, data: project });
  });

  // PATCH /api/v1/projects/:projectId
  app.patch("/projects/:projectId", async (request, reply) => {
    const params = projectParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid project ID" },
      } satisfies ApiResponse<never>);
    }

    const body = updateProjectSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: body.error.message },
      } satisfies ApiResponse<never>);
    }

    try {
      const project = await prisma.project.update({
        where: { id: params.data.projectId },
        data: body.data,
      });
      return reply.send({ success: true, data: project });
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found" },
      } satisfies ApiResponse<never>);
    }
  });

  // DELETE /api/v1/projects/:projectId
  app.delete("/projects/:projectId", async (request, reply) => {
    const params = projectParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid project ID" },
      } satisfies ApiResponse<never>);
    }

    try {
      await prisma.project.delete({
        where: { id: params.data.projectId },
      });
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found" },
      } satisfies ApiResponse<never>);
    }
  });
};
