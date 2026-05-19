import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Vercel Analytics integration", () => {
  it("installs the Vercel Analytics package", () => {
    const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
      dependencies?: Record<string, string>;
    };

    expect(manifest.dependencies).toHaveProperty("@vercel/analytics");
  });

  it("renders Analytics from the root layout", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");

    expect(layout).toContain('import { Analytics } from "@vercel/analytics/react";');
    expect(layout).toContain("<Analytics />");
  });
});
