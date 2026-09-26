import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export type LocalOllamaEvidence = { provider: "ollama"; model: string; observedOffer: string; responseMs: number; raw: string };

/** Optional local-only evidence source. It never changes ProofAd's persisted official verdict. */
export class OllamaProvider {
  readonly model = "qwen3-vl:4b";
  private readonly endpoint = "http://127.0.0.1:11434/api/chat";
  async readOffer(imageUrl: string, requiredCopy: string): Promise<LocalOllamaEvidence> {
    if (!imageUrl.startsWith("/fixtures/")) throw new Error("Only bundled fixture assets may be sent to the local demo provider.");
    const imagePath = join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
    const png = await sharp(await readFile(imagePath)).resize(384, 384).png().toBuffer();
    const started = performance.now();
    const response = await fetch(this.endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      model: this.model, stream: false, think: false, keep_alive: "1m", options: { num_predict: 96, temperature: 0 },
      messages: [{ role: "user", content: `Read the large offer text in this advertisement. The required offer is ${requiredCopy}. Answer with the observed offer only.`, images: [png.toString("base64")] }],
    }) });
    if (!response.ok) throw new Error(`Local Ollama request failed: ${response.status}`);
    const data = await response.json() as { message?: { content?: string } };
    const observedOffer = data.message?.content?.trim();
    if (!observedOffer) throw new Error("Local Ollama returned no readable offer text.");
    return { provider: "ollama", model: this.model, observedOffer, responseMs: Math.round(performance.now() - started), raw: observedOffer };
  }
}
