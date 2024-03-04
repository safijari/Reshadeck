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


class ReshadeckLogic {
    serverAPI: ServerAPI;
    dataTakenAt: number = Date.now();
    screensaverActive: boolean = false;

    constructor(serverAPI: ServerAPI) {
        this.serverAPI = serverAPI;
    }

    handleButtonInput = async (val: any[]) => {
        if (!this.screensaverActive) {
            return;
        }
        let cancel = false;
        const { flSoftwareGyroDegreesPerSecondPitch,
            flSoftwareGyroDegreesPerSecondYaw,
            flSoftwareGyroDegreesPerSecondRoll,
            ulButtons,
            sLeftStickX,
            sLeftStickY,
            sRightStickX,
            sRightStickY,
        } = val[0];
        if (ulButtons != 0) { cancel = true; }
        if (Math.abs(sLeftStickX) > 5000 || Math.abs(sLeftStickY) > 5000 ||
            Math.abs(sRightStickX) > 5000 || Math.abs(sRightStickY) > 5000) {
            cancel = true;
        }

        if (!cancel && Date.now() - this.dataTakenAt < 1000) {
            return;
        }
        this.dataTakenAt = Date.now();
        let degrees = 5;
        if (!cancel && Math.abs(flSoftwareGyroDegreesPerSecondPitch) > degrees ||
            Math.abs(flSoftwareGyroDegreesPerSecondYaw) > degrees ||
            Math.abs(flSoftwareGyroDegreesPerSecondRoll) > degrees) {
            cancel = true;
        }

        if (cancel) {
            await this.serverAPI.callPluginMethod("apply_shader", { "screensaver": false });
            await this.serverAPI.toaster.toast({
                title: "Waking Up Screen",
                body: "Waking Up Screen",
                duration: 500,
                critical: true
            });
            this.screensaverActive = false;
        }
    }

    handleSuspend = async (val: any) => {
        await this.serverAPI.callPluginMethod("apply_shader", { "screensaver": false });
    }
}

const Content: VFC<{ serverAPI: ServerAPI, logic: ReshadeckLogic }> = ({ serverAPI, logic }) => {
    const baseShader = { data: "None", label: "No Shader" } as SingleDropdownOption;
    const baseScreensaver = { data: "None", label: "No Screensaver" } as SingleDropdownOption;
    const [shader_list, set_shader_list] = useState<string[]>([]);
    const [selectedShader, setSelectedShader] = useState<DropdownOption>(baseShader);
    const [shaderOptions, setShaderOptions] = useState<DropdownOption[]>([baseShader]);
    const [selectedScreenSaver, setSelectedScreenSaver] = useState<DropdownOption>(baseShader);
    const [screenSaverOptions, setScreenSaverOptions] = useState<DropdownOption[]>([baseScreensaver]);

    const getShaderOptions = (le_list: string[], baseShaderOrSS: any) => {
        let options: DropdownOption[] = [];
        options.push(baseShaderOrSS);
        for (let i = 0; i < le_list.length; i++) {
            let option = { data: le_list[i], label: le_list[i] } as SingleDropdownOption;
            options.push(option);
        }
        return options;
    }

    const initState = async () => {
        let shader_list = (await serverAPI.callPluginMethod("get_shader_list", {})).result as string[];
        let screensaver_list = (await serverAPI.callPluginMethod("get_screensaver_list", {})).result as string[];
        set_shader_list(shader_list)
        setShaderOptions(getShaderOptions(shader_list, baseShader));
        setScreenSaverOptions(getShaderOptions(screensaver_list, baseScreensaver));

        let curr = await serverAPI.callPluginMethod("get_current_shader", {});
        setSelectedShader({ data: curr.result, label: (curr.result == "0" ? "None" : curr.result) } as SingleDropdownOption);

        let currSS = await serverAPI.callPluginMethod("get_current_screensaver", {});
        setSelectedScreenSaver({ data: currSS.result, label: (currSS.result == "0" ? "None" : currSS.result) } as SingleDropdownOption);
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
                        await serverAPI.callPluginMethod("set_shader", { "shader_name": newSelectedShader.data });
                    }}
                />
            </PanelSectionRow>
            <PanelSectionRow>
                <b>Select Screensaver</b>
            </PanelSectionRow>
            <PanelSectionRow>
                <Dropdown
                    menuLabel="Select screensaver"
                    strDefaultLabel={selectedScreenSaver.label as string}
                    rgOptions={screenSaverOptions}
                    selectedOption={selectedScreenSaver}
                    onChange={async (newSelectedScreenSaver: DropdownOption) => {
                        await serverAPI.callPluginMethod("set_screensaver", { "shader_name": newSelectedScreenSaver.data });
                        setSelectedScreenSaver(newSelectedScreenSaver.data);
                    }}
                />
            </PanelSectionRow>
            <PanelSectionRow>
                <ButtonItem onClick={async () => {
                    console.log(selectedScreenSaver);
                    let ret = await serverAPI.callPluginMethod("apply_shader", { "screensaver": true });
                    setTimeout(() => {
                        (logic as any).screensaverActive = true;
                    }, 1000)
                }
                }>Start Screensaver</ButtonItem>
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
    let suspend_registers = [window.SteamClient.System.RegisterForOnSuspendRequest(logic.handleSuspend), window.SteamClient.System.RegisterForOnResumeFromSuspend(logic.handleSuspend)];

    return {
        title: <div className={staticClasses.Title}>Reshadeck</div>,
        content: <Content serverAPI={serverApi} logic={logic} />,
        icon: <MdWbShade />,
        onDismount() {
            input_register.unregister();
            suspend_registers[0].unregister();
            suspend_registers[1].unregister();
        },
        alwaysRender: true
    };
});
