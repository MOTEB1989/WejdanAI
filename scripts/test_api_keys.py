#!/usr/bin/env python3
"""Simple API key validator for multiple providers.

Set environment variables before running:
  OPENAI_KEY, KIMI_KEY, PERPLEXITY_KEY, GROK_KEY, ANTHROPIC_KEY

Optional encrypted values can be supplied with *_ENCRYPTED and a shared
FERNET_KEY to decrypt (see --decrypt).
"""

from __future__ import annotations

import argparse
import json
import os
from typing import Any, Callable, Dict

import requests


def decrypt_if_needed(value: str | None, fernet_key: str | None) -> str | None:
    if not value or not fernet_key:
        return value

    try:
        from cryptography.fernet import Fernet
    except ImportError as exc:
        raise RuntimeError("cryptography is required for decryption") from exc

    cipher = Fernet(fernet_key.encode())
    return cipher.decrypt(value.encode()).decode()


def test_api(url: str, headers: Dict[str, str], data: Dict[str, Any], key_name: str) -> str:
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
    except Exception as exc:  # noqa: BLE001 - provide readable error for CLI output
        return f"{key_name}: Error - {exc}"

    if response.status_code == 200:
        try:
            payload = response.json()
        except ValueError:
            return f"{key_name}: Valid - Response: {response.text}"

        content = None
        if "choices" in payload and payload["choices"]:
            content = payload["choices"][0]["message"].get("content")
        elif "content" in payload and payload["content"]:
            content = payload["content"][0].get("text")
        return f"{key_name}: Valid - Response: {content or payload}"

    return f"{key_name}: Invalid - Code: {response.status_code} - {response.text}"


def build_openai_request(api_key: str) -> tuple[str, Dict[str, str], Dict[str, Any]]:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    data = {
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Test key validity"}],
        "max_tokens": 5,
    }
    return "https://api.openai.com/v1/chat/completions", headers, data


def build_kimi_request(api_key: str) -> tuple[str, Dict[str, str], Dict[str, Any]]:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    data = {
        "model": "moonshot-v1-8k",
        "messages": [{"role": "user", "content": "Test key validity"}],
        "max_tokens": 5,
    }
    return "https://api.moonshot.cn/v1/chat/completions", headers, data


def build_perplexity_request(api_key: str) -> tuple[str, Dict[str, str], Dict[str, Any]]:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    data = {
        "model": "llama-3-sonar-small-32k-online",
        "messages": [{"role": "user", "content": "Test key validity"}],
        "max_tokens": 5,
    }
    return "https://api.perplexity.ai/chat/completions", headers, data


def build_grok_request(api_key: str) -> tuple[str, Dict[str, str], Dict[str, Any]]:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    data = {
        "model": "grok-beta",
        "messages": [{"role": "user", "content": "Test key validity"}],
        "max_tokens": 5,
    }
    return "https://api.x.ai/v1/chat/completions", headers, data


def build_anthropic_request(api_key: str) -> tuple[str, Dict[str, str], Dict[str, Any]]:
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }
    data = {
        "model": "claude-3-opus-20240229",
        "max_tokens": 5,
        "messages": [{"role": "user", "content": "Test key validity"}],
    }
    return "https://api.anthropic.com/v1/messages", headers, data


PROVIDERS: Dict[str, Callable[[str], tuple[str, Dict[str, str], Dict[str, Any]]]] = {
    "openai": build_openai_request,
    "kimi": build_kimi_request,
    "perplexity": build_perplexity_request,
    "grok": build_grok_request,
    "anthropic": build_anthropic_request,
}


def load_key(env_name: str, encrypted_env_name: str | None, fernet_key: str | None) -> str | None:
    value = os.getenv(env_name)
    if value:
        return value

    if encrypted_env_name:
        encrypted = os.getenv(encrypted_env_name)
        return decrypt_if_needed(encrypted, fernet_key)

    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate API keys for supported providers.")
    parser.add_argument(
        "--providers",
        nargs="*",
        choices=sorted(PROVIDERS.keys()),
        help="Limit which providers are tested.",
    )
    parser.add_argument(
        "--decrypt",
        action="store_true",
        help="Use *_ENCRYPTED values with FERNET_KEY for decryption.",
    )
    args = parser.parse_args()

    fernet_key = os.getenv("FERNET_KEY") if args.decrypt else None

    key_map = {
        "openai": ("OPENAI_KEY", "OPENAI_KEY_ENCRYPTED"),
        "kimi": ("KIMI_KEY", "KIMI_KEY_ENCRYPTED"),
        "perplexity": ("PERPLEXITY_KEY", "PERPLEXITY_KEY_ENCRYPTED"),
        "grok": ("GROK_KEY", "GROK_KEY_ENCRYPTED"),
        "anthropic": ("ANTHROPIC_KEY", "ANTHROPIC_KEY_ENCRYPTED"),
    }

    providers = args.providers or list(PROVIDERS.keys())
    results: Dict[str, str] = {}
    for provider in providers:
        env_name, encrypted_env = key_map[provider]
        api_key = load_key(env_name, encrypted_env if args.decrypt else None, fernet_key)
        if not api_key:
            results[provider] = f"{provider}: Missing {env_name}"
            continue
        url, headers, data = PROVIDERS[provider](api_key)
        results[provider] = test_api(url, headers, data, provider.capitalize())

    print(json.dumps(results, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
