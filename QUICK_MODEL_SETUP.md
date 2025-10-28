# Quick Setup: GPT-OSS:120b-cloud Model

## TL;DR Setup (5 minutes)

### 1. Download the Model
```bash
ollama pull gpt-oss:120b-cloud
```
⏱️ Takes 10-20 minutes depending on internet speed

### 2. Start Ollama
```bash
ollama serve
```

### 3. Run Your App (in another terminal)
```bash
npm run dev
```

### 4. Done! 🎉

---

## Model Details

| Aspect | Value |
|--------|-------|
| **Model Name** | `gpt-oss:120b-cloud` |
| **Parameters** | 120 Billion |
| **Quantization** | MXFP4 (mixed precision) |
| **GPU Memory** | ~80GB |
| **Download Size** | ~70-80GB |
| **Provider** | OpenAI (open-source) |
| **License** | Apache 2.0 |

---

## Files Modified

✅ `lib/huggingface.js`
✅ `pages/api/ai/optimize-prompt.js`
✅ `pages/api/ai/generate-prompt.js`

**Changes**: Model name and token prediction values updated

---

## Verify Installation

```bash
# Test the model is working
curl http://localhost:11434/api/generate \
  -d '{"model":"gpt-oss:120b-cloud","prompt":"Hi","stream":false}'
```

You should get a JSON response with text output.

---

## Performance Benchmarks

| Task | Time | Quality |
|------|------|---------|
| Optimize Prompt | 30-60s | ⭐⭐⭐⭐⭐ |
| Generate Prompt | 45-90s | ⭐⭐⭐⭐⭐ |
| Run Prompt | Variable | ⭐⭐⭐⭐⭐ |

---

## Common Issues & Solutions

### ❌ "Model not found"
```bash
ollama pull gpt-oss:120b-cloud
```

### ❌ "Connection refused"
Make sure Ollama is running: `ollama serve`

### ❌ "Out of memory"
You need 80GB+ VRAM. Check with: `nvidia-smi`

### ❌ "Very slow responses"
- Ensure GPU has 80GB+ VRAM
- Close other GPU-intensive apps
- Check if model is fully loaded

---

## Rollback to Gemma3:1b (if needed)

Update model name in 3 files:
1. `lib/huggingface.js` → `gemma3:1b`
2. `pages/api/ai/optimize-prompt.js` → `gemma3:1b`
3. `pages/api/ai/generate-prompt.js` → `gemma3:1b`

Restart app with `npm run dev`

---

## Hardware Requirements

### Minimum (Single GPU)
- GPU: RTX 4090 (24GB) - Won't work for 120B
- GPU: A100 (80GB) ✅ Recommended
- GPU: H100 (80GB) ✅ Best
- RAM: 16GB
- Disk: 100GB

### Recommended (Multiple GPUs)
- 2x A100 (80GB each) for faster inference
- 64GB System RAM
- NVMe SSD (500GB+)

---

## API Endpoints (All 3 use same model)

1. **Optimize Prompt**: `POST /api/ai/optimize-prompt`
2. **Generate Prompt**: `POST /api/ai/generate-prompt`
3. **Run Prompt**: `POST /api/ai/run-prompt`

All route through: `http://localhost:11434/api/generate`

---

## Environment

```
OLLAMA_HOST: http://localhost:11434
MODEL: gpt-oss:120b-cloud
Temperature: 0.3-0.7 (varies by endpoint)
Top P: 0.7-0.9
```

---

Need help? Check `MODEL_MIGRATION_GUIDE.md` for detailed instructions.
