from dataclasses import dataclass
from typing import List, Any, Optional

@dataclass
class ActionData:
    def __init__(self, callback_name: str, method_name: str, data: Optional[List[Any]] = None):
        if data is None:
            data = []
        self.callback_name = callback_name
        self.method_name = method_name
        self.data = data
        self.hide = True

    def to_dict(self):
        return {
            'method': self.callback_name,
            'parameters': [self.method_name, self.data, self.hide]
        }

    def dont_hide(self):
        self.hide = False
        return self