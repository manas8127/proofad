"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { RunDetails } from "@/components/run-details";
import type { Run } from "@/lib/types";

export default function AppPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selected, setSelected] = useState<Run | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("/api/runs").then((response) => response.json()).then((data) => setRuns(data.runs ?? []));
  }, []);

  async function run(formElement: HTMLFormElement, mode: "local" | "live") {
    if (mode === "live" && !referenceImage) { setError("Choose a PNG, JPEG, or WebP reference image before starting live generation."); return; }
    setCreating(true);
    setError("");
    const form = new FormData(formElement);
    const response = await fetch(mode === "live" ? "/api/live/inspect" : "/api/runs", {
      method: "POST",
      headers: mode === "local" ? { "content-type": "application/json" } : undefined,
      body: mode === "local" ? JSON.stringify({ productName: form.get("productName"), geography: form.get("geography"), season: form.get("season"), requiredCopy: form.get("requiredCopy"), strategy: form.get("strategy") }) : form,
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

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(event.currentTarget, "local");
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
      <form ref={formRef} onSubmit={create}>
        <label>Product name<input name="productName" required defaultValue="Northstar Sparkling Water" /></label>
        <div className="form-grid">
          <label>Geography<input name="geography" required defaultValue="Bengaluru, India" /></label>
          <label>Season<input name="season" required defaultValue="Monsoon" /></label>
        </div>
        <label>Required copy<input name="requiredCopy" required defaultValue="20% OFF THIS WEEKEND" /></label>
        <label className="strategy">Evaluation strategy<select name="strategy" defaultValue="structured"><option value="structured">Structured requirements</option><option value="baseline">Baseline requirements</option></select></label>
        <label>Reference product image <input name="referenceImage" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setReferenceImage(event.target.files?.[0] ?? null)} /></label>
        <div className="form-footer">
          <button disabled={creating}>{creating ? "Running evaluation…" : "Run local evaluation"}</button>
          <button type="button" className="secondary" disabled={creating} onClick={() => {
            if (!formRef.current) return;
            void run(formRef.current, "live");
          }}>Generate & evaluate image</button>
        </div>
        <p className="field-hint">Local mode uses deterministic fixtures. Live mode sends this reference image to the configured server-side provider and requires an approved local budget.</p>
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
