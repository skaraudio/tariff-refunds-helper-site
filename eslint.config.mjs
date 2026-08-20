import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
   baseDirectory: __dirname
});

const eslintConfig = [
   // Vendored, dependency-free prompt-improver tool — not repo source, and it makes paid Gemini calls.
   {ignores: ['test/0-ai/**']},
   ...compat.extends('next/core-web-vitals')
];

export default eslintConfig;
