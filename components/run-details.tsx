"use client";
import type { Run } from "@/lib/types";

const copy = { PASS: "Passed our checks.", FAIL: "We found an issue.", REVIEW: "Please review this detail.", ERROR: "We couldn't finish checking." } as const;
export function Badge({ verdict }: { verdict: Run["verdict"] }) { return <span className={`badge ${verdict.toLowerCase()}`}>{verdict}</span>; }
export function RunDetails({ run, compact = false }: { run: Run; compact?: boolean }) {
  return <section className="result" aria-labelledby={`run-${run.id}`}>
    <div className="result-head"><div><p className="eyebrow">{run.kind === "fixture" ? "SIMULATED / TEST FIXTURE" : "PRESENTATION RUN / LOCAL SIMULATION"}</p><h2 id={`run-${run.id}`}>{run.name}</h2><p>{copy[run.verdict]} {run.note}</p></div><Badge verdict={run.verdict} /></div>
    <div className="art-and-status"><img className="creative" src={run.imageUrl} alt={`Creative for ${run.name}`} /><div className="findings"><p><strong>Run ID</strong><br /><code>{run.id}</code></p><p><strong>Elapsed</strong><br />{(run.elapsedMs / 1000).toFixed(2)} seconds</p><p><strong>Image hash</strong><br /><code>{run.imageHash.slice(0, 18)}…</code></p></div></div>
    {!compact && <><div className="check-grid">{run.checks.map((check) => <article className={`check ${check.status}`} key={check.id}><span>{check.category}</span><h3>{check.label}</h3><p>{check.observation}</p><details><summary>Evidence</summary><p>{check.evidence}</p></details></article>)}</div><details className="prompt"><summary>Actual compiled prompt · {run.brief.strategy}</summary><pre>{run.prompt}</pre></details></>}
  </section>;
}
