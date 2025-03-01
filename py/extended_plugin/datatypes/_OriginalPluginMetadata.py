from typing import List, TypedDict


class _OriginalPluginMetadata(TypedDict):
    id: str
    name: str
    author: str
    version: str
    language: str
    description: str
    website: str
    disabled: bool
    executeFilePath: str
    executeFileName: str
    pluginDirectory: str
    actionKeyword: str
    actionKeywords: List[str]
    icoPath: str
