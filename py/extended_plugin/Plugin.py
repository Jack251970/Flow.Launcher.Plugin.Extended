import asyncio
import inspect
from typing import List, Optional, Callable, Union, re

from .JsonRpcConnection import _JsonRpcConnection
from .datatypes import _InitRequestData, _OriginalQueryData, Metadata, NativeResult, Result
from .datatypes.SearchResults import SearchResults
from .datatypes.Query import Query
from .datatypes.RegexQuery import RegexQuery
from .decorators.Search import SearchRestrictionsAndHandler, create_search_decorator, search_decorator_stub
from .CancellationToken import CancellationToken


class Plugin:
    Search = search_decorator_stub

    __metadata: Metadata
    __settings: dict
    __searches: List[SearchRestrictionsAndHandler] = []
    __cancellation_token: CancellationToken

    # def __init_subclass__(cls, **kwargs):
    #     super().__init_subclass__(**kwargs)
    #     Plugin.__set_static_fields()
    #     instance = cls()
    #     asyncio.run(instance.__listen())

    def __init__(self):
        Plugin.__set_static_fields()
        self.__cancellation_token = CancellationToken()
        self.__connection = _JsonRpcConnection()
        self.__connection.on_request("initialize", self.initialize)
        self.__connection.on_request("query", self.query)
        self.__connection.on_request("context_menu", self.context_menu)
        asyncio.run(self.__listen())

    def initialize(self, data: _InitRequestData):
        self.__metadata = Metadata(
            id=data["currentPluginMetadata"]["id"],
            name=data["currentPluginMetadata"]["name"],
            author=data["currentPluginMetadata"]["author"],
            version=data["currentPluginMetadata"]["version"],
            language=data["currentPluginMetadata"]["language"],
            plugin_directory=data["currentPluginMetadata"]["pluginDirectory"],
            execute_file_path=data["currentPluginMetadata"]["executeFilePath"],
            execute_file_name=data["currentPluginMetadata"]["executeFileName"],
            action_keyword=data["currentPluginMetadata"]["actionKeyword"],
            action_keywords=data["currentPluginMetadata"]["actionKeywords"],
            ico_path=data["currentPluginMetadata"]["icoPath"],
            website=data["currentPluginMetadata"]["website"],
            description=data["currentPluginMetadata"]["description"],
            disabled=data["currentPluginMetadata"]["disabled"],
        )

        Plugin.__searches.reverse()

        return {}

    @property
    def metadata(self):
        return self.__metadata

    async def query(self, original_query: _OriginalQueryData, settings):
        self.__settings = settings

        if self.__cancellation_token is not None:
            self.__cancellation_token.cancel()

        self.__cancellation_token = CancellationToken()

        result: List[NativeResult] = []

        for search in Plugin.__searches:
            if search.restrictions is None or (
                    search.restrictions.equal_to is None and
                    search.restrictions.starts_with is None and
                    search.restrictions.regex is None
            ):
                if not await self.__handle_debounce():
                    return {}
                result = self.__make_results(await self.__handle_search_call(search.handler, original_query))
                break
            elif search.restrictions.equal_to is not None:
                if search.restrictions.case_sensitive and search.restrictions.equal_to == original_query['search']:
                    if not await self.__handle_debounce(search.restrictions.debounce_delay):
                        return {}
                    result = self.__make_results(await self.__handle_search_call(search.handler, original_query, starting_index=len(search.restrictions.equal_to)))
                    break

                if not search.restrictions.case_sensitive and search.restrictions.equal_to.lower() == original_query['search'].lower():
                    if not await self.__handle_debounce(search.restrictions.debounce_delay):
                        return {}
                    result = self.__make_results(await self.__handle_search_call(search.handler, original_query, starting_index=len(search.restrictions.equal_to)))
                    break
            elif search.restrictions.starts_with is not None:
                if search.restrictions.case_sensitive and original_query['search'].startswith(search.restrictions.starts_with):
                    if not await self.__handle_debounce(search.restrictions.debounce_delay):
                        return {}
                    result = self.__make_results(await self.__handle_search_call(search.handler, original_query, starting_index=len(search.restrictions.starts_with)))
                    break

                if not search.restrictions.case_sensitive and original_query['search'].lower().startswith(search.restrictions.starts_with.lower()):
                    if not await self.__handle_debounce(search.restrictions.debounce_delay):
                        return {}
                    result = self.__make_results(await self.__handle_search_call(search.handler, original_query, starting_index=len(search.restrictions.starts_with)))
                    break
            elif search.restrictions.regex is not None:
                matches = search.restrictions.regex.match(original_query['search'])
                if matches:
                    if not await self.__handle_debounce(search.restrictions.debounce_delay):
                        return {}
                    result = self.__make_results(await self.__handle_search_call(search.handler, original_query, regex_match=matches))
                    break

        # return { "result": result }
        return { "error": { "code": -30603, "message": "Internal error" } }

    def context_menu(self):
        pass

    def __verify_context_menu_params(self, params: List) -> bool:
        if not isinstance(params, list):
            return False

        if len(params) != 2:
            return False

        if not isinstance(params[0], str):
            return False

        if not isinstance(params[1], list):
            return False

        return True

    async def __listen(self):
        await self.__connection.listen()

    async def __handle_debounce(self, ms: Optional[int] = None) -> bool:
        token = self.__cancellation_token
        if token.is_cancelled: return False
        if ms is None: return True
        await asyncio.sleep(ms / 1000)  # Convert milliseconds to seconds
        return not token.is_cancelled

    @staticmethod
    def __count_function_arguments(func: Callable) -> int:
        return len([
            param for param in inspect.signature(func).parameters.values()
            if param.kind in (param.POSITIONAL_OR_KEYWORD, param.POSITIONAL_ONLY)
        ])

    @staticmethod
    def __make_results(data) -> List[NativeResult]:
        results: List[Result] = []
        pass

    @staticmethod
    def __get_query(original_query: _OriginalQueryData, starting_index: Optional[int] = None, regex_match: Optional[re.Match] = None) -> Union[Query, RegexQuery]:
        from_index = 0 if starting_index is None else starting_index
        search = original_query['search'][from_index:].strip()
        search_terms = [v for v in search.split(' ') if v != ""]
        if regex_match is not None:
            return RegexQuery(
                raw=original_query['rawQuery'],
                is_requery=original_query['isReQuery'],
                action_keyword=original_query['actionKeyword'],
                search=search,
                search_terms=search_terms,
                regex_matches=regex_match
            )
        else:
            return Query(
                raw=original_query['rawQuery'],
                is_requery=original_query['isReQuery'],
                action_keyword=original_query['actionKeyword'],
                search=search,
                search_terms=search_terms
            )


    async def __handle_search_call(self, handler: Callable, original_query: _OriginalQueryData, starting_index: Optional[int] = None, regex_match: Optional[re.Match] = None) -> Optional[SearchResults]:
        argument_count = self.__count_function_arguments(handler)

        result: Optional[SearchResults] = None

        if argument_count == 0:
            result = handler()
        elif argument_count == 1:
            result = handler(self.__get_query(original_query, starting_index=starting_index, regex_match=regex_match))
        elif argument_count == 2:
            result = handler(self.__get_query(original_query, starting_index=starting_index, regex_match=regex_match), self.__cancellation_token)

        if inspect.iscoroutinefunction(handler):
            result = await result

        return result

    @classmethod
    def __set_static_fields(cls):
        cls.Search = create_search_decorator(cls)
