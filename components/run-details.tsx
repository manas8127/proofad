"use client";

import type { Run } from "@/lib/types";

const copy = {
  PASS: "All required checks passed.",
  FAIL: "At least one required check failed.",
  REVIEW: "A required check needs human review.",
  ERROR: "The evaluation could not finish.",
} as const;

export function Badge({ verdict }: { verdict: Run["verdict"] }) {
  return <span className={"badge " + verdict.toLowerCase()}>{verdict}</span>;
}

export function RunDetails({ run, onRetry }: { run: Run; onRetry?: (run: Run) => void }) {
  return <section className="result" aria-labelledby={"run-" + run.id}>
    <div className="result-head">
      <div>
        <p className="eyebrow">EVALUATION RESULT</p>
        <h2 id={"run-" + run.id}>{copy[run.verdict]}</h2>
        <p>{run.note}</p>
      </div>
      <Badge verdict={run.verdict} />
    </div>

    <div className="result-summary">
      <img className="creative" src={run.imageUrl} alt={"Creative evaluated in " + run.name} />
      <dl>
        <div><dt>Product</dt><dd>{run.brief.productName}</dd></div>
        <div><dt>Place and season</dt><dd>{run.brief.geography} · {run.brief.season}</dd></div>
        <div><dt>Required copy</dt><dd>{run.brief.requiredCopy}</dd></div>
        <div><dt>Run time</dt><dd>{(run.elapsedMs / 1000).toFixed(2)} seconds</dd></div>
      </dl>
    </div>

    <div className="check-list">
      {run.checks.map((check) => <article className={"check " + check.status} key={check.id}>
        <div><span>{check.category}</span><h3>{check.label}</h3></div>
        <p>{check.observation}</p>
        <details><summary>Evidence</summary><p>{check.evidence}</p></details>
      </article>)}
    </div>

    <div className="run-actions">
      <a href={"/api/runs/" + run.id + "/report"} download>Download report</a>
      {onRetry && <button onClick={() => onRetry(run)} className="secondary">Retry verification</button>}
    </div>
  </section>;
}
