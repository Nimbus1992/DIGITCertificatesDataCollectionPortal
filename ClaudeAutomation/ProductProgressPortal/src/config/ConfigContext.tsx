import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { PortalConfig } from '../types';
import { DEFAULT_CONFIG, CONFIG_KEY } from './defaults';
import { supabase } from '../lib/supabase';

const CONFIG_ROW = 'config';

interface ConfigContextValue {
  config: PortalConfig;
  saveConfig: (updates: Partial<PortalConfig>) => void;
  resetConfig: () => void;
  isConfigured: boolean;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

function loadLocal(): PortalConfig {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

async function loadRemoteConfig(): Promise<PortalConfig | null> {
  try {
    const { data: row } = await supabase
      .from('portal_state')
      .select('config')
      .eq('id', CONFIG_ROW)
      .maybeSingle();
    if (!row?.config || !row.config.spreadsheetId) return null;
    return { ...DEFAULT_CONFIG, ...row.config } as PortalConfig;
  } catch {
    return null;
  }
}

async function saveRemoteConfig(config: PortalConfig) {
  try {
    await supabase
      .from('portal_state')
      .upsert({ id: CONFIG_ROW, config, updated_at: new Date().toISOString() });
  } catch {
    // silently fail — localStorage still holds the config
  }
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PortalConfig>(loadLocal);

  // On mount: load config from Supabase
  useEffect(() => {
    loadRemoteConfig().then(remote => {
      if (remote) {
        setConfig(remote);
        localStorage.setItem(CONFIG_KEY, JSON.stringify(remote));
      }
    });
  }, []);

  const saveConfig = useCallback((updates: Partial<PortalConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
      saveRemoteConfig(next);
      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    localStorage.removeItem(CONFIG_KEY);
    setConfig(DEFAULT_CONFIG);
    saveRemoteConfig(DEFAULT_CONFIG);
  }, []);

  const isConfigured = Boolean(config.spreadsheetId);

  return (
    <ConfigContext.Provider value={{ config, saveConfig, resetConfig, isConfigured }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
