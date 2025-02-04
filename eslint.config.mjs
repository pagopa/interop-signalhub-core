import path from "path";
import functional from "eslint-plugin-functional";
import tseslint from "typescript-eslint";
import pagopa from "@pagopa/eslint-config";
import { fileURLToPath } from "url";

export default tseslint.config({
  files: ["**/*.ts", "**/*.test.ts"],
  ignores: ["**/.eslintrc.cjs", "**/vitest.config.ts", "**/dist"],
  extends: [functional.configs.stylistic, ...pagopa],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url)),
      project: "tsconfig.eslint.json"
    }
  },
  rules: {
    "default-case": "off",

    "no-console": [
      "error",
      {
        allow: ["error"]
      }
    ],

    "prefer-arrow/prefer-arrow-functions": "off",
    eqeqeq: ["error", "smart"],
    "sort-keys": "off",
    "functional/prefer-readonly-type": "off",
    "@typescript-eslint/no-shadow": "off",
    "extra-rules/no-commented-out-code": "off",
    "functional/no-let": "warn",
    "sonarjs/no-duplicate-string": "off",
    "max-lines-per-function": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-invalid-void-type": "off",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    // Some rules inherited from pagoPA eslint config has been disabled

    "perfectionist/sort-objects": "off",
    "perfectionist/sort-arrays": "off",
    "perfectionist/sort-object-types": "off",
    "perfectionist/sort-union-types": "off",
    "prettier/prettier": ["error", { trailingComma: "none" }]
  }
});
