import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isAdminUser } from "@/lib/auth-guard";

describe("Admin Whitelist Authorization Guard", () => {
  const originalAdmin = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    process.env.ADMIN_EMAIL = "architect@example.com";
  });

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalAdmin;
  });

  it("should approve matching admin email address case-insensitively", () => {
    // Arrange
    const email = "ARCHITECT@example.com";

    // Act
    const allowed = isAdminUser(email);

    // Assert
    expect(allowed).toBe(true);
  });

  it("should deny unauthorized email address", () => {
    // Arrange
    const strangerEmail = "intruder@malicious.org";

    // Act
    const allowed = isAdminUser(strangerEmail);

    // Assert
    expect(allowed).toBe(false);
  });

  it("should deny null or undefined email", () => {
    // Act & Assert
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });
});
