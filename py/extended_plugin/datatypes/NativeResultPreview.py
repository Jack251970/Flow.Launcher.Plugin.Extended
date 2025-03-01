from dataclasses import dataclass
from typing import Optional


@dataclass
class NativeResultPreview:
    previewImagePath: Optional[str]
    isMedia: Optional[bool]
    description: Optional[str]
    filePath: Optional[str]
