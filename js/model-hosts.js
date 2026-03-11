/**
 * js/model-hosts.js — Centralized model download host configuration.
 *
 * All local AI workers import this to know WHERE to fetch ONNX models from.
 * By default, models are served from a self-hosted GitLab mirror that
 * replicates the HuggingFace directory layout.  If the GitLab mirror is
 * not yet populated, workers can fall back to HuggingFace.
 *
 * GitLab repo structure (mirrors HuggingFace):
 *   onnx-community/Qwen3.5-0.8B-ONNX/resolve/main/config.json
 *   onnx-community/Kokoro-82M-v1.1-zh-ONNX/resolve/main/onnx/model_q8.onnx
 *   ...
 */

// ── Primary: self-hosted GitLab mirror ──────────────────
export const MODEL_HOST = 'https://gitlab.com/textagent/models/-/raw/main';

// ── Fallback: original HuggingFace (until GitLab is populated) ──
export const MODEL_HOST_FALLBACK = 'https://huggingface.co';
