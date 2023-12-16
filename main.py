import os

from click import get_app_dir
import decky_plugin
from pathlib import Path
import json
import os
import subprocess
import sys
import shutil
import time
import asyncio
import traceback

logger = decky_plugin.logger

destination_folder = decky_plugin.DECKY_USER_HOME + "/.local/share/gamescope/reshade/Shaders"
shaders_folder = decky_plugin.DECKY_PLUGIN_DIR + "/shaders"

class Plugin:
    _enabled = False

    async def get_plugin_list(self):
        return ["nothing", "here"]

    async def set_plugin(self, plugin_name):
        logger.info("I did the thing " + plugin_name)

    async def _main(self):
        decky_plugin.logger.info("Initialized")
