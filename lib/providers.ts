import type { Brief } from "./types";
import { compilePrompt } from "./prompts";

export class GeminiProvider {
  readonly generatorModel = "gemini-3.1-flash-image";
  readonly judgeModel = "gemini-3.1-flash-lite";
  async create(_brief: Brief): Promise<never> {
    throw new Error("Gemini is locked in Phase A. Configure server-side credentials and explicitly approve capped live requests before activation.");
  }
  dryRun(brief: Brief) {
    return { generatorModel: this.generatorModel, judgeModel: this.judgeModel, prompt: compilePrompt(brief), calls: { generation: 1, visualEvaluation: 1, ocr: 0 } };
  }
}
