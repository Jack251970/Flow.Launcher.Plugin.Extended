from dataclasses import dataclass
from typing import Optional, Callable
import re

def search_decorator_stub(
            func: Optional[Callable] = None,
            starts_with: Optional[str] = None,
            equal_to: Optional[str] = None,
            case_sensitive: Optional[bool] = None,
            min_length: Optional[int] = None,
            max_length: Optional[int] = None,
            debounce_delay: Optional[int] = None,
            regex: Optional[str] = None,
            regex_options: Optional[re.RegexFlag] = re.IGNORECASE
    ):
    pass

def create_search_decorator(plugin):
    def search_decorator(
            func: Optional[Callable] = None,
            starts_with: Optional[str] = None,
            equal_to: Optional[str] = None,
            case_sensitive: Optional[bool] = None,
            min_length: Optional[int] = None,
            max_length: Optional[int] = None,
            debounce_delay: Optional[int] = None,
            regex: Optional[str] = None,
            regex_options: Optional[re.RegexFlag] = re.IGNORECASE
    ):
        def actual_decorator(func2):
            # noinspection PyProtectedMember
            # noinspection PyUnresolvedReferences
            plugin._Plugin__searches.append(
                SearchRestrictionsAndHandler(
                    restrictions=SearchRestrictions(
                        starts_with=starts_with,
                        equal_to=equal_to,
                        case_sensitive=case_sensitive,
                        min_length=min_length,
                        max_length=max_length,
                        debounce_delay=debounce_delay,
                        regex=re.compile(regex, regex_options) if regex is not None else None
                    ),
                    handler=func2
                )
            )
            return func2

        if func is not None:
            return actual_decorator(func)
        else:
            return actual_decorator

    return search_decorator


@dataclass(frozen=True)
class SearchRestrictions:
    starts_with: Optional[str]
    equal_to: Optional[str]
    case_sensitive: Optional[bool]
    min_length: Optional[int]
    max_length: Optional[int]
    debounce_delay: Optional[int]
    regex: Optional[re.Pattern[str]]


@dataclass
class SearchRestrictionsAndHandler:
    restrictions: Optional[SearchRestrictions]
    handler: callable
