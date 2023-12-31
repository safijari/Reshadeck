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
    _current = "0"

    async def get_plugin_list(self):
        shaders = sorted([str(p.name) for p in Path(destination_folder).glob("*.fx")])
        return shaders

    async def get_current_shader(self):
        return Plugin._current

    async def set_shader(self, shader_name):
        logger.info("I did the thing " + shader_name)
        try:
            ret = subprocess.run([shaders_folder + "/set_shader.sh", shader_name], capture_output=True)
            decky_plugin.logger.info(ret)
            Plugin._current = shader_name
        except Exception:
            decky_plugin.logger.exepction("setting shader")

    async def _main(self):
        try:
            Path(destination_folder).mkdir(parents=True, exist_ok=True)
            for item in Path(shaders_folder).glob("*.fx"):
                shutil.copy(item, destination_folder)
            decky_plugin.logger.info("Initialized")
            decky_plugin.logger.info(str(await Plugin.get_plugin_list(self)))
        except Exception:
            decky_plugin.logger.exepction("main")
