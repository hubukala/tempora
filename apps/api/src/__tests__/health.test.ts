import { buildApp } from "../server";
import type { FastifyInstance } from "fastify";

describe("Health endpoint", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return 200 with healthy status", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.payload);
    expect(body.status).toBe("ok");
    expect(body.services.api).toBe("healthy");
    expect(body.services.database).toBe("healthy");
    expect(body.timestamp).toBeDefined();
  });
});
