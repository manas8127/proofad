import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { applyDependencies, decide } from "./policy.ts";
import { compilePrompt } from "./prompts.ts";
import { saveLiveRun } from "./store.ts";
import type { Brief, Check, Run } from "./types.ts";

const MAX_BYTES = 10 * 1024 * 1024;
const artifactDir = join(process.cwd(), "data", "artifacts");
const allowedMime = new Set(["image/png", "image/jpeg", "image/webp"]);

export type ReferenceImage = { bytes: Buffer; mimeType: string; originalName: string };
export type VisualFinding = { status: "pass" | "fail" | "unknown"; observation: string; evidence: string };
export type VisualEvidence = { productPresence: VisualFinding; productFidelity: VisualFinding; context: VisualFinding };

export async function validateReferenceImage(value: File): Promise<ReferenceImage> {
  if (!allowedMime.has(value.type)) throw new Error("Reference image must be PNG, JPEG, or WebP.");
  if (value.size === 0 || value.size > MAX_BYTES) throw new Error("Reference image must be between 1 byte and 10 MB.");
  const bytes = Buffer.from(await value.arrayBuffer());
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Reference image could not be decoded.");
  return { bytes, mimeType: value.type, originalName: value.name || "reference-image" };
}

function requireLiveApproval() {
  if (process.env.PROOFAD_LIVE_APPROVED !== "true") throw new Error("Live generation is disabled. Set PROOFAD_LIVE_APPROVED=true only after approving the run budget.");
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured on the server.");
  return key;
}

function partData(part: Record<string, unknown>) {
  const inline = (part.inlineData ?? part.inline_data) as { data?: string; mimeType?: string; mime_type?: string } | undefined;
  if (!inline?.data) return null;
  return { bytes: Buffer.from(inline.data, "base64"), mimeType: inline.mimeType ?? inline.mime_type ?? "image/png" };
}

async function geminiRequest(model: string, body: unknown) {
  const apiKey = requireLiveApproval();
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify(body),
  });
  const payload = await response.json() as { error?: { message?: string }; candidates?: Array<{ content?: { parts?: Array<Record<string, unknown>> } }> };
  if (!response.ok) throw new Error(`Gemini ${model} failed: ${payload.error?.message ?? response.statusText}`);
  return payload;
}

export async function generateWithGemini(brief: Brief, reference: ReferenceImage) {
  const payload = await geminiRequest("gemini-3.1-flash-image", {
    contents: [{ parts: [
      { text: compilePrompt(brief) },
      { inline_data: { mime_type: reference.mimeType, data: reference.bytes.toString("base64") } },
    ] }],
    generationConfig: { responseModalities: ["IMAGE"], responseFormat: { image: { aspectRatio: "1:1", imageSize: "1K" } } },
  });
  const parts = payload.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];
  const image = parts.map(partData).find((part) => part !== null);
  if (!image) throw new Error("Gemini returned no image artifact.");
  const metadata = await sharp(image.bytes).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Generated image could not be decoded.");
  if (Math.max(metadata.width, metadata.height) > 1024) throw new Error(`Generated image exceeds the 1K limit (${metadata.width} × ${metadata.height}).`);
  return { ...image, width: metadata.width, height: metadata.height, model: "gemini-3.1-flash-image" };
}

function normalize(text: string) { return text.toUpperCase().replace(/\s+/g, " ").trim(); }
export function requiredCopyFinding(expected: string, observed: string, confidence: number): Check {
  const matched = normalize(observed).includes(normalize(expected));
  if (confidence < 45) return { id: "required-copy", category: "text", status: "unknown", label: "Exact copy", observation: "OCR confidence is too low for approval.", evidence: `OCR confidence: ${confidence.toFixed(1)}%; observed: ${observed || "none"}.` };
  return { id: "required-copy", category: "text", status: matched ? "pass" : "fail", label: "Exact copy", observation: matched ? "Required copy matched OCR output." : "Required copy was not found in OCR output.", evidence: `Expected: ${expected}; observed: ${observed || "none"}; confidence: ${confidence.toFixed(1)}%.` };
}

