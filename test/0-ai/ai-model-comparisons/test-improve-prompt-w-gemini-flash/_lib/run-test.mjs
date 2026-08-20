// Vendored test bootstrap. The host repo's test/bootstrap.js loads .env with dotenv + find-up and then
// asserts on MYSQL_HOST — an assertion that is correct there and fatal in the 30-odd repos in this fleet that
// have no MySQL. This does the .env load and nothing else, with no dependencies.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));

// Nearest .env walking up from this file: the tool folder first, then the repo root, which is where these
// repos actually keep it.
const findEnvFile = (startDir) => {
    let dir = startDir;
    for (;;) {
        const candidate = path.join(dir, '.env');
        if (fs.existsSync(candidate)) return candidate;
        const parent = path.dirname(dir);
        if (parent === dir) return null;
        dir = parent;
    }
};

// A deliberately small KEY=VALUE reader rather than dotenv: strips one layer of surrounding quotes, ignores
// blanks and # comments, tolerates `export ` prefixes, and NEVER overwrites a variable already in the
// environment — a shell-exported key must win over a stale file.
const parseEnv = (text) => {
    const values = {};

    text.split(/\r?\n/).forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) return;
        const match = line.replace(/^export\s+/, '').match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (!match) return;
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"') && value.length > 1) || (value.startsWith("'") && value.endsWith("'") && value.length > 1)) {
            value = value.slice(1, -1);
        }
        values[match[1]] = value;
    });

    return values;
};

export const loadEnv = async () => {
    const file = findEnvFile(THIS_DIR);
    // A missing .env is not fatal — the key may already be exported in the environment. The tool's own
    // validateConfig throws a named error if GEMINI_API_KEY is still absent by the time it is needed.
    if (!file) return null;

    try {
        const values = parseEnv(fs.readFileSync(file, 'utf8'));
        Object.entries(values).forEach(([key, value]) => {
            if (process.env[key] === undefined) process.env[key] = value;
        });
    } catch {
        return null;
    }

    return file;
};

export const runTest = async (code) => {
    // The await here is load-bearing, not stylistic. The tool calls runTest() at module top level, and the
    // callback it passes references consts declared FURTHER DOWN that file. Awaiting suspends this function
    // so the rest of the module body finishes evaluating before the callback is invoked; calling code()
    // synchronously instead throws "Cannot access 'improvePromptWithGemini' before initialization".
    await loadEnv();

    try {
        const output = await code();
        if (output) console.dir(output, {depth: null, colors: true});
    } catch (error) {
        // Exit non-zero on failure. The reference bootstrap exits 0 even after catching — deliberately not
        // copied, because the install's verification ladder reads this exit code as its pass/fail signal.
        console.error(error?.message || error);
        if (error?.stack) console.error(error.stack);
        process.exit(1);
    }

    process.exit(0);
};
