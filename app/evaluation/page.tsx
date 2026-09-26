"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Run } from "@/lib/types";

type Metrics = { fixtureRuns: number; annotations: number; automatedVerdicts: Record<string, number> };

export default function EvaluationPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [saved, setSaved] = useState(false);

  function refresh() {
    fetch("/api/runs").then((response) => response.json()).then((data) => setRuns(data.runs ?? []));
    fetch("/api/metrics").then((response) => response.json()).then(setMetrics);
  }

  useEffect(() => { refresh(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/annotations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        runId: form.get("runId"),
        annotator: form.get("annotator"),
        product: form.get("product"),
        context: form.get("context"),
        text: form.get("text"),
      }),
    });
    if (response.ok) {
      setSaved(true);
      refresh();
      event.currentTarget.reset();
    }
  }

  return <main className="shell">
    <header className="nav"><a href="/app" className="brand">Proof<span>Ad</span></a><nav aria-label="Primary navigation"><a href="/app">Run evaluation</a></nav></header>
    <section className="intro"><p className="eyebrow">HUMAN CALIBRATION</p><h1>Compare the evaluator with people.</h1><p>Record an independent label for a saved run. The form does not show the automated verdict while you decide.</p></section>
    <section className="evaluation-grid">
      <form onSubmit={submit} className="annotate">
        <h2>Record a label</h2>
        <label>Saved run<select name="runId" required>{runs.map((run) => <option value={run.id} key={run.id}>{run.name}</option>)}</select></label>
        <label>Your name or initials<input name="annotator" required /></label>
        {["product", "context", "text"].map((key) => <label key={key}>{key[0].toUpperCase() + key.slice(1)}<select name={key} defaultValue="uncertain"><option value="pass">Pass</option><option value="fail">Fail</option><option value="uncertain">Uncertain</option></select></label>)}
        <button>Save label</button>
        {saved && <p className="success">Saved. The summary has been updated.</p>}
      </form>
      <aside className="metrics">
        <h2>Current sample</h2>
        {metrics && <><p className="muted">{metrics.fixtureRuns} fixture runs · {metrics.annotations} human labels</p><div className="metric-row">{Object.entries(metrics.automatedVerdicts).map(([key, value]) => <span key={key}><b>{value}</b>{key}</span>)}</div></>}
      </aside>
    </section>
  </main>;
}
