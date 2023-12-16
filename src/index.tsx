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
} from "decky-frontend-lib";
import { VFC, useState, useEffect } from "react";
import { VscDebugDisconnect } from "react-icons/vsc";
import logo from "../assets/logo.png";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [enabled, setEnabled] = useState<boolean>(false);

  const onClick = async (e) => {
      serverAPI.callPluginMethod('set_enabled', { enabled: e });
  };

  const initState = async () => {
    const getIsEnabledResponse = await serverAPI.callPluginMethod('is_enabled', {});
    setEnabled(getIsEnabledResponse.result as boolean);
  }

    useEffect(() => {
            initState();
    }, []);
  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
      <ToggleField
              label="Enable"
              checked={enabled}
              onChange={(e) => { setEnabled(e); onClick(e); }}
      />
      </PanelSectionRow>
      <PanelSectionRow>
        <div>You need to pair it first in desktop mode.</div>
      </PanelSectionRow>
      <PanelSectionRow>
        <div>Remember to turn it off when you are not using it!</div>
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
