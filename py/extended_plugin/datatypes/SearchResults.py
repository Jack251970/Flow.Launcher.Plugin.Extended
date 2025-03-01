from typing import Union, List, Awaitable
from .Result import Result

SearchHandlerReturnTypeSingular = Union[str, int, float, bool, None, Result]

SearchResults = Union[
    SearchHandlerReturnTypeSingular,
    List[SearchHandlerReturnTypeSingular],
    Awaitable[SearchHandlerReturnTypeSingular],
    List[Awaitable[SearchHandlerReturnTypeSingular]],
]