from dataclasses import dataclass
from typing import Optional

@dataclass
class ResultPreview:
    preview_image_path: Optional[str] = None
    is_media: Optional[bool] = None
    description: Optional[str] = None
    file_path: Optional[str] = None
