from typing import List, TypedDict


class _OriginalQueryData(TypedDict):
    rawQuery: str
    isReQuery: bool
    search: str
    searchTerms: List[str]
    actionKeyword: str
