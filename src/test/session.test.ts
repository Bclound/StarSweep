import { describe, expect, it } from "vitest";
import { sealSession, unsealSession } from "../lib/session";

describe("session helpers", () => {
  const secret = "replace-with-a-very-long-secret-for-tests";

  it("round-trips encrypted session data", async () => {
    const sealed = await sealSession({ accessToken: "token-1", login: "octo" }, secret);

    await expect(unsealSession(sealed, secret)).resolves.toEqual({
      accessToken: "token-1",
      login: "octo"
    });
  });

  it("returns null for tampered session values", async () => {
    const sealed = await sealSession({ accessToken: "token-1", login: "octo" }, secret);

    await expect(unsealSession(`${sealed}x`, secret)).resolves.toBeNull();
  });
});
