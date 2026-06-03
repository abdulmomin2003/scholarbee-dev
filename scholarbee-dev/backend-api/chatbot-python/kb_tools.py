"""
kb_tools.py — Phase 2: the knowledge-base (RAG) layer.

  build_kb()            — embeds every article in kb_articles.py into the
                          `kb_articles` collection. Run once, and after edits.
  search_help_articles  — the tool the LLM calls for "how to apply", "what
                          documents", and other guidance NOT in the database.

Embeddings run LOCALLY via fastembed (ONNX, no PyTorch) — no API key, no
network call, ~10ms per query. Default model: BAAI/bge-small-en-v1.5 (384-dim).

------------------------------------------------------------------------
PREREQUISITE — vector search
  $vectorSearch needs MongoDB Atlas, OR MongoDB 8.x (Community/Enterprise)
  with the search component. A plain local `mongod` will NOT run it.

ATLAS VECTOR SEARCH INDEX
  Create this on the `kb_articles` collection
  (Atlas UI -> Atlas Search -> Create Search Index -> JSON editor),
  and name it exactly `kb_vector_index`:

  {
    "fields": [
      {"type": "vector", "path": "embedding",
       "numDimensions": 384, "similarity": "cosine"},
      {"type": "filter", "path": "category"},
      {"type": "filter", "path": "audience"},
      {"type": "filter", "path": "university_specific"}
    ]
  }

SETUP
  pip install fastembed
  (first run downloads the model, ~130 MB, then it is cached)

BUILD + TEST
  python kb_tools.py
  (build_kb works without the index; search needs the index to exist)

MULTILINGUAL (Urdu / Roman-Urdu queries)
  Swap EMBED_MODEL to a multilingual model fastembed supports and update
  EMBED_DIM to match — then set the same numDimensions in the Atlas index
  and re-run build_kb.
------------------------------------------------------------------------
"""

import asyncio
import os
from datetime import datetime, timezone

import numpy as np
from fastembed import TextEmbedding
from motor.motor_asyncio import AsyncIOMotorClient

# Reuse tool helpers from the platform data layer; KB uses its own Atlas DB.
from data_tools import listing, response, tool


def _required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(
            f"{name} is required for the chatbot KB connection."
        )
    return value


# KB articles/embeddings default to the platform MongoDB unless explicitly
# overridden with CHATBOT_KB_*.
_KB_MONGODB_URI = os.environ.get("CHATBOT_KB_MONGODB_URI", "").strip() or _required_env("MONGODB_URI")
_KB_MONGODB_DB = os.environ.get("CHATBOT_KB_MONGODB_DB", "").strip() or os.environ.get("MONGODB_DB", "").strip() or _required_env("MONGODB_URI").rsplit("/", 1)[-1]

_kb_client = AsyncIOMotorClient(_KB_MONGODB_URI)
db = _kb_client[_KB_MONGODB_DB]

EMBED_MODEL = "BAAI/bge-small-en-v1.5"
EMBED_DIM = 384
VECTOR_INDEX = "kb_vector_index"

_model = None  # lazy — so importing this module doesn't trigger a download


def _embedder():
    """Lazily load the embedding model (downloaded + cached on first use)."""
    global _model
    if _model is None:
        _model = TextEmbedding(model_name=EMBED_MODEL)
    return _model


def _embed(text):
    """Embed one string locally. Returns a normalized list of floats so
    cosine similarity behaves correctly in $vectorSearch."""
    vec = next(_embedder().embed([str(text)]))   # numpy array
    norm = float(np.linalg.norm(vec))
    if norm:
        vec = vec / norm
    return vec.tolist()


# --- ingest: embed all articles into kb_articles ----------------------------
async def build_kb():
    """Embed every article in kb_articles.py and upsert it into the
    `kb_articles` collection. Safe to re-run — upserts by slug and removes
    articles that were deleted from the file."""
    from kb_articles import ARTICLES

    print(f"Embedding {len(ARTICLES)} articles with {EMBED_MODEL} "
          f"({EMBED_DIM}-dim)...")
    for art in ARTICLES:
        text = f"{art['title']}\n\n{art['body']}"
        vector = await asyncio.to_thread(_embed, text)
        doc = {
            "slug": art["slug"],
            "title": art["title"],
            "body": art["body"],
            "category": art.get("category", "support"),
            "tags": art.get("tags", []),
            "audience": art.get("audience", "student"),
            "university_specific": art.get("university_specific", False),
            "embedding": vector,
            "updated_at": datetime.now(timezone.utc),
        }
        await db.kb_articles.update_one(
            {"slug": art["slug"]}, {"$set": doc}, upsert=True)
        print(f"  ok  {art['slug']}")

    # keep the collection in sync with the file
    slugs = [a["slug"] for a in ARTICLES]
    removed = await db.kb_articles.delete_many({"slug": {"$nin": slugs}})
    if removed.deleted_count:
        print(f"Removed {removed.deleted_count} stale article(s).")

    total = await db.kb_articles.count_documents({})
    print(f"Done. kb_articles now holds {total} article(s).")


# --- TOOL: search_help_articles ---------------------------------------------
@tool
async def search_help_articles(*, query, category=None, limit=5):
    """Semantic search over the help knowledge base — how to apply, required
    documents, the fee process, the scholarship process, and general concepts
    that are NOT stored in the structured database."""
    if not query or not str(query).strip():
        return response("Please provide a question to search for.", [])

    qvec = await asyncio.to_thread(_embed, query)

    vsearch = {
        "index": VECTOR_INDEX,
        "path": "embedding",
        "queryVector": qvec,
        "numCandidates": 100,
        "limit": max(1, min(int(limit), 10)),
    }
    if category:
        vsearch["filter"] = {"category": category}

    def _pipeline(vs):
        return [
            {"$vectorSearch": vs},
            {"$project": {
                "_id": 0,
                "title": 1,
                "body": 1,
                "category": 1,
                "tags": 1,
                "score": {"$meta": "vectorSearchScore"},
            }},
        ]

    rows = await db.kb_articles.aggregate(_pipeline(vsearch)).to_list(length=10)
    # Gemini sometimes picks a category with no close matches — retry unfiltered.
    if not rows and category:
        broad = dict(vsearch)
        broad.pop("filter", None)
        rows = await db.kb_articles.aggregate(_pipeline(broad)).to_list(length=10)
    return listing("help articles", rows)


# --- run: build the KB, then a test search ----------------------------------
if __name__ == "__main__":
    import json
    import logging

    logging.basicConfig(level=logging.INFO,
                         format="%(levelname)s %(name)s %(message)s")

    async def _main():
        await build_kb()
        print("\n--- test search (needs the kb_vector_index to exist) ---")
        res = await search_help_articles(query="how do I apply to a university")
        print("summary:", res["summary"])
        print(json.dumps(res["results"][:3], indent=2, default=str))

    asyncio.run(_main())