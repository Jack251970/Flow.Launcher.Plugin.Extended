import json
from .datatypes.ActionData import ActionData

class ResultJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ActionData):
            return obj.to_dict()
        return super().default(obj)