import os
import json
import random
import time
from typing import Any, Callable, Optional, TypeVar

from pydantic import BaseModel

from config.settings import CODE_GENERATOR_MAX_TOKENS, GROQ_MODEL, GROQ_MODEL_CODE_GENERATOR

T = TypeVar("T", bound=BaseModel)


def get_llm(agent_name: str, *, max_tokens: Optional[int] = None) -> dict[str, Any]:
    if agent_name == "code_generator":
        model = GROQ_MODEL_CODE_GENERATOR
        max_tokens = max_tokens or CODE_GENERATOR_MAX_TOKENS
    else:
        model = GROQ_MODEL
        max_tokens = max_tokens or 2048

    provider = "groq" if os.getenv("GROQ_API_KEY") else "mock"
    print(f"[LLM] agent={agent_name} model={model} provider={provider} max_tokens={max_tokens}")
    return {
        "model": model,
        "max_tokens": max_tokens,
        "provider": provider,
    }


def _call_groq(prompt: str, model: str, max_tokens: int) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set")

    import httpx

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": (
                    "Respond with valid JSON only, no markdown fences, no extra text.\n\n" + prompt
                ),
            }
        ],
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }

    print(f"[Groq] Calling model={model} max_tokens={max_tokens}")
    with httpx.Client(timeout=60) as client:
        response = client.post(url, headers=headers, json=payload)
        print(f"[Groq] Status={response.status_code}")
        response.raise_for_status()
        data = response.json()

    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("Groq response did not include any choices")

    content = choices[0].get("message", {}).get("content", "")
    if not content:
        raise RuntimeError("Groq response content is empty")

    print(f"[Groq] Response length={len(content)}")
    return content


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text)


def invoke_structured_llm_with_retry(
    agent_name: str,
    schema: type[T],
    prompt: str,
    *,
    max_tokens: Optional[int] = None,
    retries: int = 3,
    on_error: Optional[Callable[[Exception], None]] = None,
) -> T:
    llm = get_llm(agent_name, max_tokens=max_tokens)

    for attempt in range(retries):
        try:
            if llm["provider"] == "groq":
                print(f"[LLM] Attempt {attempt+1}/{retries} using Groq")
                raw = _call_groq(prompt, llm["model"], llm["max_tokens"])
                data = _extract_json(raw)
                print(f"[LLM] Parsed JSON keys={list(data.keys())[:5]}")
                return schema.model_validate(data)
            print(f"[LLM] Using mock data for {agent_name}")
            return schema.model_validate(_mock_payload_for_schema(schema))
        except Exception as exc:
            print(f"[LLM] Error on attempt {attempt+1}: {type(exc).__name__}: {exc}")
            if on_error:
                on_error(exc)
            if attempt < retries - 1:
                backoff = min(2**attempt + random.uniform(0, 0.5), 6)
                time.sleep(backoff)
                continue
            raise

    raise RuntimeError("LLM invocation failed")


def _mock_payload_for_schema(schema: type[T]) -> dict[str, Any]:
    name = schema.__name__
    if name == "BottleneckReport":
        return {
            "summary": "Mocked workflow output",
            "pain_points": [],
            "manual_steps_count": 2,
            "affected_tools": ["email", "ticketing"],
        }
    if name == "Opportunity":
        return {
            "title": "Mock automation opportunity",
            "description": "Automate triage with a routing bot",
            "tool_or_api": "slack",
            "estimated_impact": "high",
            "confidence": 0.9,
        }
    if name == "WorkflowBlueprint":
        return {
            "architecture_summary": "A simple agent-based workflow",
            "agents": [],
            "edges": [],
            "tech_stack": ["FastAPI", "LangGraph"],
            "data_flow_notes": "Use an approval gate",
        }
    if name == "GeneratedCodeFiles":
        return {
            "files": [
                {
                    "filename": "app.py",
                    "content": "print('hello from adaptflow')",
                    "language": "python",
                }
            ],
            "entrypoint": "app.py",
            "dependencies": [],
        }
    if name == "TestResult":
        return {
            "passed": True,
            "issues": [],
            "execution_log": "Validated successfully",
        }
    if name == "MigrationReport":
        return {
            "title": "Migration report",
            "before_summary": "Manual workflow",
            "after_summary": "Agent-driven workflow",
            "steps_to_deploy": ["Deploy workflow"],
            "estimated_time_saved": "2 hours/day",
            "risks_and_notes": ["Manual approval remains"],
        }
    raise ValueError(f"No mock payload defined for schema: {name}")
