/**
 * @jest-environment node
 */

jest.mock("@tempora/db", () => {
  const tx = {
    user: { create: jest.fn() },
    workspace: { create: jest.fn() },
  };
  const prisma = {
    user: { findUnique: jest.fn() },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(tx)),
  };
  return { prisma, __tx: tx };
});

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: { hash: jest.fn(async () => "$2b$12$fakebcrypthashvaluefortest") },
}));

import { POST } from "../../app/api/auth/register/route";
import { prisma } from "@tempora/db";
import bcrypt from "bcryptjs";

type TxMock = {
  user: { create: jest.Mock };
  workspace: { create: jest.Mock };
};

const tx = (jest.requireMock("@tempora/db") as { __tx: TxMock }).__tx;
const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock };
  $transaction: jest.Mock;
};
const mockedBcrypt = bcrypt as unknown as { hash: jest.Mock };

const buildRequest = (body: unknown) =>
  new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedBcrypt.hash.mockResolvedValue("$2b$12$fakebcrypthashvaluefortest");
  });

  it("creates user and workspace with valid data", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    tx.user.create.mockResolvedValue({
      id: "clabcdef12345678",
      name: "Test User",
      email: "test@example.com",
      passwordHash: "$2b$12$fakebcrypthashvaluefortest",
    });
    tx.workspace.create.mockResolvedValue({});

    const res = await POST(
      buildRequest({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toEqual({
      success: true,
      user: {
        id: "clabcdef12345678",
        name: "Test User",
        email: "test@example.com",
      },
    });

    expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 12);
    expect(tx.user.create).toHaveBeenCalledWith({
      data: {
        name: "Test User",
        email: "test@example.com",
        passwordHash: "$2b$12$fakebcrypthashvaluefortest",
      },
    });
    expect(tx.workspace.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Test User's Workspace",
        slug: "test-user-clabcdef",
        members: {
          create: { userId: "clabcdef12345678", role: "OWNER" },
        },
      }),
    });
  });

  it("rejects duplicate email with 409", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

    const res = await POST(
      buildRequest({
        name: "Second User",
        email: "duplicate@example.com",
        password: "password456",
      }),
    );

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Email already in use" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects short password with 400", async () => {
    const res = await POST(
      buildRequest({
        name: "Test User",
        email: "short@example.com",
        password: "123",
      }),
    );

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("8 characters");
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects missing fields with 400", async () => {
    const res = await POST(
      buildRequest({ email: "noname@example.com" }),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Name, email and password are required",
    });
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 500 when transaction throws", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    mockedPrisma.$transaction.mockRejectedValueOnce(new Error("db down"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(
      buildRequest({
        name: "Test User",
        email: "boom@example.com",
        password: "password123",
      }),
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Something went wrong" });
    errorSpy.mockRestore();
  });
});
