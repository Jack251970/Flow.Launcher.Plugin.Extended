from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class Query:
    raw: str
    is_requery: bool
    search: str
    search_terms: List[str]
    action_keyword: str