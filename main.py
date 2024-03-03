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
    _current_screensaver = "0"

    def _get_all_shaders():
        return sorted([str(p.name) for p in Path(destination_folder).glob("*.fx")])

    async def get_shader_list(self):
        shaders = [s for s in Plugin._get_all_shaders() if not s.startswith("SS_")]
        return shaders

    async def get_screensaver_list(self):
        shaders = [s for s in Plugin._get_all_shaders() if s.startswith("SS_")]
        return shaders

    async def get_current_shader(self):
        return Plugin._current

    async def get_current_screensaver(self):
        return Plugin._current_screensaver

    async def apply_shader(self, shader_name):
        try:
            return subprocess.run([shaders_folder + "/set_shader.sh", shader_name], capture_output=True)
        except Exception:
            decky_plugin.logger.exepction("apply screensaver")

    async def set_shader(self, shader_name, is_screensaver):
        logger.info("Applying shader " + shader_name)
        try:
            if not is_screensaver:
                ret = await Plugin.apply_shader(shader_name)
                decky_plugin.logger.info(ret)
                Plugin._current = shader_name
            else:
                Plugin._current_screensaver = shader_name
        except Exception:
            decky_plugin.logger.exepction("setting shader")

    async def _main(self):
        try:
            Path(destination_folder).mkdir(parents=True, exist_ok=True)
            for item in Path(shaders_folder).glob("*.fx"):
                try:
                    shutil.copy(item, destination_folder)
                except Exception:
                    decky_plugin.logger.debug(f"could not copy {item}")
            decky_plugin.logger.info("Initialized")
            decky_plugin.logger.info(str(await Plugin.get_shader_list(self)))
        except Exception:
            decky_plugin.logger.exepction("main")
