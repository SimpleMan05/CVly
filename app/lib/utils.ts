import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  // Determine the appropriate unit by calculating the log
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places and round
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

/**
 * AIResponse.message.content can be a plain string, or an array of content
 * blocks (e.g. a reasoning block followed by the actual answer). Always
 * grabbing index [0] breaks for models that lead with a non-text block, so
 * scan for the first block that actually has text.
 */
export function extractResponseText(content: string | any[]): string {
  if (typeof content === "string") return content;
  const block = content.find((b) => typeof b?.text === "string");
  return block?.text ?? "";
}

/**
 * Models are asked to return raw JSON only, but plenty still wrap it in
 * ```json fences, or add a stray sentence before/after despite instructions.
 * This strips fences and, failing that, extracts the outermost {...} span
 * before handing off to JSON.parse - fixes the common cases without
 * pretending to be a full JSON repair tool.
 */
export function extractJsonText(raw: string): string {
  let text = raw.trim();

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  return text;
}

export function parseFeedbackJson(raw: string): Feedback {
  return JSON.parse(extractJsonText(raw)) as Feedback;
}

/**
 * Error instances have .message, but Puter's own SDK frequently rejects with
 * a plain object shaped like { error, message, code } instead (see the
 * "subject_does_not_exist" 404 case, or driver-call 400s). A bare
 * `err instanceof Error` check misses all of those and falls back to a
 * generic message, throwing away the one detail that actually explains what
 * went wrong. This checks both shapes.
 */
export function getPuterErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return fallback;
}

