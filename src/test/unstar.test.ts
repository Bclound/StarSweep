import { describe, expect, it, vi } from "vitest";
import { batchUnstar } from "../lib/unstar";

describe("batchUnstar", () => {
  it("returns separate succeeded and failed repositories", async () => {
    const unstar = vi.fn(async (_token: string, _owner: string, repo: string) => {
      if (repo === "broken") {
        throw new Error("not found");
      }
    });

    const result = await batchUnstar(
      "token-1",
      [
        { owner: "octo", repo: "alpha", fullName: "octo/alpha" },
        { owner: "octo", repo: "broken", fullName: "octo/broken" }
      ],
      unstar
    );

    expect(result.succeeded).toEqual(["octo/alpha"]);
    expect(result.failed).toEqual([{ fullName: "octo/broken", message: "not found" }]);
  });
});
