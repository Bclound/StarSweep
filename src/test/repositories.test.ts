import { describe, expect, it } from "vitest";
import {
  filterRepositories,
  getLanguages,
  sortRepositories,
  toggleVisibleSelection,
  type RepositoryView
} from "../lib/repositories";

const repo = (overrides: Partial<RepositoryView>): RepositoryView => ({
  id: 1,
  owner: "octo",
  name: "alpha",
  fullName: "octo/alpha",
  description: "Alpha repo",
  language: "TypeScript",
  stargazersCount: 10,
  pushedAt: "2024-01-01T00:00:00Z",
  archived: false,
  private: false,
  url: "https://github.com/octo/alpha",
  ...overrides
});

describe("sortRepositories", () => {
  it("sorts repositories by least recently pushed first", () => {
    const result = sortRepositories(
      [
        repo({ id: 1, fullName: "octo/newer", pushedAt: "2025-01-01T00:00:00Z" }),
        repo({ id: 2, fullName: "octo/older", pushedAt: "2020-01-01T00:00:00Z" })
      ],
      "oldest-pushed"
    );

    expect(result.map((item) => item.fullName)).toEqual(["octo/older", "octo/newer"]);
  });
});

describe("repository list helpers", () => {
  it("filters by search text, language, and archived state", () => {
    const repos = [
      repo({
        id: 1,
        fullName: "octo/keeper",
        description: "Useful CLI",
        language: "Go",
        archived: false
      }),
      repo({
        id: 2,
        fullName: "octo/old-ui",
        description: "Legacy UI",
        language: "TypeScript",
        archived: true
      })
    ];

    expect(
      filterRepositories(repos, {
        query: "legacy",
        language: "TypeScript",
        archived: "archived"
      }).map((item) => item.fullName)
    ).toEqual(["octo/old-ui"]);
  });

  it("returns sorted non-empty languages", () => {
    expect(
      getLanguages([
        repo({ id: 1, language: "Go" }),
        repo({ id: 2, language: null }),
        repo({ id: 3, language: "TypeScript" }),
        repo({ id: 4, language: "Go" })
      ])
    ).toEqual(["Go", "TypeScript"]);
  });

  it("selects all visible repositories and then clears only visible repositories", () => {
    const selected = toggleVisibleSelection(new Set([99]), [repo({ id: 1 }), repo({ id: 2 })]);
    expect([...selected].sort()).toEqual([1, 2, 99]);

    const cleared = toggleVisibleSelection(selected, [repo({ id: 1 }), repo({ id: 2 })]);
    expect([...cleared]).toEqual([99]);
  });
});
