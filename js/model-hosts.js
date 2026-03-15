/**
 * js/model-hosts.js — Centralized model download host configuration.
 *
 * All local AI workers import this to know WHERE to fetch ONNX models from.
 * Models are hosted under the textagent HuggingFace organization.
 * If a textagent model is unavailable, workers fall back to the
 * original onnx-community namespace on HuggingFace.
 *
 * HuggingFace repo structure:
 *   textagent/Qwen3.5-0.8B-ONNX/resolve/main/config.json
 *   textagent/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model_q8.onnx
 *   ...
 */

// ── HuggingFace CDN ─────────────────────────────
export const MODEL_HOST = 'https://huggingface.co';

// ── Primary org: textagent ──────────────────────
export const MODEL_ORG = 'textagent';

// ── Fallback org: original onnx-community ───────
export const MODEL_ORG_FALLBACK = 'onnx-community';
