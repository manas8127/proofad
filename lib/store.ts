import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { annotationSchema, briefSchema, runSchema, type Annotation, type Brief, type Run } from "./types.ts";
import { fixtureDefinitions, makeFixtureRun } from "./fixtures.ts";
import { createHash, randomUUID } from "node:crypto";
import { compilePrompt } from "./prompts.ts";

const dataDir = join(process.cwd(), "data");
let connection: DatabaseSync | undefined;
function database() {
  if (connection) return connection;
  mkdirSync(dataDir, { recursive: true });
  connection = new DatabaseSync(join(dataDir, "proofad.sqlite"));
  connection.exec("PRAGMA busy_timeout = 5000;");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, kind TEXT NOT NULL, fixture_id TEXT, idempotency_key TEXT, payload TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, run_id TEXT NOT NULL, stage TEXT NOT NULL, status TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS annotations (id INTEGER PRIMARY KEY, run_id TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE UNIQUE INDEX IF NOT EXISTS runs_fixture_once ON runs(fixture_id) WHERE kind = 'fixture';
  `);
  try { connection.exec("ALTER TABLE runs ADD COLUMN idempotency_key TEXT"); } catch { /* existing Phase A database */ }
  connection.exec("CREATE UNIQUE INDEX IF NOT EXISTS runs_idempotency_once ON runs(idempotency_key) WHERE idempotency_key IS NOT NULL;");
  return connection;
}

function record(run: Run, stage: string, status: string, detail: string) {
  database().prepare("INSERT INTO events (run_id, stage, status, detail, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(run.id, stage, status, detail, new Date().toISOString());
}
export function ensureFixtures() {
  const insert = database().prepare("INSERT OR IGNORE INTO runs (id, kind, fixture_id, payload, created_at) VALUES (?, ?, ?, ?, ?)");
  for (const definition of fixtureDefinitions) {
    const run = makeFixtureRun(definition);
    const result = insert.run(run.id, run.kind, definition.id, JSON.stringify(run), run.createdAt);
    if (result.changes) record(run, "ChecksCompleted", run.status, "Fixture seeded locally; no provider call was made.");
  }
}
export function listRuns(): Run[] {
  ensureFixtures();
  const rows = database().prepare("SELECT payload FROM runs ORDER BY created_at DESC").all() as { payload: string }[];
  return rows.map((row) => runSchema.parse(JSON.parse(row.payload)));
}
export function findRun(id: string): Run | null {
  const row = database().prepare("SELECT payload FROM runs WHERE id = ?").get(id) as { payload: string } | undefined;
  return row ? runSchema.parse(JSON.parse(row.payload)) : null;
}
export function createPresentationRun(): Run {
  const run = makeFixtureRun(fixtureDefinitions.find((f) => f.id === "wrong-discount")!, true);
  database().prepare("INSERT INTO runs (id, kind, fixture_id, payload, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(run.id, run.kind, run.fixtureId, JSON.stringify(run), run.createdAt);
  record(run, "Submitted", "started", "Presentation run started in local fixture mode.");
  record(run, "Completed", "completed", "Structured fixture inspection completed; no provider call was made.");
  return run;
}
export function createCustomFixtureRun(input: Brief): Run {
  const brief = briefSchema.parse(input);
  const key = createHash("sha256").update(JSON.stringify(brief)).digest("hex");
  const existing = database().prepare("SELECT payload FROM runs WHERE idempotency_key = ?").get(key) as { payload: string } | undefined;
  if (existing) return runSchema.parse(JSON.parse(existing.payload));
  const seed = makeFixtureRun(fixtureDefinitions[0]);
  const run: Run = { ...seed, id: `custom-${randomUUID()}`, fixtureId: null, name: "Custom fixture inspection", createdAt: new Date().toISOString(), brief, prompt: compilePrompt(brief), imageHash: createHash("sha256").update(`custom:${key}`).digest("hex"), note: "Local simulation created from your brief. No image model call was made." };
  database().prepare("INSERT INTO runs (id, kind, fixture_id, idempotency_key, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(run.id, run.kind, run.fixtureId, key, JSON.stringify(run), run.createdAt);
  record(run, "Submitted", "completed", "Custom fixture run created locally with idempotency protection.");
  return run;
}
export function retryVerification(id: string): Run {
  const source = findRun(id);
  if (!source) throw new Error("Run not found");
  const run: Run = { ...source, id: `recheck-${randomUUID()}`, kind: "presentation", name: `${source.name} — verification retry`, createdAt: new Date().toISOString(), elapsedMs: 260, note: "Re-verification created a new evidence record for the saved artifact. No new generation was issued." };
  database().prepare("INSERT INTO runs (id, kind, fixture_id, payload, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(run.id, run.kind, run.fixtureId, JSON.stringify(run), run.createdAt);
  record(run, "ChecksCompleted", "completed", "Explicit verification retry completed on saved artifact.");
  return run;
}
export function saveAnnotation(value: Annotation) {
  const annotation = annotationSchema.parse(value);
  if (!findRun(annotation.runId)) throw new Error("Run not found");
  database().prepare("INSERT INTO annotations (run_id, payload, created_at) VALUES (?, ?, ?)")
    .run(annotation.runId, JSON.stringify(annotation), new Date().toISOString());
}
export function metricSummary() {
  const runs = listRuns().filter((run) => run.kind === "fixture");
  const annotations = database().prepare("SELECT payload FROM annotations").all() as { payload: string }[];
  return { fixtureRuns: runs.length, annotations: annotations.length, automatedVerdicts: Object.fromEntries(["PASS", "FAIL", "REVIEW", "ERROR"].map((verdict) => [verdict, runs.filter((r) => r.verdict === verdict).length])) };
}
