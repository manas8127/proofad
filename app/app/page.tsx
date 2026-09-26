"use client";
import { useEffect, useState, type FormEvent } from "react";
import { RunDetails } from "@/components/run-details";
import type { Run } from "@/lib/types";

export default function AppPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selected, setSelected] = useState<Run | null>(null);
  const [creating, setCreating] = useState(false);
  useEffect(() => { fetch("/api/runs").then((r) => r.json()).then((data) => { setRuns(data.runs); setSelected(data.runs.find((run: Run) => run.fixtureId === "wrong-discount") ?? data.runs[0]); }); }, []);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreating(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/runs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productName: form.get("productName"), geography: form.get("geography"), season: form.get("season"), requiredCopy: form.get("requiredCopy"), strategy: form.get("strategy") }) });
    const data = await response.json();
    if (data.run) { setRuns((current) => [data.run, ...current.filter((run) => run.id !== data.run.id)]); setSelected(data.run); }
    setCreating(false);
  }
  async function retry(run: Run) {
    const response = await fetch(`/api/runs/${run.id}/retry`, { method: "POST" }); const data = await response.json();
    if (data.run) { setRuns((current) => [data.run, ...current]); setSelected(data.run); }
  }
  return <main className="shell"><header className="nav"><a href="/demo" className="brand">Proof<span>Ad</span></a><nav><a href="/app">App</a><a href="/demo">Demo</a><a href="/evaluation">Evaluation</a></nav></header><section className="hero compact"><p className="eyebrow">PHASE A · EVALUATION WORKBENCH</p><h1>Creative evaluation you can explain.</h1><p>Freeze the campaign requirements, inspect evidence against each one, and see why the policy reached its decision.</p></section><section className="create"><form onSubmit={create}><h2>Create a local evaluation</h2><p className="muted">Phase A persists a clearly labelled simulation so the evaluation flow can be tested without provider calls.</p><label>Reference product name<input name="productName" required defaultValue="Northstar Sparkling Water" /></label><div className="form-grid"><label>Target geography<input name="geography" required defaultValue="Bengaluru, India" /></label><label>Season<input name="season" required defaultValue="Monsoon" /></label></div><label>Exact required copy<input name="requiredCopy" required defaultValue="20% OFF THIS WEEKEND" /></label><label>Prompt strategy<select name="strategy" defaultValue="structured"><option value="structured">Structured</option><option value="baseline">Concise baseline</option></select></label><button disabled={creating}>{creating ? "Creating local fixture…" : "Create fixture evaluation"}</button></form><aside className="contract"><h3>How we evaluate your brief</h3><p>We freeze your original geography, season, literal campaign copy, reference identity, and criterion IDs before evidence collection.</p><p>Submitting the same Phase A brief reopens its existing local run rather than creating a duplicate.</p></aside></section><section className="library"><h2>Saved test runs</h2><div className="run-list">{runs.map((run) => <button className={selected?.id === run.id ? "selected" : ""} onClick={() => setSelected(run)} key={run.id}><span>{run.name}</span><b>{run.verdict}</b></button>)}</div></section>{selected && <RunDetails run={selected} onRetry={retry} />}</main>;
}
