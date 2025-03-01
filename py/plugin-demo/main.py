import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '.'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), './lib'))
sys.path.append(os.path.join(os.path.dirname(__file__), './plugin'))

from plugin.MyPlugin import MyPlugin

if __name__ == "__main__":
    MyPlugin()
