"use client";

import { useEffect, useState, type FormEvent } from "react";
import { RunDetails } from "@/components/run-details";
import type { Run } from "@/lib/types";

export default function AppPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selected, setSelected] = useState<Run | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/runs").then((response) => response.json()).then((data) => setRuns(data.runs ?? []));
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productName: form.get("productName"),
        geography: form.get("geography"),
        season: form.get("season"),
        requiredCopy: form.get("requiredCopy"),
        strategy: form.get("strategy"),
      }),
    });
    const data = await response.json();
    if (data.run) {
      setRuns((current) => [data.run, ...current.filter((run) => run.id !== data.run.id)]);
      setSelected(data.run);
    } else {
      setError(data.error ?? "We could not start the evaluation.");
    }
    setCreating(false);
  }

  async function retry(run: Run) {
    const response = await fetch("/api/runs/" + run.id + "/retry", { method: "POST" });
    const data = await response.json();
    if (data.run) {
      setRuns((current) => [data.run, ...current]);
      setSelected(data.run);
    } else {
      setError(data.error ?? "We could not repeat verification.");
    }
  }

  return <main className="shell">
    <header className="nav">
      <a href="/app" className="brand">Proof<span>Ad</span></a>
      <nav aria-label="Primary navigation"><a href="/evaluation">Evaluation data</a></nav>
    </header>

    <section className="intro">
      <p className="eyebrow">CREATIVE EVALUATION</p>
      <h1>Run one clear check.</h1>
      <p>Enter the campaign requirements. ProofAd preserves them, evaluates the creative record, and explains the result.</p>
    </section>

    <section className="evaluation-form" aria-labelledby="run-evaluation">
      <div>
        <h2 id="run-evaluation">Campaign brief</h2>
        <p className="muted">These requirements remain visible in the result. A repeated local brief reopens its existing run.</p>
      </div>
      <form onSubmit={create}>
        <label>Product name<input name="productName" required defaultValue="Northstar Sparkling Water" /></label>
        <div className="form-grid">
          <label>Geography<input name="geography" required defaultValue="Bengaluru, India" /></label>
          <label>Season<input name="season" required defaultValue="Monsoon" /></label>
        </div>
        <label>Required copy<input name="requiredCopy" required defaultValue="20% OFF THIS WEEKEND" /></label>
        <label className="strategy">Evaluation strategy<select name="strategy" defaultValue="structured"><option value="structured">Structured requirements</option><option value="baseline">Baseline requirements</option></select></label>
        <div className="form-footer"><button disabled={creating}>{creating ? "Running evaluation…" : "Run evaluation"}</button><span>Local deterministic mode</span></div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>
    </section>

    {selected ? <RunDetails run={selected} onRetry={retry} /> : <section className="empty-state"><h2>Your result will appear here.</h2><p>Start with the brief above. The result will show the verdict and the evidence behind it.</p></section>}

    <details className="run-history">
      <summary>Saved test runs ({runs.length})</summary>
      <div className="run-list">{runs.map((run) => <button className={selected?.id === run.id ? "selected" : ""} onClick={() => setSelected(run)} key={run.id}><span>{run.name}</span><b>{run.verdict}</b></button>)}</div>
    </details>
  </main>;
}
