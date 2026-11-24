"use client";

import { useState, useEffect } from "react";

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

type RefConfig = {
  setConfig: (config: SettingsConfig) => void;
};

export function useSettingsConfig(initial: SettingsConfig): [SettingsConfig, RefConfig] {
  const [config, setConfig] = useState<SettingsConfig>(initial);

  // Sync with localStorage on client
  useEffect(() => {
    try {
      localStorage.setItem("dash_settings", JSON.stringify(config));
    } catch {
      // Ignore storage errors
    }
    // Also expose to global for API routes
    ;(global as any).COMPLIANCE_API = config.complianceApi;
    ;(global as any).VULN_API = config.vulnApi;
    ;(global as any).HISTORY_API = config.historyApi;
  }, [config]);

  return [config, { setConfig }];
}

interface SettingsPanelProps {
  initialConfig: SettingsConfig;
  onConfigChange?: (config: SettingsConfig) => void;
}

export function SettingsPanel({ initialConfig, onConfigChange }: SettingsPanelProps) {
  const [config, setConfig] = useState<SettingsConfig>(initialConfig);
  const [refs, setRefs] = useState<RefConfig>({ setConfig: () => {} });

  useSettingsConfig(config);

  const handleApiChange = (key: keyof SettingsConfig, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (onConfigChange) onConfigChange(newConfig);
  };

  const handleGitHubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfig = { ...config, useGitHub: e.target.checked };
    setConfig(newConfig);
    if (onConfigChange) onConfigChange(newConfig);
  };

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("dash_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({
          complianceApi: parsed.COMPLIANCE_API ?? "",
          vulnApi: parsed.VULN_API ?? "",
          historyApi: parsed.HISTORY_API ?? "",
          useGitHub: parsed.useGitHub !== false,
        });
      }
    } catch {
      // If localStorage fails, use initial config
    }
  };

  // Load on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  return (
    <div className="sidebar-settings">
      <div className="settings-card">
        <h3 className="settings-title">Data Sources</h3>
        <p className="settings-desc">
          Configure where the dashboard fetches data from
        </p>

        {/* Compliance API */}
        <div className="settings-group">
          <label className="settings-label">Compliance API</label>
          <div className="settings-input-wrapper">
            <input
              type="text"
              className="settings-input"
              placeholder="https://example.com/compliance"
              value={config.complianceApi}
              onChange={(e) => handleApiChange("complianceApi", e.target.value)}
            />
            <button
              className="settings-input-btn"
              onClick={() => {
                ;(global as any).COMPLIANCE_API = config.complianceApi;
              }}
            >
              Set
            </button>
          </div>
        </div>

        {/* Vulnerabilities API */}
        <div className="settings-group">
          <label className="settings-label">Vulnerabilities API</label>
          <div className="settings-input-wrapper">
            <input
              type="text"
              className="settings-input"
              placeholder="https://example.com/vulnerabilities"
              value={config.vulnApi}
              onChange={(e) => handleApiChange("vulnApi", e.target.value)}
            />
            <button className="settings-input-btn" onClick={() => {
              ;(global as any).VULN_API = config.vulnApi;
            }}>
              Set
            </button>
          </div>
        </div>

        {/* History API */}
        <div className="settings-group">
          <label className="settings-label">History API</label>
          <div className="settings-input-wrapper">
            <input
              type="text"
              className="settings-input"
              placeholder="https://example.com/history"
              value={config.historyApi}
              onChange={(e) => handleApiChange("historyApi", e.target.value)}
            />
            <button className="settings-input-btn" onClick={() => {
              ;(global as any).HISTORY_API = config.historyApi;
            }}>
              Set
            </button>
          </div>
        </div>

        {/* GitHub mode toggle */}
        <div className="settings-group">
          <label className="settings-label">
            <input
              type="checkbox"
              checked={config.useGitHub}
              onChange={handleGitHubChange}
              className="settings-checkbox"
            />
            Use GitHub (requires GITHUB_REPOSITORY + GITHUB_PAT)
          </label>
          <p className="settings-small-text">
            {config.useGitHub ? "GitHub API fallback enabled" : "Custom APIs only"}
          </p>
        </div>
      </div>
    </div>
  );
}