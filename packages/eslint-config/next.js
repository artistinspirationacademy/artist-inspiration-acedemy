import js from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
    ...baseConfig,
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        ...pluginReact.configs.flat.recommended,
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.serviceworker,
            },
        },
    },
    {
        plugins: { "unused-imports": unusedImports },
        rules: {
            "unused-imports/no-unused-imports": "warn",
            "unused-imports/no-unused-vars": "warn",
        },
    },
    {
        plugins: { "@next/next": pluginNext },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs["core-web-vitals"].rules,
        },
    },
    {
        plugins: { "react-hooks": pluginReactHooks },
        settings: { react: { version: "detect" } },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
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
];
