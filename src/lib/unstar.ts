import { unstarRepository } from "./github";

export type UnstarTarget = {
  owner: string;
  repo: string;
  fullName: string;
};

export type BatchUnstarResult = {
  succeeded: string[];
  failed: Array<{ fullName: string; message: string }>;
};

type UnstarFunction = (
  token: string,
  owner: string,
  repo: string
) => Promise<void>;

export async function batchUnstar(
  token: string,
  targets: UnstarTarget[],
  unstar: UnstarFunction = unstarRepository
): Promise<BatchUnstarResult> {
  const result: BatchUnstarResult = { succeeded: [], failed: [] };

  for (const target of targets) {
    try {
      await unstar(token, target.owner, target.repo);
      result.succeeded.push(target.fullName);
    } catch (error) {
      result.failed.push({
        fullName: target.fullName,
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return result;
}
