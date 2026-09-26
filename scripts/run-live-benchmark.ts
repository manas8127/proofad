import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { executeLiveInspection, type ReferenceImage } from "../lib/live.ts";
import type { Brief } from "../lib/types.ts";

function mimeType(path: string) {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  throw new Error(`Unsupported reference image extension: ${extension}`);
}
async function reference(path: string): Promise<ReferenceImage> {
  return { bytes: await readFile(path), mimeType: mimeType(path), originalName: basename(path) };
}

const args = process.argv.slice(2);
const productA = args[args.indexOf("--product-a") + 1];
const productB = args[args.indexOf("--product-b") + 1];
const productAName = args[args.indexOf("--product-a-name") + 1];
const productBName = args[args.indexOf("--product-b-name") + 1];
if (!productA || !productB || productA.startsWith("--") || productB.startsWith("--")) {
  throw new Error("Usage: npm run benchmark:live -- --product-a path/to/product-a.png --product-b path/to/product-b.png");
}
if (process.env.PROOFAD_LIVE_APPROVED !== "true") throw new Error("Set PROOFAD_LIVE_APPROVED=true only after approving the 20-generation budget.");

const campaigns = [
  { geography: "Bengaluru, India", season: "Monsoon", requiredCopy: "SAVE 20% THIS WEEKEND" },
  { geography: "Mumbai, India", season: "Summer", requiredCopy: "NEW SEASON OFFER" },
  { geography: "Delhi, India", season: "Winter", requiredCopy: "LIMITED TIME 15% OFF" },
  { geography: "Chennai, India", season: "Festival season", requiredCopy: "CELEBRATE WITH 10% OFF" },
  { geography: "Pune, India", season: "Spring", requiredCopy: "TRY IT TODAY" },
];
const products = [
  { name: productAName && !productAName.startsWith("--") ? productAName : basename(productA, extname(productA)), image: await reference(productA) },
  { name: productBName && !productBName.startsWith("--") ? productBName : basename(productB, extname(productB)), image: await reference(productB) },
];

const jobs: Array<{ brief: Brief; image: ReferenceImage }> = [];
for (const product of products) for (const campaign of campaigns) for (const strategy of ["baseline", "structured"] as const) {
  jobs.push({ brief: { ...campaign, productName: product.name, strategy }, image: product.image });
}
if (jobs.length !== 20) throw new Error("Benchmark manifest must contain exactly 20 jobs.");

for (const [index, job] of jobs.entries()) {
  const run = await executeLiveInspection(job.brief, job.image);
  console.log(`${index + 1}/20 ${run.id} ${run.verdict} ${run.elapsedMs}ms`);
}
