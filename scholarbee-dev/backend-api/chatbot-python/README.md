# BeeBot Python Worker

Long-lived subprocess used by `src/chatbot/` (NestJS). Do not run as a standalone HTTP service.

## Setup

```bash
cd chatbot-python
pip install -r requirements.txt
```

## Environment

**Set everything in `backend-api/.env`** (not in this folder). See `.env.chatbot.example` for a copy-paste block.

| Variable in `.env` | Purpose |
|--------------------|---------|
| `MONGODB_URI` | Platform database (already used by the API) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Primary model id (default `gemini-2.0-flash-lite`) |
| `GEMINI_MODEL_FALLBACKS` | Comma-separated ids if primary is missing (not for quota errors) |
| `CHATBOT_KB_MONGODB_URI` | Optional override for a separate KB cluster; omit to reuse `MONGODB_URI` |
| `CHATBOT_KB_MONGODB_DB` | Optional KB database override; omit to reuse the platform database |

When KB is on the same database as the platform, **omit** `CHATBOT_KB_*` so the worker reuses `MONGODB_URI` and the platform database name.

Nest injects these into the worker at runtime; you do not need a `chatbot-python/.env`.

## KB maintenance

```bash
python kb_tools.py   # rebuild embeddings after editing kb_articles.py
```

Requires MongoDB Atlas vector index `kb_vector_index` on the KB cluster.
