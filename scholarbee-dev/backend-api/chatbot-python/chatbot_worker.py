"""
chatbot_worker.py — long-lived process spawned by backend-api.

Reads newline-delimited JSON requests from stdin and writes one JSON response
per line to stdout. Each request is handled by orchestrator.chat().

Protocol (stdin / stdout):
  {"id": "...", "action": "query", "query": "...", "sessionId": "...",
   "studentId": "..." | null}
  {"id": "...", "action": "clear_session", "sessionId": "..."}
  {"id": "...", "action": "health"}

Response:
  {"id": "...", "ok": true, "result": {...}}
  {"id": "...", "ok": false, "error": "..."}
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
import traceback
from typing import Any

from google.genai import types

from orchestrator import chat
import kb_tools as kb

logger = logging.getLogger("chatbot.worker")

# Migration: conversation history is persisted in the platform MongoDB by
# NestJS. The worker is stateless — history is passed in each request.


def _emit(payload: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(payload, default=str) + "\n")
    sys.stdout.flush()


def _serialize_contents(contents: list[types.Content]) -> list[dict[str, Any]]:
    return [item.model_dump(mode="json") for item in contents]


def _deserialize_contents(data: list[dict[str, Any]]) -> list[types.Content]:
    return [types.Content.model_validate(item) for item in data]


async def _handle_query(request: dict[str, Any]) -> dict[str, Any]:
    query = (request.get("query") or "").strip()
    session_id = (request.get("sessionId") or "").strip() or "default"
    student_id = request.get("studentId")
    history_payload = request.get("history")

    if not query:
        return {
            "answer": "Please provide a valid question.",
            "sources": [],
            "message": "Empty query",
            "sessionId": session_id,
            "history": [],
        }

    student_id_str = str(student_id).strip() if student_id else None
    history = (
        _deserialize_contents(history_payload)
        if isinstance(history_payload, list)
        else []
    )

    answer, updated_history = await chat(
        query,
        history=history,
        student_id=student_id_str,
        user_first_name=(request.get("userFirstName") or "").strip() or None,
    )

    return {
        "answer": answer or "Sorry, I could not generate a response.",
        "sources": [],
        "message": "Answer generated successfully",
        "sessionId": session_id,
        "history": _serialize_contents(updated_history),
    }


async def _handle_clear_session(request: dict[str, Any]) -> dict[str, Any]:
    session_id = (request.get("sessionId") or "").strip()
    return {"cleared": True, "sessionId": session_id}


async def _handle_health() -> dict[str, Any]:
    kb_count = await kb.db.kb_articles.count_documents({})
    return {
        "status": "healthy",
        "platformDb": os.environ.get("MONGODB_DB", "test"),
        "kbDb": os.environ.get("CHATBOT_KB_MONGODB_DB", os.environ.get("MONGODB_DB", "local-db")),
        "kbArticleCount": kb_count,
    }


async def _dispatch(request: dict[str, Any]) -> dict[str, Any]:
    action = request.get("action")
    if action == "query":
        return await _handle_query(request)
    if action == "clear_session":
        return await _handle_clear_session(request)
    if action == "health":
        return await _handle_health()
    raise ValueError(f"Unknown action: {action!r}")


async def _process_request(request: dict[str, Any]) -> None:
    request_id = request.get("id")
    if not request_id:
        return

    try:
        result = await _dispatch(request)
        _emit({"id": request_id, "ok": True, "result": result})
    except Exception as exc:
        logger.exception("request failed: %s", request)
        _emit({
            "id": request_id,
            "ok": False,
            "error": str(exc) or exc.__class__.__name__,
        })


async def _run_loop() -> None:
    loop = asyncio.get_running_loop()
    while True:
        line = await loop.run_in_executor(None, sys.stdin.readline)
        if not line:
            break

        trimmed = line.strip()
        if not trimmed:
            continue

        try:
            request = json.loads(trimmed)
        except json.JSONDecodeError:
            logger.error("invalid JSON request: %s", trimmed)
            continue

        if not isinstance(request, dict):
            continue

        await _process_request(request)


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s %(name)s %(message)s",
        stream=sys.stderr,
    )
    logger.info(
        "worker ready — platform db=%r, kb db=%r",
        os.environ.get("MONGODB_DB", "test"),
        os.environ.get("CHATBOT_KB_MONGODB_DB", "local-db"),
    )
    try:
        asyncio.run(_run_loop())
    except KeyboardInterrupt:
        pass
    except Exception:
        traceback.print_exc(file=sys.stderr)
        raise


if __name__ == "__main__":
    main()
