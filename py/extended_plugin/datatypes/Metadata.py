from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class Metadata:
    id: str
    name: str
    author: str
    version: str
    language: str
    description: str
    website: str
    disabled: bool
    execute_file_path: str
    execute_file_name: str
    plugin_directory: str
    action_keyword: str
    action_keywords: List[str]
    ico_path: str
