#!/usr/bin/env bash
# ============================================================
# scripts/mirror-models.sh
# Downloads ONNX model files from HuggingFace (textagent org)
# and organises them into a local directory structure compatible
# with the Transformers.js URL pattern.
#
# Usage:
#   chmod +x scripts/mirror-models.sh
#   ./scripts/mirror-models.sh [output_dir]
#
# The output directory (default: ./models-mirror) contains the
# full model tree ready for self-hosted deployment.
# ============================================================
set -euo pipefail

OUT_DIR="${1:-./models-mirror}"
HF_BASE="https://huggingface.co"

# ── Colours ──────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ── Helper: download a single file ──────────────
dl() {
    local model_id="$1"
    local file_path="$2"
    local dest_dir="${OUT_DIR}/${model_id}/resolve/main"
    local dest_file="${dest_dir}/${file_path}"

    mkdir -p "$(dirname "$dest_file")"

    if [ -f "$dest_file" ]; then
        echo -e "  ${GREEN}✓${NC} Already exists: ${file_path}"
        return
    fi

    local url="${HF_BASE}/${model_id}/resolve/main/${file_path}"
    echo -e "  ${BLUE}↓${NC} Downloading: ${file_path}"
    curl -L --progress-bar -o "$dest_file" "$url"
}

# ── Qwen 3.5 0.8B (q4 + fp16 vision) ────────────
echo -e "\n${GREEN}═══ Qwen 3.5 0.8B ONNX ═══${NC}"
MODEL="textagent/Qwen3.5-0.8B-ONNX"
for f in config.json generation_config.json preprocessor_config.json processor_config.json tokenizer.json tokenizer_config.json chat_template.jinja; do
    dl "$MODEL" "$f"
done
for f in onnx/decoder_model_merged_q4.onnx onnx/decoder_model_merged_q4.onnx_data \
         onnx/embed_tokens_q4.onnx onnx/embed_tokens_q4.onnx_data \
         onnx/vision_encoder_fp16.onnx onnx/vision_encoder_fp16.onnx_data; do
    dl "$MODEL" "$f"
done

# ── Qwen 3.5 2B (q4 + fp16 vision) ──────────────
echo -e "\n${GREEN}═══ Qwen 3.5 2B ONNX ═══${NC}"
MODEL="textagent/Qwen3.5-2B-ONNX"
for f in config.json generation_config.json preprocessor_config.json processor_config.json tokenizer.json tokenizer_config.json chat_template.jinja; do
    dl "$MODEL" "$f"
done
for f in onnx/decoder_model_merged_q4.onnx onnx/decoder_model_merged_q4.onnx_data \
         onnx/embed_tokens_q4.onnx onnx/embed_tokens_q4.onnx_data \
         onnx/vision_encoder_fp16.onnx onnx/vision_encoder_fp16.onnx_data; do
    dl "$MODEL" "$f"
done

# ── Qwen 3.5 4B (q4 + fp16 vision) ──────────────
echo -e "\n${GREEN}═══ Qwen 3.5 4B ONNX ═══${NC}"
MODEL="textagent/Qwen3.5-4B-ONNX"
for f in config.json generation_config.json preprocessor_config.json processor_config.json tokenizer.json tokenizer_config.json chat_template.jinja; do
    dl "$MODEL" "$f"
done
for f in onnx/decoder_model_merged_q4.onnx onnx/decoder_model_merged_q4.onnx_data \
         onnx/embed_tokens_q4.onnx onnx/embed_tokens_q4.onnx_data \
         onnx/vision_encoder_fp16.onnx onnx/vision_encoder_fp16.onnx_data; do
    dl "$MODEL" "$f"
done

# ── Qwen 3 4B Thinking (q4f16) ──────────────────
echo -e "\n${GREEN}═══ Qwen 3 4B Thinking ONNX ═══${NC}"
MODEL="textagent/Qwen3-4B-Thinking-2507-ONNX"
for f in config.json generation_config.json tokenizer.json tokenizer_config.json chat_template.jinja; do
    dl "$MODEL" "$f"
done
for f in onnx/model_q4f16.onnx onnx/model_q4f16.onnx_data; do
    dl "$MODEL" "$f"
done

# ── Whisper Large V3 Turbo (q8 + fp16) ──────────
echo -e "\n${GREEN}═══ Whisper Large V3 Turbo ONNX ═══${NC}"
MODEL="textagent/whisper-large-v3-turbo"
for f in config.json generation_config.json tokenizer.json tokenizer_config.json preprocessor_config.json; do
    dl "$MODEL" "$f"
done
for f in onnx/encoder_model_q8.onnx \
         onnx/decoder_model_merged_q8.onnx \
         onnx/encoder_model_fp16.onnx \
         onnx/decoder_model_merged_fp16.onnx; do
    dl "$MODEL" "$f"
done

# ── Kokoro 82M v1.1-zh TTS (q8 + voices) ────────
echo -e "\n${GREEN}═══ Kokoro 82M v1.1-zh TTS ONNX ═══${NC}"
MODEL="textagent/Kokoro-82M-v1.1-zh-ONNX"
for f in config.json tokenizer.json tokenizer_config.json; do
    dl "$MODEL" "$f"
done
dl "$MODEL" "onnx/model_q8.onnx"
# Download voice files used by TextAgent
for voice in af_bella bf_emma jf_alpha zf_xiaobei ff_siwis if_sara ef_dora pf_dora hf_alpha; do
    dl "$MODEL" "voices/${voice}.bin"
done

echo -e "\n${GREEN}═══ All done! ═══${NC}"
echo "Mirror directory: ${OUT_DIR}"
echo ""
echo "The models are ready for self-hosted deployment."
echo "Upload the contents of ${OUT_DIR} to your preferred static hosting."
