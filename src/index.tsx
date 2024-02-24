import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  ToggleField,
  Router,
  ServerAPI,
  showContextMenu,
  staticClasses,
  Dropdown,
  DropdownOption,
  SingleDropdownOption,
} from "decky-frontend-lib";
import { VFC, useState, useEffect } from "react";
import { MdWbShade } from "react-icons/md";
import logo from "../assets/logo.png";


class ReshadeckLogic
{
    serverAPI: ServerAPI;
    dataTakenAt: number = Date.now();
    // prevReading: any = {x: null, y: null, z: null};

    constructor(serverAPI: ServerAPI) {
	this.serverAPI = serverAPI;
    }

    handleButtonInput = async (val: any[]) => {
        if (Date.now() - this.dataTakenAt < 1000) {
            return;
        }
	/*
	  R2 0
	  L2 1
	  R1 2
	  R2 3
	  Y  4
	  B  5
	  X  6
	  A  7
	  UP 8
	  Right 9
	  Left 10
	  Down 11
	  Select 12
	  Steam 13
	  Start 14
	  QAM  ???
	  L5 15
	  R5 16*/
        // console.log(val[0].flGravityVectorX);
        // console.log(val[0].flGravityVectorY);
        // console.log(val[0].flGravityVectorZ);
        // let reading = {x: val[0].flGravityVectorX, y: val[0].flGravityVectorY, z: val[0].flGravityVectorZ};
        // this.prevReading = reading;
        this.dataTakenAt = Date.now();
        // console.log(reading);
        // console.log(val);
        const { flSoftwareGyroDegreesPerSecondPitch, flSoftwareGyroDegreesPerSecondYaw, flSoftwareGyroDegreesPerSecondRoll } = val[0];
        let degrees = 5;
        if (Math.abs(flSoftwareGyroDegreesPerSecondPitch) > degrees ||
            Math.abs(flSoftwareGyroDegreesPerSecondYaw) > degrees ||
            Math.abs(flSoftwareGyroDegreesPerSecondRoll) > degrees) {
            await serverAPI.callPluginMethod("set_shader", {"shader_name": "None"});
            await this.serverAPI.toaster.toast({
                                    title: "Waking Up Screen",
                                    body: "Waking Up Screen",
                                    duration: 500,
                                    critical: true
                            });

        }
    }
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const baseShader = { data: "None", label: "No Shader" } as SingleDropdownOption;
  const [shader_list, set_shader_list] = useState<string[]>([]);
  const [selectedShader, setSelectedShader] = useState<DropdownOption>(baseShader);
  const [shaderOptions, setShaderOptions] = useState<DropdownOption[]>([baseShader]);
    
  const getShaderOptions = (le_list: string[]) => {
      let options: DropdownOption[] = [];
      options.push(baseShader);
      for (let i = 0; i < le_list.length; i++) {
          let option = { data: le_list[i], label: le_list[i] } as SingleDropdownOption;
          options.push(option);
      }
      return options;
  }


  const initState = async () => {
    let plugin_list_resp = await serverAPI.callPluginMethod("get_plugin_list", {});
    let le_list = plugin_list_resp.result as string[];
    set_shader_list(le_list)
    setShaderOptions(getShaderOptions(le_list));
    let curr = await serverAPI.callPluginMethod("get_current_shader", {});
    setSelectedShader({data: curr.result, label: (curr.result == "0" ? "None" : curr.result)} as SingleDropdownOption);
  }

  useEffect(() => {
      initState();
  }, []);

  return (
    <PanelSection title="Select Shader">
      <PanelSectionRow>
        <Dropdown
                menuLabel="Select shader"
                strDefaultLabel={selectedShader.label as string}
                rgOptions={shaderOptions}
                selectedOption={selectedShader}
                onChange={async (newSelectedShader: DropdownOption) => {
                    console.log(selectedShader);
                    await serverAPI.callPluginMethod("set_shader", {"shader_name": newSelectedShader.data});
                }}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <div>Place any custom shaders in <pre>~/.local/share/gamescope</pre><pre>/reshade/Shaders</pre> so that the .fx files are in the root of the Shaders folder.</div>
      </PanelSectionRow>
      <PanelSectionRow>
        <div>WARNING: Shaders can lead to dropped frames and possibly even severe performance problems.</div>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  let logic = new ReshadeckLogic(serverApi);
  let input_register = window.SteamClient.Input.RegisterForControllerStateChanges(logic.handleButtonInput);

  return {
    title: <div className={staticClasses.Title}>Reshadeck</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <MdWbShade />,
    onDismount() {
        input_register.unregister();
    },
    alwaysRender: true
  };
});
