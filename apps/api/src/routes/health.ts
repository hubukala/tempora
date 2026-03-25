import { FastifyPluginAsync } from "fastify";
import { prisma } from "@tempora/db";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
          api: "healthy",
          database: "healthy",
        },
      });
    } catch (error) {
      return reply.status(503).send({
        status: "degraded",
        timestamp: new Date().toISOString(),
        services: {
          api: "healthy",
          database: "unhealthy",
        },
      });
    }
  });
};
