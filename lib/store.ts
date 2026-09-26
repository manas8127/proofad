import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { annotationSchema, runSchema, type Annotation, type Run } from "./types";
import { fixtureDefinitions, makeFixtureRun } from "./fixtures";

const dataDir = join(process.cwd(), "data");
let connection: DatabaseSync | undefined;
function database() {
  if (connection) return connection;
  mkdirSync(dataDir, { recursive: true });
  connection = new DatabaseSync(join(dataDir, "proofad.sqlite"));
  connection.exec("PRAGMA busy_timeout = 5000;");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, kind TEXT NOT NULL, fixture_id TEXT, payload TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, run_id TEXT NOT NULL, stage TEXT NOT NULL, status TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS annotations (id INTEGER PRIMARY KEY, run_id TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE UNIQUE INDEX IF NOT EXISTS runs_fixture_once ON runs(fixture_id) WHERE kind = 'fixture';
  `);
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
