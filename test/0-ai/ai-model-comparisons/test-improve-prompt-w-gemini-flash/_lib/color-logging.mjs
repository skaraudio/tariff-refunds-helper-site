// Vendored colour logger for the prompt improver. The host repo's lib/color-logging.mjs is built on chalk,
// which most repos in this fleet do not have — and importing whichever logger a repo happens to own would
// make every install different. Raw 24-bit ANSI, no dependencies, exactly the eleven names the tool imports.

const paint = (r, g, b) => (text) => console.log(`\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`);

const BABY_BLUE = [158, 209, 233];
const DIM_GRAY = [120, 120, 120];
const GRAY = [210, 210, 210];
const GREEN = [118, 175, 97];
const LIGHT_GREEN = [176, 228, 124];
const LIGHT_ORANGE = [247, 208, 175];
const LIGHT_YELLOW = [246, 243, 201];
const ORANGE = [246, 158, 0];
const RED = [255, 114, 118];
const WHITE = [255, 255, 255];

const code = ([r, g, b]) => `\x1b[38;2;${r};${g};${b}m`;
const RESET = '\x1b[0m';

export const consoleLogBabyBlue = paint(...BABY_BLUE);
export const consoleLogDimGray = paint(...DIM_GRAY);
export const consoleLogGray = paint(...GRAY);
export const consoleLogGreen = paint(...GREEN);
export const consoleLogLightGreen = paint(...LIGHT_GREEN);
export const consoleLogLightOrange = paint(...LIGHT_ORANGE);
export const consoleLogLightYellow = paint(...LIGHT_YELLOW);
export const consoleLogOrange = paint(...ORANGE);
export const consoleLogRed = paint(...RED);

// The two-argument pair. The tool calls these with a label alone in several places, so an undefined value
// must print the label and nothing else — never the string "undefined" glued to the end of a heading.
const pair = (labelColor, valueColor) => (label, value) => {
    if (value === undefined) {
        console.log(`${code(labelColor)}${label}${RESET}`);
        return;
    }
    if (typeof value === 'object' && value !== null) {
        console.log(`${code(labelColor)}${label}${RESET}`, value);
        return;
    }
    console.log(`${code(labelColor)}${label}${RESET} ${code(valueColor)}${value}${RESET}`);
};

export const consoleLogOrangeWhite = pair(ORANGE, WHITE);
export const consoleLogWhiteGreen = pair(WHITE, GREEN);
