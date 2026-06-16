import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    // Mirror the tsconfig "@/*" -> "./*" path alias so tests import the same way
    // application code does.
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
