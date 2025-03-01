from typing import TypedDict
from ._OriginalPluginMetadata import _OriginalPluginMetadata


class _InitRequestData(TypedDict):
    currentPluginMetadata: _OriginalPluginMetadata
