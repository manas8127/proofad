"use client";
import { useState } from "react";
import type { Run } from "@/lib/types";

const copy = { PASS: "Passed our checks.", FAIL: "We found an issue.", REVIEW: "Please review this detail.", ERROR: "We couldn't finish checking." } as const;
export function Badge({ verdict }: { verdict: Run["verdict"] }) { return <span className={`badge ${verdict.toLowerCase()}`}>{verdict}</span>; }
export function RunDetails({ run, compact = false, onRetry }: { run: Run; compact?: boolean; onRetry?: (run: Run) => void }) {
  const [ollama, setOllama] = useState<{ observedOffer: string; responseMs: number; model: string } | null>(null);
  const [ollamaError, setOllamaError] = useState("");
  const [checking, setChecking] = useState(false);
  async function runOllamaCheck() {
    setChecking(true); setOllamaError("");
    const response = await fetch("/api/ollama/inspect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ runId: run.id }) });
    const data = await response.json();
    if (data.evidence) setOllama(data.evidence); else setOllamaError(data.error ?? "Local Ollama inspection failed.");
    setChecking(false);
  }
  return <section className="result" aria-labelledby={`run-${run.id}`}>
    <div className="result-head"><div><p className="eyebrow">{run.kind === "fixture" ? "SIMULATED / TEST FIXTURE" : "PRESENTATION RUN / LOCAL SIMULATION"}</p><h2 id={`run-${run.id}`}>{run.name}</h2><p>{copy[run.verdict]} {run.note}</p></div><Badge verdict={run.verdict} /></div>
    <div className="art-and-status"><img className="creative" src={run.imageUrl} alt={`Creative for ${run.name}`} /><div className="findings"><p><strong>Run ID</strong><br /><code>{run.id}</code></p><p><strong>Elapsed</strong><br />{(run.elapsedMs / 1000).toFixed(2)} seconds</p><p><strong>Image hash</strong><br /><code>{run.imageHash.slice(0, 18)}…</code></p></div></div>
    {!compact && <><div className="run-actions"><a href={run.imageUrl} download>Download image</a><a href={`/api/runs/${run.id}/report`} download>Download report</a>{onRetry && <button onClick={() => onRetry(run)} className="secondary">Retry verification</button>}<button onClick={runOllamaCheck} disabled={checking} className="secondary">{checking ? "Checking locally…" : "Run local Ollama text check"}</button></div>{ollama && <aside className="local-evidence"><strong>LOCAL OLLAMA TEST / DEMO EVIDENCE</strong><br />{ollama.model} observed: <q>{ollama.observedOffer}</q> in {(ollama.responseMs / 1000).toFixed(1)}s. This does not alter the official verdict.</aside>}{ollamaError && <p className="error-message">{ollamaError}</p>}<div className="check-grid">{run.checks.map((check) => <article className={`check ${check.status}`} key={check.id}><span>{check.category}</span><h3>{check.label}</h3><p>{check.observation}</p><details><summary>Evidence</summary><p>{check.evidence}</p></details></article>)}</div><details className="prompt"><summary>Actual compiled prompt · {run.brief.strategy}</summary><pre>{run.prompt}</pre></details></>}
  </section>;
}
