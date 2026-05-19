# GitHub Star Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Next.js app where a GitHub user can sign in, review starred repositories, select unwanted repositories, and batch unstar them safely.

**Architecture:** Use Next.js App Router for UI and API routes. Keep GitHub API behavior in focused server modules, keep dashboard filtering and selection in pure client helpers, and store the GitHub OAuth token only inside an encrypted HTTP-only session cookie.

**Tech Stack:** Next.js, React, TypeScript, Vitest, Testing Library, iron-session-style encrypted cookies through `jose`, GitHub REST API.

---

## File Structure

- `package.json`: scripts and dependencies.
- `next.config.ts`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.
- `vitest.config.ts`: unit test configuration.
- `src/app/layout.tsx`: root layout.
- `src/app/page.tsx`: dashboard page.
- `src/app/globals.css`: application styling.
- `src/app/api/auth/login/route.ts`: GitHub OAuth login redirect.
- `src/app/api/auth/callback/github/route.ts`: OAuth callback and token exchange.
- `src/app/api/auth/logout/route.ts`: session clearing route.
- `src/app/api/me/route.ts`: current authenticated user endpoint.
- `src/app/api/stars/route.ts`: starred repository listing endpoint.
- `src/app/api/unstar/route.ts`: batch unstar endpoint.
- `src/lib/config.ts`: environment variable access.
- `src/lib/github.ts`: GitHub REST client and normalized errors.
- `src/lib/oauth.ts`: OAuth state and authorization URL helpers.
- `src/lib/session.ts`: encrypted session helpers.
- `src/lib/unstar.ts`: batch unstar aggregation.
- `src/lib/repositories.ts`: repository view model, filtering, sorting, and selection helpers.
- `src/components/Dashboard.tsx`: authenticated repository management UI.
- `src/components/SignIn.tsx`: signed-out state.
- `src/test/*.test.ts`: unit tests for server and UI helper behavior.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Write the failing smoke test**

Create `src/test/repositories.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { sortRepositories, type RepositoryView } from "../lib/repositories";

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
  ...overrides,
});

describe("sortRepositories", () => {
  it("sorts repositories by least recently pushed first", () => {
    const result = sortRepositories(
      [
        repo({ id: 1, fullName: "octo/newer", pushedAt: "2025-01-01T00:00:00Z" }),
        repo({ id: 2, fullName: "octo/older", pushedAt: "2020-01-01T00:00:00Z" }),
      ],
      "oldest-pushed",
    );

    expect(result.map((item) => item.fullName)).toEqual(["octo/older", "octo/newer"]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/test/repositories.test.ts`

Expected: command fails because the project and `src/lib/repositories.ts` do not exist yet.

- [ ] **Step 3: Create the minimal scaffold**

Create `package.json`:

```json
{
  "name": "github-star-manager",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "jose": "^5.6.3",
    "lucide-react": "^0.468.0",
    "next": "^14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.4.5"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.5",
    "@testing-library/react": "^15.0.7",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.3",
    "jsdom": "^24.1.0",
    "vitest": "^1.6.0"
  }
}
```

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Star Manager",
  description: "Review and batch unstar GitHub repositories safely.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/globals.css` with a dense operational interface theme.

- [ ] **Step 4: Add the repository helper implementation**

Create `src/lib/repositories.ts` with `RepositoryView`, `RepositorySort`, and `sortRepositories`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/test/repositories.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add package.json next.config.ts tsconfig.json vitest.config.ts src/app src/lib src/test
git commit -m "chore: scaffold next app"
```

## Task 2: Repository Filtering and Selection Helpers

**Files:**
- Modify: `src/lib/repositories.ts`
- Modify: `src/test/repositories.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests for `filterRepositories`, `getLanguages`, and `toggleVisibleSelection`:

```ts
import {
  filterRepositories,
  getLanguages,
  toggleVisibleSelection,
} from "../lib/repositories";

it("filters by search text, language, and archived state", () => {
  const repos = [
    repo({ id: 1, fullName: "octo/keeper", description: "Useful CLI", language: "Go", archived: false }),
    repo({ id: 2, fullName: "octo/old-ui", description: "Legacy UI", language: "TypeScript", archived: true }),
  ];

  expect(
    filterRepositories(repos, { query: "legacy", language: "TypeScript", archived: "archived" })
      .map((item) => item.fullName),
  ).toEqual(["octo/old-ui"]);
});

it("returns sorted non-empty languages", () => {
  expect(
    getLanguages([
      repo({ id: 1, language: "Go" }),
      repo({ id: 2, language: null }),
      repo({ id: 3, language: "TypeScript" }),
      repo({ id: 4, language: "Go" }),
    ]),
  ).toEqual(["Go", "TypeScript"]);
});

it("selects all visible repositories and then clears only visible repositories", () => {
  const selected = toggleVisibleSelection(new Set([99]), [repo({ id: 1 }), repo({ id: 2 })]);
  expect([...selected].sort()).toEqual([1, 2, 99]);

  const cleared = toggleVisibleSelection(selected, [repo({ id: 1 }), repo({ id: 2 })]);
  expect([...cleared]).toEqual([99]);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/test/repositories.test.ts`

