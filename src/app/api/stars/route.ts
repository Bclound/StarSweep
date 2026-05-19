import { NextRequest, NextResponse } from "next/server";
import { getAppConfig } from "@/lib/config";
import { GitHubApiError, listStarredRepositories } from "@/lib/github";
import type { RepositoryView } from "@/lib/repositories";
import { SESSION_COOKIE, unsealSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function normalizeRepository(repository: Awaited<ReturnType<typeof listStarredRepositories>>[number]): RepositoryView {
  return {
    id: repository.id,
    owner: repository.owner.login,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description,
    language: repository.language,
    stargazersCount: repository.stargazers_count,
    pushedAt: repository.pushed_at,
    archived: repository.archived,
    private: repository.private,
    url: repository.html_url
  };
}

export async function GET(request: NextRequest) {
  const rawSession = request.cookies.get(SESSION_COOKIE)?.value;

  if (!rawSession) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const config = getAppConfig();
  const session = await unsealSession(rawSession, config.sessionSecret);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const page = Math.max(1, Number(new URL(request.url).searchParams.get("page") ?? "1"));

  try {
    const repositories = await listStarredRepositories(session.accessToken, page);
    return NextResponse.json({ repositories: repositories.map(normalizeRepository) });
  } catch (error) {
    const status = error instanceof GitHubApiError && error.code === "unauthorized" ? 401 : 502;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GitHub request failed" },
      { status }
    );
  }
}
