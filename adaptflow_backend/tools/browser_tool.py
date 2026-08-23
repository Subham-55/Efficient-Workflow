import requests


def fetch_rendered(url: str, timeout_ms: int = 15000) -> str:
    response = requests.get(url, timeout=max(1, timeout_ms // 1000))
    response.raise_for_status()
    return response.text
