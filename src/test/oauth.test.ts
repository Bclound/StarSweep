import { describe, expect, it } from "vitest";
import { buildGitHubAuthorizationUrl, createOAuthState } from "../lib/oauth";

describe("OAuth helpers", () => {
  it("creates URL-safe random state values", () => {
    const first = createOAuthState();
    const second = createOAuthState();

    expect(first).toMatch(/^[A-Za-z0-9_-]{32,}$/);
    expect(first).not.toEqual(second);
  });

  it("builds the GitHub authorization URL", () => {
    const url = new URL(
      buildGitHubAuthorizationUrl({
        clientId: "client-1",
        redirectUri: "http://localhost:3000/api/auth/callback/github",
        state: "state-1",
        scope: "public_repo"
      })
    );

    expect(url.origin + url.pathname).toBe("https://github.com/login/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("client-1");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/auth/callback/github"
    );
    expect(url.searchParams.get("state")).toBe("state-1");
    expect(url.searchParams.get("scope")).toBe("public_repo");
  });
});
