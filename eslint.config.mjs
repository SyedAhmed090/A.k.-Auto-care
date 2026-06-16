import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The React-Compiler-era react-hooks rules (shipped with eslint-config-next 16)
    // flag many correct, intentional client patterns in this app — SSR hydration
    // guards, route-change state resets, async data-loading effects, and
    // react-hook-form's register() ref spreading. Keep them ON as warnings so the
    // signal stays visible in editors and CI logs without failing the lint gate;
    // genuine bugs they surface should still be fixed case by case.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
]);

export default eslintConfig;
