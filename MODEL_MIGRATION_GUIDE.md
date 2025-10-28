# Model Migration: Gemma3:1b → GPT-OSS:120b-cloud

## Overview

The Prompt Manager has been updated to use the **GPT-OSS:120b-cloud** model instead of Gemma3:1b. This is a powerful 120-billion parameter open-source model from OpenAI, providing significantly better quality for prompt optimization and generation tasks.

## What Changed

### Model Specification
- **Old Model**: `gemma3:1b` (1 billion parameters)
- **New Model**: `gpt-oss:120b-cloud` (120 billion parameters)
- **Inference**: Local Ollama (http://localhost:11434)

### Updated Files
1. **`pages/api/ai/optimize-prompt.js`**
   - Model changed to `gpt-oss:120b-cloud`
   - `num_predict` increased from 300 → 500 tokens

2. **`pages/api/ai/generate-prompt.js`**
   - Model changed to `gpt-oss:120b-cloud`
   - `num_predict` increased from 600 → 800 tokens

3. **`lib/huggingface.js`**
   - Model changed to `gpt-oss:120b-cloud`
   - `num_predict` increased from 500 → 800 tokens
   - Updated error message for 404 model not found

### Configuration Changes

#### Token Prediction (`num_predict`)
- **Prompt Optimization**: 500 tokens (was 300)
- **Prompt Generation**: 800 tokens (was 600)
- **Prompt Execution**: 800 tokens (was 500)

These increases leverage the more capable model for better quality outputs while maintaining reasonable response times.

## Setup Instructions

### Prerequisites
- Ollama installed and running
- Sufficient GPU memory (80GB+ recommended for 120B model)

### Step 1: Download the Model

```bash
ollama pull gpt-oss:120b-cloud
```

This will download the quantized (MXFP4 format) 120B model (~70-80GB).

### Step 2: Start Ollama Server

```bash
ollama serve
```

The server will start on `http://localhost:11434`

### Step 3: Verify Installation

Test that the model is loaded correctly:

```bash
# In another terminal
curl http://localhost:11434/api/generate -d '{
  "model": "gpt-oss:120b-cloud",
  "prompt": "Hello, how are you?",
  "stream": false
}'
```

You should see a JSON response with the model's output.

### Step 4: Start Your Application

```bash
npm run dev
```

Your application will now use the GPT-OSS:120b-cloud model for all AI operations.

## Performance Notes

### Memory Requirements
- **GPU**: 80GB VRAM recommended
- **System RAM**: 16GB+
- **Disk**: 80GB+ for model storage

### Expected Response Times
- **Prompt Optimization**: 30-60 seconds
- **Prompt Generation**: 45-90 seconds
- **Prompt Execution**: Variable (depends on prompt length)

These times are typical for a 120B model. Actual performance depends on your hardware.

### Quality Improvements

The GPT-OSS:120b-cloud model provides:
- ✅ Better prompt optimization with nuanced understanding
- ✅ More creative and detailed prompt generation
- ✅ Improved handling of complex instructions
- ✅ Better JSON output consistency
- ✅ Stronger reasoning capabilities
- ✅ More natural language generation

## Troubleshooting

### Model Not Found
```
Error: gpt-oss:120b-cloud model not found
```

**Solution**: Run `ollama pull gpt-oss:120b-cloud` and wait for download to complete.

### Connection Refused
```
Error: Ollama server is not running
```

**Solution**:
1. Open a terminal
2. Run `ollama serve`
3. Keep the terminal open while using the application

### Out of Memory
```
Error: CUDA out of memory
```

**Solution**:
- Ensure you have 80GB+ VRAM available
- Close other GPU-intensive applications
- Consider using an A100 or H100 GPU

### Slow Responses

If responses are slow:
1. Check GPU utilization: `nvidia-smi`
2. Ensure no other processes are using the GPU
3. Verify you have sufficient VRAM (80GB+)

## Rollback (If Needed)

To revert to the previous Gemma3:1b model:

### 1. Update the model names back

**`lib/huggingface.js`**:
```javascript
model: "gemma3:1b",
```

**`pages/api/ai/optimize-prompt.js`**:
```javascript
model: "gemma3:1b",
num_predict: 300,
```

**`pages/api/ai/generate-prompt.js`**:
```javascript
model: "gemma3:1b",
num_predict: 600,
```

### 2. Restart the application

```bash
npm run dev
```

## API Endpoint Details

All endpoints use the same Ollama API structure:

**Endpoint**: `http://localhost:11434/api/generate`

**Request**:
```json
{
  "model": "gpt-oss:120b-cloud",
  "prompt": "Your prompt here",
  "stream": false,
  "options": {
    "temperature": 0.5,
    "top_p": 0.8,
    "num_predict": 500
  }
}
```

**Response**:
```json
{
  "model": "gpt-oss:120b-cloud",
  "created_at": "2024-01-01T00:00:00Z",
  "response": "Model output here",
  "done": true,
  "total_duration": 1234567890,
  "load_duration": 123456789,
  "prompt_eval_count": 10,
  "prompt_eval_duration": 123456789,
  "eval_count": 50,
  "eval_duration": 987654321
}
```

## Version Information

- **Application**: Prompt Manager v1.0
- **Model**: GPT-OSS:120b-cloud (OpenAI)
- **Model Format**: Quantized (MXFP4)
- **Ollama Version**: Latest (compatible with model)
- **Update Date**: 2024

## Support

For issues with:
- **Ollama**: Visit [ollama.ai](https://ollama.ai)
- **GPT-OSS Model**: See [GitHub](https://github.com/openai/gpt-oss)
- **Application**: Check logs in the terminal running `npm run dev`
