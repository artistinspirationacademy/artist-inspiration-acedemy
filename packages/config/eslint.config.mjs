import baseConfig from "@workspace/eslint-config/base";
import tseslint from "typescript-eslint";

export default tseslint.config(...baseConfig, {
    files: ["**/*.ts"],
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
            project: "./tsconfig.json",
            tsconfigRootDir: import.meta.dirname,
        },
    },
});
