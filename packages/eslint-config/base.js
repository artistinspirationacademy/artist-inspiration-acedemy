import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        plugins: { turbo: turboPlugin },
        rules: { "turbo/no-undeclared-env-vars": "off" },
    },
    {
        plugins: { onlyWarn },
    },
    {
        plugins: { "unused-imports": unusedImports },
        rules: {
            "unused-imports/no-unused-imports": "warn",
            "unused-imports/no-unused-vars": "warn",
        },
    },
    {
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "no-unused-vars": "off",
            quotes: ["error", "double"],
            eqeqeq: ["error", "always"],
            "comma-spacing": [
                "error",
                {
                    before: false,
                    after: true,
                },
            ],
            "keyword-spacing": [
                "error",
                {
                    before: true,
                    after: true,
                },
            ],
            "object-curly-spacing": ["error", "always"],
            "arrow-parens": ["error", "always"],
            "no-trailing-spaces": ["error", {}],
            "no-multi-spaces": ["error", {}],
            "semi-spacing": [
                "error",
                {
                    before: false,
                    after: true,
                },
            ],
        },
    },
    {
        ignores: ["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"],
    },
];
