import { createCustomFixtureRun, findRun, listRuns, metricSummary } from "./store.ts";
import { briefSchema, type Brief, type Run } from "./types.ts";

export type PipelineResult = {
  run: Run;
  verdict: Run["verdict"];
  summary: string;
};

function summarize(run: Run) {
  const checks = run.checks.reduce<Record<string, number>>((counts, check) => {
    counts[check.status] = (counts[check.status] ?? 0) + 1;
    return counts;
  }, {});
  return run.verdict + ": " + (checks.pass ?? 0) + " pass, " + (checks.fail ?? 0) + " fail, " + (checks.unknown ?? 0) + " unknown, " + (checks.error ?? 0) + " error.";
}

export function toPipelineResult(run: Run): PipelineResult {
  return { run, verdict: run.verdict, summary: summarize(run) };
}

/** Execute the same persisted inspection workflow used by the browser application. */
export function inspectCampaign(input: unknown): PipelineResult {
  const brief: Brief = briefSchema.parse(input);
  return toPipelineResult(createCustomFixtureRun(brief));
}

export function pipelineRuns() {
  return listRuns().map(toPipelineResult);
}

export function pipelineRun(id: string): PipelineResult {
  const run = findRun(id);
  if (!run) throw new Error("Run not found");
  return toPipelineResult(run);
}

export function pipelineMetrics() {
  return metricSummary();
}
