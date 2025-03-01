from extended_plugin import Plugin

class MyPlugin(Plugin):
    @Plugin.Search
    def search(self, query: str):
        return [
            {
                "Title": "Hello World",
                "SubTitle": "This is a subtitle",
                "IcoPath": "Images/app.png",
                "JsonRPCAction": {
                    "method": "hello_world",
                    "parameters": ["hello world"]
                }
            }
        ]