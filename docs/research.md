# Research basis

| Source | Decision | Limitation |
| --- | --- | --- |
| Don Norman, *The Design of Everyday Things* (2013) | Surface user actions, state, evidence, and recovery with clear labels. | This informs interaction design; it does not validate evaluator accuracy. |
| Don Norman, *Emotional Design* (2004) | Calm visual treatment supports behavioral success and reflective understanding. | Visual polish cannot substitute for evidence. |
| [TIFA (ICCV 2023)](https://arxiv.org/abs/2303.11897) | Split visual faithfulness into specific questions. | ProofAd does not reproduce TIFA's benchmark. |
| [Davidsonian Scene Graph (ICLR 2024)](https://arxiv.org/abs/2310.18235) | Enforce dependency-aware atomic checks. | The app uses a small domain contract, not a scene-graph benchmark. |
| [Judging LLM-as-a-Judge (NeurIPS 2023)](https://arxiv.org/abs/2306.05685) | Separate model verdicts from blind human labels. | Its task differs from creative inspection. |
| [CheckList (ACL 2020)](https://arxiv.org/abs/2005.04118) | Use controlled behavioral failures, not just aggregate scores. | Local fixtures verify integration, not live model quality. |

Ground truth comes from the original brief, reference image, and independently recorded human labels. OCR and visual-judge outputs are evidence, not ground truth.