export function checksFromEvidence(brief: Brief, visual: VisualEvidence, observedText: string, confidence: number, dimensions: { width: number; height: number }): Check[] {
  const check = (id: string, category: Check["category"], label: string, finding: VisualFinding): Check => ({ id, category, label, ...finding });
  const checks: Check[] = [
    check("product-presence", "product", "Product", visual.productPresence),
    check("product-fidelity", "product", "Product fidelity", visual.productFidelity),
    check("context", "context", "Context", visual.context),
    requiredCopyFinding(brief.requiredCopy, observedText, confidence),
    { id: "image-validity", category: "technical", status: Math.max(dimensions.width, dimensions.height) <= 1024 ? "pass" : "fail", label: "Image validity", observation: `Image decoded at ${dimensions.width} × ${dimensions.height} pixels.`, evidence: "Longest edge must not exceed 1024 pixels." },
  ];
  return applyDependencies(checks);
}

async function recognizeImage(bytes: Buffer) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const result = await worker.recognize(bytes as never);
    return { text: result.data.text.trim(), confidence: result.data.confidence };
  } finally { await worker.terminate(); }
}

async function evaluateVisual(brief: Brief, reference: ReferenceImage, image: { bytes: Buffer; mimeType: string }): Promise<VisualEvidence> {
  const instruction = [
    "Evaluate the generated display ad against its reference product and campaign contract.",
    `Product: ${brief.productName}. Geography: ${brief.geography}. Season: ${brief.season}.`,
    "Return JSON only with productPresence, productFidelity, and context. Each needs status (pass, fail, or unknown), observation, and evidence. Use unknown when the image does not support a reliable judgement.",
  ].join(" ");
  const payload = await geminiRequest("gemini-3.1-flash-lite", { contents: [{ parts: [
    { text: instruction },
    { inline_data: { mime_type: reference.mimeType, data: reference.bytes.toString("base64") } },
    { inline_data: { mime_type: image.mimeType, data: image.bytes.toString("base64") } },
  ] }], generationConfig: { responseMimeType: "application/json" } });
  const text = payload.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).map((part) => typeof part.text === "string" ? part.text : "").join("\n") ?? "";
  try {
    const parsed = JSON.parse(text) as VisualEvidence;
    for (const key of ["productPresence", "productFidelity", "context"] as const) {
      const finding = parsed[key];
      if (!finding || !["pass", "fail", "unknown"].includes(finding.status) || !finding.observation || !finding.evidence) throw new Error("Invalid visual evidence");
    }
    return parsed;
  } catch { throw new Error("Visual evaluator returned invalid structured evidence."); }
}

export async function executeLiveInspection(brief: Brief, reference: ReferenceImage): Promise<Run> {
  const started = performance.now();
  const generated = await generateWithGemini(brief, reference);
  const [ocr, visual] = await Promise.all([recognizeImage(generated.bytes), evaluateVisual(brief, reference, generated)]);
  const checks = checksFromEvidence(brief, visual, ocr.text, ocr.confidence, generated);
  const id = `live-${randomUUID()}`;
  await mkdir(artifactDir, { recursive: true });
  await writeFile(join(artifactDir, `${id}.png`), generated.bytes);
  const run: Run = {
    id, kind: "live", fixtureId: null, name: "Live image inspection", status: "completed", verdict: decide(checks),
    createdAt: new Date().toISOString(), elapsedMs: Math.round(performance.now() - started), imageUrl: `/api/artifacts/${id}`,
    imageHash: createHash("sha256").update(generated.bytes).digest("hex"), referenceImageHash: createHash("sha256").update(reference.bytes).digest("hex"),
    provider: generated.model, evaluatorModel: "gemini-3.1-flash-lite", brief, prompt: compilePrompt(brief), checks,
    note: "Live 1K image generated from the supplied reference image and evaluated with independent OCR plus structured visual evidence.",
  };
  return saveLiveRun(run);
}

export async function readArtifact(id: string) {
  const { readFile } = await import("node:fs/promises");
  return readFile(join(artifactDir, `${id}.png`));
}
