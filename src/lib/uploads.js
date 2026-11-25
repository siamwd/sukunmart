import "server-only";
import crypto from "node:crypto";
import { del, put } from "@vercel/blob";
import { MAX_UPLOAD_BYTES } from "./constants";

// Verify real file type from magic bytes, not the client-supplied MIME/extension.
function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

const FOLDERS = ["products", "categories", "banners", "reviews", "site"];
const CONTENT_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Saves an uploaded image to Vercel Blob and returns its public URL. */
export async function saveImage(file, folder) {
  if (!FOLDERS.includes(folder)) throw new Error("Invalid upload folder.");
  if (!file || typeof file === "string" || file.size === 0) throw new Error("No file provided.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("File is larger than 3 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_UPLOAD_BYTES) throw new Error("File is larger than 3 MB.");
  const ext = sniff(buf);
  if (!ext) throw new Error("Only JPEG, PNG or WebP images are allowed.");
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const blob = await put(`${folder}/${name}`, buf, {
    access: "public",
    contentType: CONTENT_TYPES[ext],
  });
  return blob.url;
}

export async function deleteImage(imageUrl) {
  if (!imageUrl) return;
  let url;
  try { url = new URL(imageUrl); } catch { return; }
  const host = url.hostname;
  if (url.protocol !== "https:" || (host !== "public.blob.vercel-storage.com" && !host.endsWith(".public.blob.vercel-storage.com"))) return;
  await del(url.href);
}
