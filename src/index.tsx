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
import { VscDebugDisconnect } from "react-icons/vsc";
import logo from "../assets/logo.png";

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
    setSelectedShader({data: curr.result, label: (curr.result == "0" ? "None" else curr.result)} as SingleDropdownOption);
  }

  useEffect(() => {
      initState();
  }, []);

  return (
    <PanelSection title="Panel Section">
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
    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className={staticClasses.Title}>Screentshot Aggregator</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <VscDebugDisconnect />,
    onDismount() {
    },
  };
});
