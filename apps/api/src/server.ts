import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { healthRoutes } from "./routes/health";
import { projectRoutes } from "./routes/projects";

const PORT = Number(process.env.API_PORT) || 4000;
const HOST = process.env.API_HOST || "0.0.0.0";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty" }
          : undefined,
    },
  });

  // Plugins
  await app.register(cors, {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    credentials: true,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Tempora API",
        description: "Freelancer project management API",
        version: "0.1.0",
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // Routes
  await app.register(healthRoutes);
  await app.register(projectRoutes, { prefix: "/api/v1" });

  return app;
}

// Start server (only when run directly, not in tests)
if (process.env.NODE_ENV !== "test") {
  buildApp()
    .then((app) => {
      app.listen({ port: PORT, host: HOST }, (err) => {
        if (err) {
          app.log.error(err);
          process.exit(1);
        }
        app.log.info(`🚀 Tempora API running on http://localhost:${PORT}`);
        app.log.info(`📚 Swagger docs: http://localhost:${PORT}/docs`);
      });
    })
    .catch(console.error);
}
