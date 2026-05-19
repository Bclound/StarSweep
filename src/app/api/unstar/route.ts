import { NextRequest, NextResponse } from "next/server";
import { getAppConfig } from "@/lib/config";
import { batchUnstar, type UnstarTarget } from "@/lib/unstar";
import { SESSION_COOKIE, unsealSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function parseTargets(value: unknown): UnstarTarget[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as UnstarTarget).owner === "string" &&
      typeof (item as UnstarTarget).repo === "string" &&
      typeof (item as UnstarTarget).fullName === "string"
    ) {
      return [item as UnstarTarget];
    }

    return [];
  });
}

export async function POST(request: NextRequest) {
  const rawSession = request.cookies.get(SESSION_COOKIE)?.value;

  if (!rawSession) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const config = getAppConfig();
  const session = await unsealSession(rawSession, config.sessionSecret);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { repositories?: unknown } | null;
  const repositories = parseTargets(payload?.repositories);

  if (repositories.length === 0) {
    return NextResponse.json({ error: "No repositories selected" }, { status: 400 });
  }

  return NextResponse.json(await batchUnstar(session.accessToken, repositories));
}
