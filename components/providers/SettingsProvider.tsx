"use client";
import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings";

const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS);

/** Provides DB-backed settings to client components. Seeded by the root layout
 *  (server) so storefront client components can read live config without an
 *  extra fetch. Falls back to DEFAULT_SETTINGS if no provider is present. */
export function SettingsProvider({ value, children }: { value: Settings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Settings {
  return useContext(SettingsContext);
}
