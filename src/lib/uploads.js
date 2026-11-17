import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { MAX_UPLOAD_BYTES } from "./constants";

// Verify real file type from magic bytes, not the client-supplied MIME/extension.
function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

const FOLDERS = ["products", "categories", "banners", "reviews", "site"];

/** Saves an uploaded File to public/uploads/<folder>/ and returns the public path. */
export async function saveImage(file, folder) {
  if (!FOLDERS.includes(folder)) throw new Error("Invalid upload folder.");
  if (!file || typeof file === "string" || file.size === 0) throw new Error("No file provided.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("File is larger than 3 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) throw new Error("Only JPEG, PNG or WebP images are allowed.");
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`; // server-generated, never user input
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/${folder}/${name}`;
}

export async function deleteImage(publicPath) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", publicPath);
  const root = path.join(process.cwd(), "public", "uploads");
  if (!abs.startsWith(root + path.sep)) return; // path traversal guard
  await fs.unlink(abs).catch(() => {});
}
