/** Local OCR boundary. Phase A fixtures retain raw OCR evidence; live image recognition is never sent remotely. */
export async function recognizeLocalImage(image: File) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    // Tesseract's browser runtime accepts a File, while its published type omits it.
    const result = await worker.recognize(image as never);
    return { text: result.data.text, confidence: result.data.confidence, blocks: result.data.blocks };
  } finally {
    await worker.terminate();
  }
}
