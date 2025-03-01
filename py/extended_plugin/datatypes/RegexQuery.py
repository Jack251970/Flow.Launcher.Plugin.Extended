from dataclasses import dataclass
import re
from .Query import Query


@dataclass(frozen=True)
class RegexQuery(Query):
    regex_matches: re.Match[str]
