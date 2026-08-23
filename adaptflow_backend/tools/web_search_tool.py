from typing import List

from pydantic import BaseModel


class SearchResult(BaseModel):
    title: str
    snippet: str
    link: str


def search(query: str, k: int = 3) -> List[SearchResult]:
    return [
        SearchResult(
            title=f"Result for {query}",
            snippet="Mock search result for local scaffold",
            link="https://example.com",
        )
    ][:k]
