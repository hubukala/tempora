/**
 * @jest-environment node
 */

jest.mock("@tempora/db", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
  },
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: { compare: jest.fn() },
}));

import { authOptions } from "@/lib/auth";
import { prisma } from "@tempora/db";
import bcrypt from "bcryptjs";

type AuthorizeFn = (
  credentials: Record<string, string> | undefined,
) => Promise<unknown>;

// NextAuth's CredentialsProvider keeps the real authorize in `options.authorize`;
// the top-level `authorize` is a `() => null` stub.
const authorize = (
  authOptions.providers[0] as unknown as {
    options: { authorize: AuthorizeFn };
  }
).options.authorize;

const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock };
};
const mockedBcrypt = bcrypt as unknown as { compare: jest.Mock };

const buildUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  passwordHash: "$2b$12$hashedvalue",
  workspaces: [
    {
      role: "OWNER",
      workspace: { id: "ws-abc", name: "Test's Workspace" },
    },
  ],
  ...overrides,
});

describe("authorize (credentials login)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns user + workspace info for valid credentials", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(buildUser());
    mockedBcrypt.compare.mockResolvedValue(true);

    const result = await authorize({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      workspaceId: "ws-abc",
      role: "OWNER",
    });
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      include: { workspaces: { include: { workspace: true }, take: 1 } },
    });
    expect(mockedBcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "$2b$12$hashedvalue",
    );
  });

  it("defaults to null workspaceId and MEMBER role when user has no workspace", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(
      buildUser({ workspaces: [] }),
    );
    mockedBcrypt.compare.mockResolvedValue(true);

    const result = await authorize({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toMatchObject({ workspaceId: null, role: "MEMBER" });
  });

  it("returns null when credentials are undefined", async () => {
    expect(await authorize(undefined)).toBeNull();
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when email is missing", async () => {
    expect(
      await authorize({ password: "password123" } as Record<string, string>),
    ).toBeNull();
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when password is missing", async () => {
    expect(
      await authorize({ email: "test@example.com" } as Record<string, string>),
    ).toBeNull();
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when user is not found", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const result = await authorize({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(result).toBeNull();
    expect(mockedBcrypt.compare).not.toHaveBeenCalled();
  });

  it("returns null when user has no password hash (OAuth-only account)", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(
      buildUser({ passwordHash: null }),
    );

    const result = await authorize({
      email: "oauth@example.com",
      password: "password123",
    });

    expect(result).toBeNull();
    expect(mockedBcrypt.compare).not.toHaveBeenCalled();
  });

  it("returns null when password does not match", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(buildUser());
    mockedBcrypt.compare.mockResolvedValue(false);

    const result = await authorize({
      email: "test@example.com",
      password: "wrong-password",
    });

    expect(result).toBeNull();
  });
});
