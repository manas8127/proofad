# Research basis

Research informs the questions ProofAd asks and the way it handles evidence. It does not grant an accuracy claim to this product. A paper can show that a method is useful on its own dataset while ProofAd still needs to measure its own evaluator, inputs, and users.

## The design argument

ProofAd makes four linked choices:

1. Turn a campaign brief into small, inspectable requirements instead of asking whether an image looks right.
2. Preserve logical dependencies: a product attribute is meaningless if the product itself is absent.
3. Keep automated observations separate from human labels and from the final policy.
4. Test known failure modes deliberately, not only average outcomes.

The sources below support one of those choices. None supports all four on its own.

| Source | Core idea | ProofAd adaptation | What it does not prove here |
| --- | --- | --- | --- |
| Don Norman, *The Design of Everyday Things* (2013) | People act more reliably when actions, system state, feedback, and recovery are understandable. | The workspace names every state, keeps the contract visible, exposes the reason for a verdict, and preserves a retry path. | Clear controls do not make visual evidence correct. |
| Don Norman, *Emotional Design* (2004) | A calm, coherent presentation can support attention and reflective judgment. | The interface gives the creative space to be inspected while keeping criteria and status readable. | A pleasant interface cannot make an invalid creative acceptable. |
| [TIFA — Hu et al., ICCV 2023](https://arxiv.org/abs/2303.11897) | Text-to-image faithfulness can be decomposed into questions with expected answers. | Product, context, text, and technical requirements become criterion-level checks with visible observations. | A question can be poorly formed and a visual answer can be wrong. TIFA does not establish exact reference-product identity. |
| [Davidsonian Scene Graph — Cho et al., ICLR 2024](https://arxiv.org/abs/2310.18235) | Fine-grained questions need atomicity, coverage, uniqueness, and dependencies. | ProofAd checks product presence before product fidelity, keeps criteria small, and avoids double-crediting the same fact. | The policy is a conservative business gate, not DSG’s aggregate score or a complete scene graph. |
| [Judging LLM-as-a-Judge — Zheng et al., NeurIPS 2023](https://arxiv.org/abs/2306.05685) | Model judges can be useful, but their agreement and biases must be measured against people. | Human annotation is blind to automated output and prompt strategy. The project plans false-approval, false-rejection, and review-coverage reporting. | The paper studies text-assistant evaluation, not this visual domain. Its reported agreement must not be reused as a ProofAd result. |
| [CheckList — Ribeiro et al., ACL 2020](https://arxiv.org/abs/2005.04118) | Aggregate accuracy can hide important behavioral failures; targeted tests reveal them. | The fixture library contains wrong-copy, wrong-product, wrong-context, uncertain-evidence, incomplete-check, oversized-output, and recovery cases. | Controlled fixtures show that the pipeline responds correctly to known cases; they do not measure generalization to live outputs. |

## How the pieces fit

~~~text
Campaign brief
  -> atomic requirements                 (TIFA)
  -> dependencies between requirements   (DSG)
  -> observations and conservative gate  (ProofAd policy)
  -> blinded human comparison            (LLM-as-a-Judge lesson)
  -> targeted failure tests               (CheckList)
~~~

The most important distinction is between an **observation** and a **decision**. OCR and visual models supply observations. The saved campaign contract says what must be true. The deterministic policy decides whether evidence supports PASS, FAIL, REVIEW, or ERROR. A human-label study then measures whether that procedure deserves trust.

## Evidence model

| Layer | Example | Role |
| --- | --- | --- |
| Requirement | Show the Northstar bottle and the exact text 20% OFF THIS WEEKEND. | Defines what the system must verify. |
| Artifact | The saved image bytes and immutable hash. | Defines the thing being evaluated. |
| Observation | OCR found a coherent text span; visual evidence found a bottle or did not. | Supplies fallible evidence. |
| Policy | Missing mandatory copy fails; uncertain copy requires review. | Makes the action deterministic and inspectable. |
| Human label | An independent annotator marks product, context, and text as pass, fail, or uncertain. | Measures automated behavior; it does not change history. |

This separation prevents a common error: treating a fluent explanation from a model as evidence that a requirement was actually met.

## Research-informed limits

The research points directly to the work that remains:

- Question quality, visual answer quality, OCR quality, and reference identity are separate error sources.
- An evaluator must be compared with independent labels before any reliability claim.
- The controlled test library is necessary but insufficient; held-out live outputs matter.
- An uncertain or incomplete result must stay visible as REVIEW or ERROR.

Each implementation limitation is tracked in [docs/limitations.md](limitations.md) and a corresponding GitHub issue.
