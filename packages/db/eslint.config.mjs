import { config } from "@workspace/eslint-config/base";
import tseslint from "typescript-eslint";

export default tseslint.config(...config, {
    files: ["**/*.ts"],
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
            project: "./tsconfig.json",
            tsconfigRootDir: import.meta.dirname,
        },
    },
});
