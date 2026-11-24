"use client";

import { useState, useEffect } from "react";
import { SettingsPanel } from "@/components/SettingsPanel";

type SettingsConfig = {
  complianceApi: string;
  vulnApi: string;
  historyApi: string;
  useGitHub: boolean;
};

const DEFAULT_CONFIG: SettingsConfig = {
  complianceApi: "",
  vulnApi: "",
  historyApi: "",
  useGitHub: true,
};

export default function SettingsPage() {
  const [config, setConfig] = useState<SettingsConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    try {
      localStorage.setItem("dash_settings", JSON.stringify(config));
    } catch {
      // Ignore storage errors
    }
    ;(global as any).COMPLIANCE_API = config.complianceApi;
    ;(global as any).VULN_API = config.vulnApi;
    ;(global as any).HISTORY_API = config.historyApi;
  }, [config]);

  return (
    <div className="settings-page">
      <h1 className="page-heading">Settings</h1>
      <SettingsPanel initialConfig={config} onConfigChange={setConfig} />
    </div>
  );
}