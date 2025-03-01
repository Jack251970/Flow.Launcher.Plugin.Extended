from dataclasses import dataclass
from typing import Optional, List, Any
from .NativeResultPreview import NativeResultPreview


@dataclass
class NativeResult:
    title: Optional[str]
    subtitle: Optional[str]
    copyText: Optional[str]
    autoCompleteText: Optional[str]
    icoPath: Optional[str]
    roundedIcon: Optional[bool]
    score: Optional[int]
    titleHighlightData: Optional[List[int]]
    contextData: Optional[List[Any]]
    titleTooltip: Optional[str]
    subtitleTooltip: Optional[str]
    progressBar: Optional[int]
    progressBarColor: Optional[str]
    jsonRPCAction: Any
    preview: NativeResultPreview