Expected: FAIL with missing exported functions.

- [ ] **Step 3: Implement helpers**

Update `src/lib/repositories.ts` with:

- `filterRepositories(repos, filters)`
- `getLanguages(repos)`
- `toggleVisibleSelection(selectedIds, visibleRepos)`
- sort modes `newest-pushed`, `oldest-pushed`, `most-stars`, `name`

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- src/test/repositories.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/repositories.ts src/test/repositories.test.ts
git commit -m "feat: add repository list helpers"
```

## Task 3: GitHub API Client and Batch Unstar

**Files:**
- Create: `src/lib/github.ts`
- Create: `src/lib/unstar.ts`
- Create: `src/test/github.test.ts`
- Create: `src/test/unstar.test.ts`

- [ ] **Step 1: Write failing GitHub client tests**

Create `src/test/github.test.ts` to assert:

- `listStarredRepositories` calls `GET https://api.github.com/user/starred?per_page=100&page=2&sort=created&direction=desc`.
- `unstarRepository` calls `DELETE https://api.github.com/user/starred/octo/alpha`.
- Rate-limit `403` responses become `GitHubApiError` with code `rate_limited`.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/test/github.test.ts`

Expected: FAIL because `src/lib/github.ts` does not exist.

- [ ] **Step 3: Implement GitHub client**

Create `src/lib/github.ts` with:

- `GitHubRepositoryResponse`
- `GitHubUser`
- `GitHubApiError`
- `listStarredRepositories(token, page)`
- `unstarRepository(token, owner, repo)`
- `getAuthenticatedUser(token)`
- shared request wrapper using official GitHub REST API version header `X-GitHub-Api-Version: 2022-11-28`

- [ ] **Step 4: Run GitHub tests to verify pass**

Run: `npm test -- src/test/github.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing batch tests**

Create `src/test/unstar.test.ts` to assert batch unstar returns separate `succeeded` and `failed` arrays when one repository deletion fails.

- [ ] **Step 6: Run batch tests to verify failure**

Run: `npm test -- src/test/unstar.test.ts`

Expected: FAIL because `src/lib/unstar.ts` does not exist.

- [ ] **Step 7: Implement batch unstar**

Create `src/lib/unstar.ts` with:

- `UnstarTarget`
- `BatchUnstarResult`
- `batchUnstar(token, targets, unstar = unstarRepository)`

Process sequentially to avoid accidental API bursts.

- [ ] **Step 8: Run tests to verify pass**

Run: `npm test -- src/test/github.test.ts src/test/unstar.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```bash
git add src/lib/github.ts src/lib/unstar.ts src/test/github.test.ts src/test/unstar.test.ts
git commit -m "feat: add github star api client"
```

## Task 4: OAuth and Session

**Files:**
- Create: `src/lib/config.ts`
- Create: `src/lib/oauth.ts`
- Create: `src/lib/session.ts`
- Create: `src/test/oauth.test.ts`
- Create: `src/test/session.test.ts`

- [ ] **Step 1: Write failing OAuth tests**

Create `src/test/oauth.test.ts` asserting:

- `createOAuthState()` returns URL-safe random state values.
- `buildGitHubAuthorizationUrl()` includes `client_id`, `redirect_uri`, `state`, and `scope=public_repo`.

- [ ] **Step 2: Run OAuth tests to verify failure**

Run: `npm test -- src/test/oauth.test.ts`

Expected: FAIL because `src/lib/oauth.ts` does not exist.

- [ ] **Step 3: Implement config and OAuth helpers**

Create `src/lib/config.ts` with strict environment access and defaults for local app URL.

Create `src/lib/oauth.ts` with:

- `createOAuthState()`
- `buildGitHubAuthorizationUrl({ clientId, redirectUri, state, scope })`
- `exchangeCodeForToken({ code, clientId, clientSecret, redirectUri })`

- [ ] **Step 4: Run OAuth tests to verify pass**

Run: `npm test -- src/test/oauth.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing session tests**

