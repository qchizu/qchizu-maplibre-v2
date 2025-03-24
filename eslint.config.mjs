import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/self-closing-comp": "error",
            "react/jsx-curly-brace-presence": "error",
            "object-shorthand": "error",
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "no-console": ["error", { allow: ["warn", "error"] }],
        },
    },
    eslintConfigPrettier,
];

export default eslintConfig;
