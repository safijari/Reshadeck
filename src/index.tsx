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
  const [shader_list, set_shader_list] = useState<String[]>([]);
  const baseShader = { data: "0", label: "None" } as SingleDropdownOption;
  const [selectedShader, setSelectedShader] = useState<DropdownOption>(baseShader);
  const [shaderOptions, setShaderOptions] = useState<DropdownOption[]>([baseShader]);
    
    const getShaderOptions = () => {
        let options: DropdownOption[] = [];
        options.push(baseShader);
        for (let i = 0; i < shader_list.length; i++) {
            let option = { data: shader_list[i], label: shader_list[i] } as SingleDropdownOption;
            options.push(option);
        }
        return options;
    }

  const initState = async () => {
    let plugin_list_resp = await serverAPI.callPluginMethod("get_plugin_list", {});
    set_shader_list(plugin_list_resp.result as String[])
    setShaderOptions(getShaderOptions());
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
                rgOptions={getShaderOptions()}
                selectedOption={selectedShader}
                onChange={async (newSelectedShader) => {
                    setSelectedShader(newSelectedShader);
                    serverAPI.callPluginMethod("set_shader", {"shader_name": newSelectedShader.data});
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