Create `src/test/session.test.ts` asserting a payload encrypted with `sealSession` can be read by `unsealSession`, and tampered values return `null`.

- [ ] **Step 6: Run session tests to verify failure**

Run: `npm test -- src/test/session.test.ts`

Expected: FAIL because `src/lib/session.ts` does not exist.

- [ ] **Step 7: Implement session helpers**

Create `src/lib/session.ts` using `jose` encrypted JWT:

- `SessionData`
- `sealSession(data, secret)`
- `unsealSession(value, secret)`
- cookie constants for `github_star_manager_session` and `github_star_manager_oauth_state`

- [ ] **Step 8: Run tests to verify pass**

Run: `npm test -- src/test/oauth.test.ts src/test/session.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```bash
git add src/lib/config.ts src/lib/oauth.ts src/lib/session.ts src/test/oauth.test.ts src/test/session.test.ts
git commit -m "feat: add oauth session helpers"
```

## Task 5: API Routes

**Files:**
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/callback/github/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/me/route.ts`
- Create: `src/app/api/stars/route.ts`
- Create: `src/app/api/unstar/route.ts`

- [ ] **Step 1: Implement route behavior using tested helpers**

Routes:

- `GET /api/auth/login`: create state, store state cookie, redirect to GitHub authorization URL.
- `GET /api/auth/callback/github`: validate state cookie, exchange code, seal session cookie, redirect to `/`.
- `POST /api/auth/logout`: delete session cookie and return `{ ok: true }`.
- `GET /api/me`: return current GitHub user or `401`.
- `GET /api/stars?page=1`: return normalized starred repositories or `401`.
- `POST /api/unstar`: accept `{ repositories: [{ owner, repo, fullName }] }`, run `batchUnstar`, return result.

- [ ] **Step 2: Manual route verification**

Run: `npm run build`

Expected: all routes compile without TypeScript errors.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/app/api
git commit -m "feat: add github auth and star api routes"
```

## Task 6: Dashboard UI

**Files:**
- Create: `src/components/SignIn.tsx`
- Create: `src/components/Dashboard.tsx`
- Create: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Build signed-out state**

Create `SignIn.tsx` with a concise explanation and GitHub sign-in button linking to `/api/auth/login`.

- [ ] **Step 2: Build dashboard data loading**

Create `Dashboard.tsx` as a client component that:

- Fetches `/api/me`.
- Fetches `/api/stars?page=N` until a page returns fewer than 100 repositories.
- Shows loading, empty, and error states.

- [ ] **Step 3: Build repository controls**

Add search, language filter, archived filter, sort control, visible count, selected count, and select visible behavior using `src/lib/repositories.ts`.

- [ ] **Step 4: Build batch confirmation**

Add a confirmation dialog that lists the selected count and up to 8 selected repository names. The destructive button sends `POST /api/unstar`.

- [ ] **Step 5: Build result handling**

On success, remove succeeded repositories from local state and display success/failure details. Keep failed repositories selected so the user can retry.

- [ ] **Step 6: Wire root page**

Create `src/app/page.tsx` that renders `<Dashboard />`.

- [ ] **Step 7: Style the app**

Update `globals.css` with responsive dense table/list styling, button states, modal styling, filter toolbar, and repository metadata chips.

- [ ] **Step 8: Verify build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```bash
git add src/components src/app/page.tsx src/app/globals.css
git commit -m "feat: add star review dashboard"
```

## Task 7: Documentation and Final Verification

**Files:**
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Add environment example**

Create `.env.example`:

```bash
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SESSION_SECRET=replace-with-at-least-32-random-characters
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 2: Add README**

Create `README.md` explaining:

- GitHub OAuth app callback URL.
- Required environment variables.
- `npm install`, `npm run dev`, `npm test`, `npm run build`.
- Safety model: explicit selection and confirmation only.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: PASS for both commands.

- [ ] **Step 4: Start local server**

Run: `npm run dev`

Expected: app is available at `http://localhost:3000`.

- [ ] **Step 5: Commit**

Run:

```bash
git add .env.example README.md
git commit -m "docs: add setup instructions"
```

## Self-Review

- Spec coverage: OAuth sign-in, starred repository loading, filtering, selection, confirmation, batch unstar, error handling, testing, and setup docs are covered.
- Placeholder scan: no incomplete implementation placeholders are intended for workers; each task names exact files and verification commands.
- Type consistency: repository helper, GitHub client, session, OAuth, and route names are consistent across tasks.
