from dataclasses import dataclass
from typing import Optional, Union, List
from .ActionData import ActionData
from .ResultPreview import ResultPreview
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .SearchResults import SearchResults

@dataclass
class Result:
    title: Optional[str] = None
    subtitle: Optional[str] = None
    text_to_copy_on_ctrl_c: Optional[str] = None
    autocomplete_text: Optional[str] = None
    icon_path: Optional[str] = None
    is_icon_round: Optional[bool] = None
    action: Optional[Union[ActionData, bool]] = None
    score: Optional[int] = None
    title_highlight_data: Optional[List[int]] = None
    title_tooltip: Optional[str] = None
    subtitle_tooltip: Optional[str] = None
    progress: Optional[int] = None
    progress_bar_color: Optional[str] = None
    preview: Optional[ResultPreview] = None
    context_menu: Optional['SearchResults'] = None