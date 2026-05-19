import { NextRequest, NextResponse } from "next/server";
import { getAppConfig } from "@/lib/config";
import { getAuthenticatedUser, GitHubApiError } from "@/lib/github";
import { SESSION_COOKIE, unsealSession } from "@/lib/session";

export const dynamic = "force-dynamic";

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

  try {
    const user = await getAuthenticatedUser(session.accessToken);
    return NextResponse.json({ login: user.login, avatarUrl: user.avatar_url, profileUrl: user.html_url });
  } catch (error) {
    const status = error instanceof GitHubApiError && error.code === "unauthorized" ? 401 : 502;
    return NextResponse.json({ error: error instanceof Error ? error.message : "GitHub request failed" }, { status });
  }
}
