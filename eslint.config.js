// @ts-check
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...tseslint.config({
    files: ["**/*.ts"],

    // any additional configuration for these file types here
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Show error on no explicit return type to prevent from missing `FC` or
      // unexpected bugs. It's sometimes tedious when the type is complicated
      // and relying on type inference is a good idea, so ignore no return types
      // for functions used as expressions.
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "generic",
          readonly: "generic",
        },
      ],
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            {
              from: "package",
              name: ["it", "describe"],
              package: "node:test",
            },
          ],
        },
      ],
    },
  }),
  {
    files: ["**/*.js", "**/*.mjs"],
    ...eslint.configs.recommended,
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },

  // Add the Prettier config last to override any conflicting rules
  eslintConfigPrettier,
];
