# OpenRouter Model Discovery - Quick Reference

## What Changed

### Before
```typescript
// ❌ Hard-coded model slugs
model: "deepseek/deepseek-v3.2-exp"
```

### After
```typescript
// ✅ Dynamic discovery with fallback
const { callWithFallback } = await import("@/lib/openrouter-discovery");
const response = await callWithFallback({ messages });
```

## System Behavior

### On Server Boot
1. Fetches all available DeepSeek models from OpenRouter
2. Ranks them by preference (R1 > V3.2 > V3 > Chat)
3. Caches the list (1 hour in prod, 5 min in dev)
4. Sets up hourly refresh (production only)

### On Each Request
1. Tries the best-ranked model first
2. If 404/410/5xx → tries next model
3. If no tools support → removes tools from request
4. Falls back to `openrouter/auto` as last resort

### Caching
- **Models list**: 1 hour (prod) / 5 min (dev)
- **Model metadata**: 24 hours
- **Auto-refresh**: Every hour (prod only)

## Model Ranking Priority

1. **R1 models** (reasoning) - `deepseek/deepseek-r1`
2. **V3.2 models** (latest) - `deepseek/deepseek-v3.2`
3. **V3 models** - `deepseek/deepseek-v3`
4. **Chat models** - `deepseek/deepseek-chat`
5. **openrouter/auto** (final fallback)

Within each tier: Higher context length and lower price = higher priority

## Key Features

✅ **No hard-coded model names**
✅ **Automatic endpoint probing**
✅ **Feature detection** (tools, streaming)
✅ **Intelligent fallback** on errors
✅ **Hourly cache refresh** in production
✅ **Zero configuration** needed

## Where It's Used

1. **tRPC Router** (`src/routers/index.ts`)
   - Character parsing AI
   - Chat message generation

2. **Streaming Chat API** (`src/app/api/chat/stream/route.ts`)
   - Real-time chat with streaming

3. **Vision API** (unchanged, uses separate model)

## Manual Operations

### Refresh Model Cache
```typescript
import { refreshModelCache } from '@/lib/openrouter-discovery';
await refreshModelCache();
```

### Select Best Model
```typescript
import { selectBestModel } from '@/lib/openrouter-discovery';
const model = await selectBestModel(
  false,  // requireTools
  true    // requireStreaming
);
```

## Monitoring

Watch server logs for:
```
✅ Discovered 8 DeepSeek models
✅ Selected model: deepseek/deepseek-r1
⚠️ Model [...] returned 404, trying next model
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Models not updating | Check `OPENROUTER_API_KEY`, restart server |
| All models failing | System falls back to `openrouter/auto` automatically |
| High latency | Normal on first request (cache warming) |
| Missing logs | Check `instrumentation.ts` is in root directory |

## No Action Required

The system works automatically. You only need to:
- ✅ Keep `OPENROUTER_API_KEY` in your `.env`
- ✅ Restart your server once

That's it! The system handles everything else.

