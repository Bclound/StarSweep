import { describe, expect, it, vi } from "vitest";
import {
  GitHubApiError,
  listStarredRepositories,
  unstarRepository
} from "../lib/github";

const response = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });

describe("GitHub API client", () => {
  it("lists starred repositories using the authenticated user endpoint", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(200, []));

    await listStarredRepositories("token-1", 2, fetcher);

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.github.com/user/starred?per_page=100&page=2&sort=created&direction=desc",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-1",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        })
      })
    );
  });

  it("unstars a repository using owner and repository name", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    await unstarRepository("token-1", "octo", "alpha", fetcher);

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.github.com/user/starred/octo/alpha",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("normalizes rate limit errors", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response(403, { message: "API rate limit exceeded" })
    );

    await expect(listStarredRepositories("token-1", 1, fetcher)).rejects.toMatchObject({
      code: "rate_limited"
    } satisfies Partial<GitHubApiError>);
  });
});
